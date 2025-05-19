import React, { useEffect, useState } from "react";
import axios from "./../api/axios";
import { useAuth } from "../context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPrivateKey,
  encryptData,
  decryptItem,
  generateAESKey,
  importRSAPublicKey,
  wrapAESKey,
} from "../utils/cryptoUtils";

const Dashboard = () => {
  const [formData, setFormData] = useState({
    item_name: "",
    encryptedData: "",
    item_id: null,
    encryptedAESKey: null,
    iv: null,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const { auth } = useAuth();
  const userId = auth?.userId;
  const username = auth?.user;

  const fetchUserDataAndItems = async () => {
    setIsLoading(true);
    try {
      const userResponse = await axios.get(`/provider/${userId}/getUserData`);
      console.log("User Data Response:", userResponse.data);
      setUserData(userResponse.data);

      const itemsResponse = await axios.get(`/provider/${userId}/getItems`);
      console.log("Text Items Response:", itemsResponse.data);
      const privateKeyPem = await getPrivateKey(username);
      if (!privateKeyPem) throw new Error("Private key not found in IndexedDB.");

      const decryptedItems = await Promise.all(
        itemsResponse.data.map(async (item) => {
          const decryptedValue = await decryptItem(item.encryptedData, item.encryptedAESKey, item.iv, privateKeyPem);
          return {
            item_id: item.itemId,
            item_name: item.item_name,
            item_value: decryptedValue,
            encryptedAESKey: item.encryptedAESKey,
            iv: item.iv,
          };
        })
      );

      setKeyValuePairs(decryptedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && username) {
      fetchUserDataAndItems();
    }
  }, [userId, username]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({ item_name: "", encryptedData: "", item_id: null, encryptedAESKey: null, iv: null });
    setIsOpen(false);
  };

  const encryptDataWithWebCrypto = async (data, existingEncryptedAESKey = null, existingIV = null) => {
    try {
      let aesKey, iv, encryptedAESKey;

      if (existingEncryptedAESKey && existingIV) {
        const privateKeyPem = await getPrivateKey(username);
        if (!privateKeyPem) throw new Error("Private key not found.");
        const rsaPrivateKey = await crypto.subtle.importKey(
          "pkcs8",
          base64ToArrayBuffer(privateKeyPem.replace("-----BEGIN PRIVATE KEY-----\n", "").replace("\n-----END PRIVATE KEY-----", "").trim()),
          { name: "RSA-OAEP", hash: "SHA-256" },
          false,
          ["decrypt"]
        );
        const encryptedKeyBuffer = base64ToArrayBuffer(existingEncryptedAESKey);
        const decryptedKey = await crypto.subtle.decrypt(
          { name: "RSA-OAEP" },
          rsaPrivateKey,
          encryptedKeyBuffer
        );
        aesKey = await crypto.subtle.importKey(
          "raw",
          decryptedKey,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        iv = existingIV;
        encryptedAESKey = existingEncryptedAESKey;
      } else {
        aesKey = await generateAESKey();
        const publicKeyPem = userData?.publicKey;
        if (!publicKeyPem) throw new Error("Public key not found in user data.");
        const rsaPublicKey = await importRSAPublicKey(publicKeyPem);
        encryptedAESKey = await wrapAESKey(aesKey, rsaPublicKey);
        iv = null;
      }

      const { encryptedData, iv: newIV } = await encryptData(data, aesKey, iv);
      iv = iv || newIV;

      return { encryptedData, encryptedAESKey, iv };
    } catch (error) {
      console.error("Encryption Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { encryptedData, encryptedAESKey, iv } = await encryptDataWithWebCrypto(
        formData.encryptedData,
        formData.encryptedAESKey,
        formData.iv
      );
      let response;

      if (formData.item_id) {
        response = await axios.put(`/provider/${userId}/editItem`, {
          itemId: formData.item_id,
          item_name: formData.item_name,
          item_type: "text",
          encryptedData,
          encryptedAESKey,
          iv,
        });
        if (response.status === 200) {
          toast.success(`Item "${formData.item_name}" updated successfully!`);
          setKeyValuePairs(
            keyValuePairs.map((it) =>
              it.item_id === formData.item_id
                ? { ...it, item_name: formData.item_name, item_value: formData.encryptedData }
                : it
            )
          );
        }
      } else {
        response = await axios.post(`/provider/${userId}/addItems`, {
          item_name: formData.item_name,
          item_type: "text",
          encryptedData,
          encryptedAESKey,
          iv,
        });
        if (response.status === 201) {
          toast.success(`Item "${formData.item_name}" added successfully!`);
          setKeyValuePairs([
            ...keyValuePairs,
            {
              item_id: response.data.itemId,
              item_name: formData.item_name,
              item_value: formData.encryptedData,
              encryptedAESKey,
              iv,
            },
          ]);
        }
      }
      handleCancel();
    } catch (error) {
      console.error("Error handling item:", error);
      toast.error(`An error occurred: ${error.message}. Please try again.`);
    }
  };

  const handleDelete = async (itemId, itemName) => {
    try {
      const response = await axios.delete(`/provider/${userId}/deleteItem`, {
        data: { itemId },
      });
      if (response.status === 200) {
        toast.success(`Item "${itemName}" deleted successfully!`);
        setKeyValuePairs(keyValuePairs.filter((item) => item.item_id !== itemId));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      item_name: item.item_name,
      encryptedData: item.item_value,
      item_id: item.item_id,
      encryptedAESKey: item.encryptedAESKey,
      iv: item.iv,
    });
    setIsOpen(true);
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Dashboard
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 pb-8">
        <div className="title mt-4 flex rounded-md bg-background dark:bg-dark-background shadow-md dark:shadow-lg">
          <div className="relative flex w-full flex-col sm:flex-row items-center overflow-hidden rounded-md bg-background dark:bg-dark-background p-6 shadow-lg sm:items-start">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary dark:bg-dark-primary opacity-20 sm:h-24 sm:w-24"></div>
            <div className="absolute top-2 right-2 text-xl sm:text-2xl md:text-3xl text-primary dark:text-dark-primary cursor-pointer">
              <i className="bx bx-edit"></i>
            </div>
            <div className="relative flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-md">
                <img
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                  src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="User Profile"
                />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
                  {userData?.first_name || "N/A"} {userData?.last_name || "N/A"}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Email: {userData?.email || "N/A"}
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm md:text-base text-text dark:text-dark-text">
                  <p>
                    Age:{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-[0.65rem] sm:text-xs md:text-sm">
                      {userData?.age || "N/A"}
                    </span>
                  </p>
                  <p>
                    Contact:{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-[0.65rem] sm:text-xs md:text-sm">
                      {userData?.mobile_no || "N/A"}
                    </span>
                  </p>
                  <p className="sm:col-span-2">
                    DOB:{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-[0.65rem] sm:text-xs md:text-sm">
                      {userData?.date_of_birth
                        ? new Date(userData.date_of_birth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex card shadow-xl dark:shadow-lg border-0 flex-wrap mt-2 gap-2 justify-between">
          <div className="relative rounded-md mt-4 w-full space-y-0 overflow-hidden bg-secondary dark:bg-dark-background shadow-md dark:shadow-lg">
            <div className="w-full flex justify-between bg-secondary dark:bg-dark-background p-4 border-b border-secondary dark:border-dark-secondary">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text dark:text-dark-text">
                Vault Data (Text Items)
              </h3>
              <span className="text-md sm:text-md md:text-base text-primary dark:text-gray-400">
                {keyValuePairs.length} Items
              </span>
            </div>
            <div className="flex flex-wrap w-full mt-4 gap-4 p-4 bg-secondary dark:bg-dark-background rounded-md">
              {keyValuePairs.map(({ item_id, item_name, item_value }) => (
                <div
                  key={item_id}
                  className="flex items-center bg-background justify-between gap-2 border border-secondary dark:border-dark-secondary p-3 rounded-lg shadow-md w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs sm:text-sm md:text-base text-text dark:text-dark-text">
                      {item_name}
                    </span>
                    <span className="text-[0.65rem] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {item_value}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <i
                      className="bx bx-trash text-lg sm:text-lg md:text-xl text-red-500 dark:text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-500"
                      onClick={() => handleDelete(item_id, item_name)}
                    ></i>
                    <i
                      className="bx bx-edit text-lg sm:text-lg md:text-xl text-primary dark:text-dark-primary cursor-pointer hover:text-accent dark:hover:text-dark-accent"
                      onClick={() =>
                        handleEdit({
                          item_id,
                          item_name,
                          item_value,
                          encryptedAESKey: keyValuePairs.find((i) => i.item_id === item_id).encryptedAESKey,
                          iv: keyValuePairs.find((i) => i.item_id === item_id).iv,
                        })
                      }
                    ></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-lg z-50">
          <div className="w-11/12 max-w-sm sm:max-w-lg p-6 sm:p-10 bg-background dark:bg-dark-background rounded-lg shadow-lg dark:shadow-xl relative">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-text dark:text-dark-text mb-6">
              {formData.item_id ? "Edit Item" : "Add New Item"}
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="Key"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange("item_name", e.target.value)}
                  className="w-full text-xs sm:text-sm md:text-base h-[50px] px-4 text-text dark:text-dark-text bg-background dark:bg-dark-background rounded-[8px] border border-gray-400 dark:border-dark-secondary focus:border-primary dark:focus:border-dark-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={formData.encryptedData}
                  onChange={(e) => handleInputChange("encryptedData", e.target.value)}
                  className="w-full text-xs sm:text-sm md:text-base h-[50px] px-4 text-text dark:text-dark-text bg-background dark:bg-dark-background rounded-[8px] border border-gray-400 dark:border-dark-secondary focus:border-primary dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-row-reverse gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-fit rounded-lg text-xs sm:text-sm md:text-base px-5 py-2 h-[50px] bg-primary hover:bg-accent dark:hover:bg-dark-accent text-white focus:ring-4 focus:ring-accent dark:focus:ring-dark-accent transition-all duration-300 shadow-md dark:shadow-lg"
                >
                  {formData.item_id ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-fit rounded-lg text-xs sm:text-sm md:text-base px-5 py-2 h-[50px] bg-transparent border border-primary dark:border-primary text-primary dark:text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all duration-300 shadow-md dark:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-base sm:text-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
              onClick={handleCancel}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-primary text-white shadow-lg dark:shadow-xl hover:bg-accent dark:hover:bg-dark-accent transition"
        onClick={() => {
          setFormData({ item_name: "", encryptedData: "", item_id: null, encryptedAESKey: null, iv: null });
          setIsOpen(true);
        }}
      >
        <i className="bx bx-plus bx-sm bg-sslate-400 left-2/4 top-2/4 translate-x-2/4 translate-y-2/4 rounded-full"></i>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;