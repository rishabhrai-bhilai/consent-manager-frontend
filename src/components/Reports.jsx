import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthProvider";
import { generateAESKey, encryptFile, wrapAESKey, importRSAPublicKey, decryptFileItem, getPrivateKey } from "../utils/cryptoUtils";

const Reports = () => {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [itemType, setItemType] = useState("img");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState(null);
  const [viewItemType, setViewItemType] = useState(null);
  const { auth } = useAuth();
  const userId = auth?.userId;
  const username = auth?.user;
  console.log("Auth state in Reports:", auth);

  useEffect(() => {
    const fetchNonTextItems = async () => {
      if (!userId) {
        toast.error("User ID not found. Please log in.");
        return;
      }
      try {
        const response = await axios.get(`/provider/${userId}/getNonTextItems`);
        console.log("Fetched non-text items:", response.data);
        setItems(response.data.map(item => ({
          ...item,
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "N/A",
          displayUrl: item.encryptedUrl,
          hasFallback: false,
        })));
      } catch (error) {
        console.error("Error fetching non-text items:", error);
        toast.error("Failed to load non-text items.");
      }
    };
    fetchNonTextItems();
  }, [userId]);

  const decryptFileUrl = async (encryptedUrl, encryptedAESKey, iv) => {
    try {
      console.log("Attempting to decrypt URL:", encryptedUrl);
      if (!encryptedUrl) throw new Error("Encrypted URL is missing");
      if (encryptedUrl === "https://via.placeholder.com/150") {
        throw new Error("Cannot decrypt placeholder URL");
      }

      const privateKeyPem = await getPrivateKey(username);
      if (!privateKeyPem) throw new Error("Private key not found in IndexedDB");

      console.log("Sending fetch with token:", auth.accessToken);
      const response = await fetch(`/provider/${userId}/fetchFile?url=${encodeURIComponent(encryptedUrl)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
          "Authorization": `Bearer ${auth.accessToken}`,
        },
      });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);

      const encryptedBlob = await response.blob();
      console.log("Received blob size:", encryptedBlob.size);
      const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
      const encryptedData = new Uint8Array(encryptedArrayBuffer).buffer;
      console.log("Encrypted data size:", encryptedData.byteLength);

      const decryptedData = await decryptFileItem(arrayBufferToBase64(encryptedData), encryptedAESKey, iv, privateKeyPem);
      console.log("Decrypted data size:", decryptedData.byteLength);

      const mimeType = encryptedUrl.includes(".pdf") ? "application/pdf" : "image/jpeg";
      const blob = new Blob([decryptedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      console.log("Decrypted URL created:", url);
      return url;
    } catch (error) {
      console.error("Error in decryptFileUrl:", error.message);
      toast.error(`Failed to process file: ${error.message}`);
      return null;
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    try {
      const aesKey = await generateAESKey();
      const { encryptedData, iv } = await encryptFile(file, aesKey);
      const userDataResponse = await axios.get(`/provider/${userId}/getUserData`);
      const providerPublicKey = userDataResponse.data.publicKey;
      const rsaPublicKey = await importRSAPublicKey(providerPublicKey);
      const encryptedAESKey = await wrapAESKey(aesKey, rsaPublicKey);

      const formData = new FormData();
      formData.append("file", new Blob([encryptedData], { type: file.type }), file.name);
      formData.append("item_name", file.name);
      formData.append("item_type", itemType);
      formData.append("encryptedAESKey", encryptedAESKey);
      formData.append("iv", iv);

      const response = await axios.post(`/provider/${userId}/addFileItem`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", response.data);
      toast.success("File uploaded successfully!");
      setItems([...items, {
        itemId: response.data.itemId,
        item_name: file.name,
        item_type: itemType,
        encryptedUrl: response.data.encryptedUrl,
        displayUrl: response.data.encryptedUrl,
        encryptedAESKey,
        iv,
        date: new Date().toLocaleDateString("en-GB"),
        hasFallback: false,
      }]);
      setFile(null);
      setItemType("img");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file: " + error.message);
    }
  };

  const handleDownload = async (encryptedUrl, itemName, encryptedAESKey, iv) => {
    try {
      const decryptedUrl = await decryptFileUrl(encryptedUrl, encryptedAESKey, iv);
      if (!decryptedUrl) return;

      const link = document.createElement("a");
      link.href = decryptedUrl;
      link.download = itemName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(decryptedUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file.");
    }
  };

  const handleView = async (encryptedUrl, encryptedAESKey, iv, itemType) => {
    try {
      const decryptedUrl = await decryptFileUrl(encryptedUrl, encryptedAESKey, iv);
      if (!decryptedUrl) return;

      setViewFileUrl(decryptedUrl);
      setViewItemType(itemType);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Failed to view file.");
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/provider/${userId}/deleteItem`, { data: { itemId } });
      setItems(items.filter((item) => item.itemId !== itemId));
      toast.success("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item.");
    }
  };

  const handleImageError = (itemId) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.itemId === itemId && !item.hasFallback
          ? { ...item, displayUrl: "https://via.placeholder.com/150", hasFallback: true }
          : item
      )
    );
  };

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    if (viewFileUrl) URL.revokeObjectURL(viewFileUrl);
    setViewFileUrl(null);
    setViewItemType(null);
  };

  return (
    <>
      <ToastContainer />
      <div class="bg-white rounded-md mt-4 flex flex-row flex-wrap gap-1 sm:gap-2 p-4 sm:flex-col">
        <div class="flex bg-bluve-50 border-b-2 border-violet-800 font-medium text-blue-950">
          <span class="p-2 sm:text-lg">Medical</span>
          <span class="p-2 sm:text-lg">Access</span>
          <span class="p-2 sm:text-lg">History</span>
        </div>

        <div class="bgc-slate-400 w-full items-center gap-1 p-2 flex flex-row">
          <div class="bg-fslate-500 min-w-40 flex justify-center">
            <div class="flex w-full p-1 justify-cventer">
              <div class="w-full">
                <select
                  class="form-select m-0 block w-full appearance-none rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                  aria-label="Default select example"
                >
                  <option selected>All Reports</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
            </div>
          </div>
          <div class="bgs-slate-500 flex justify-center">
            <div class="relative" id="input">
              <input
                value=""
                placeholder="Search..."
                class="block w-full text-sm h-10 px-4 text-slate-900 bg-white rounded-[8px] border border-gray-300 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-primary focus:ring-0 hover:border-brand-500-secondary- peer invalid:border-error-500 invalid:focus:border-error-500 overflow-ellipsis overflow-hidden text-nowrap pr-[48px]"
                id="floating_outlined"
                type="text"
              />
              <div class="absolute top-2 right-3">
                <i class="bx bx-search bx-sm text-blue-500"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="bgs-slate-400 hidden w-full items-center gap-1 p-2 sm:flex">
          <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Images</span></div>
          <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Name</span></div>
          <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>DocType</span></div>
          <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Date</span></div>
          <div class="bgs-slate-500 flex basis-2/6 justify-center">none</div>
        </div>

        {items.map((item) => (
          <div key={item.itemId} class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-gray-50 shadow p-2 sm:w-full sm:flex-row">
            <div class="bgs-slate-500 flex basis-1/6 justify-center">
              <img
                class="w-64 sm:max-w-20 object-cover sm:w-3/4"
                src={item.displayUrl}
                alt={item.item_name}
                onError={() => handleImageError(item.itemId)}
              />
            </div>
            <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>{item.item_name}</span></div>
            <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>{item.item_type}</span></div>
            <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>{item.date}</span></div>
            <div class="bgs-slate-500 flex basis-2/6 justify-center gap-3">
              <div class="flex">
                <span><i class="bx bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
              </div>
              <div class="flex">
                <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
              </div>
              <div class="flex">
                <span onClick={() => handleDownload(item.encryptedUrl, item.item_name, item.encryptedAESKey, item.iv)}>
                  <i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5 cursor-pointer"></i>
                </span>
              </div>
              <div class="flex">
                <span onClick={() => handleView(item.encryptedUrl, item.encryptedAESKey, item.iv, item.item_type)}>
                  <i class="bx bx-show text-blue-800 bg-blue-100 p-1.5 cursor-pointer"></i>
                </span>
              </div>
              <div class="flex">
                <span onClick={() => handleDelete(item.itemId)}>
                  <i class="bx bx-trash text-red-700 bg-red-300 p-1.5 cursor-pointer"></i>
                </span>
              </div>
            </div>
          </div>
        ))}

        <div class="fixed bottom-4 right-4">
          <button
            onClick={() => setIsModalOpen(true)}
            class="w-12 h-12 bg-violet-500 text-white rounded-full flex items-center justify-center text-2xl hover:bg-violet-600"
          >
            +
          </button>
        </div>

        {isModalOpen && (
          <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 class="text-lg font-medium mb-4">Upload File</h2>
              <div class="mb-4">
                <label class="block mb-2">File Type:</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  class="w-full p-2 border rounded"
                >
                  <option value="img">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block mb-2">Select File:</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                  class="w-full p-2 border rounded"
                />
              </div>
              <div class="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  class="px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
                  disabled={!file}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && (
          <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div class="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-auto">
              <div class="flex justify-between items-center p-4 border-b">
                <h2 class="text-lg font-medium">Viewing File</h2>
                <button
                  onClick={closeViewModal}
                  class="text-gray-500 hover:text-red-500 text-2xl"
                >
                  ×
                </button>
              </div>
              <div class="flex-1 p-4 flex items-center justify-center">
                {viewFileUrl && (
                  viewItemType === "pdf" ? (
                    <iframe
                      src={viewFileUrl}
                      class="w-full h-full"
                      title="PDF Viewer"
                    />
                  ) : (
                    <img
                      src={viewFileUrl}
                      alt="Viewed File"
                      class="max-w-full max-h-full object-contain"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;