import React, { useState, useEffect } from "react";
import axios from "./../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthProvider";
import { getPrivateKey, decryptItem, decryptFileItem, arrayBufferToBase64 } from "../utils/cryptoUtils";

function UserList() {
  const [userItems, setUserItems] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState(null);
  const [viewItemType, setViewItemType] = useState(null);
  const { auth } = useAuth();
  const seekerId = auth?.userId;
  const username = auth?.user;

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      toast.warning("Please enter a valid username.");
      return;
    }

    setDetailsLoading(true);
    try {
      const response = await axios.get(`/seeker/providerItems`, {
        params: { username: searchUsername },
      });
      console.log("Search response:", response.data);
      setUserDetails({
        first_name: response.data.provider.firstname,
        last_name: response.data.provider.lastname,
        email: response.data.provider.email,
        mobile_no: response.data.provider.mobile,
        image: "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      });

      const formattedItems = response.data.items.map((item) => ({
        _id: item.itemId,
        item_name: item.item_name,
        item_type: item.item_type,
        item_value: item.item_type === "text" ? "XXXX" : null,
        item_url: null,
        status: null,
        access_count: null,
        validity_period: null,
        isViewed: false,
      }));
      console.log("Active items loaded:", formattedItems.length);
      setUserItems(formattedItems);
      toast.success(`User details and ${formattedItems.length} active items fetched successfully!`);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.message || "An error occurred.");
      setUserDetails(null);
      setUserItems([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const decryptFileUrl = async (encryptedUrl, encryptedAESKey, iv, itemId) => {
    try {
      if (!encryptedUrl) throw new Error("Encrypted URL is missing");
      if (encryptedUrl === "https://via.placeholder.com/150") {
        throw new Error("Cannot decrypt placeholder URL");
      }

      const privateKeyPem = await getPrivateKey(username);
      if (!privateKeyPem) throw new Error("Private key not found in IndexedDB");

      // Fetch the encrypted file from the backend using the seeker endpoint
      const response = await axios.get(`/seeker/${seekerId}/fetchFile?url=${encodeURIComponent(encryptedUrl)}&itemId=${itemId}`, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      const encryptedData = response.data;
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
      toast.error(error.response?.data?.message || `Failed to process file: ${error.message}`);
      return null;
    }
  };

  const handleViewItem = async (itemId) => {
    try {
      const response = await axios.post(
        `/seeker/${seekerId}/accessItem`,
        { item_id: itemId },
        { validateStatus: (status) => status >= 200 && status < 500 }
      );
      console.log("Access item response:", response.data);

      const { consent_status, message, encryptedData, encryptedUrl, encryptedAESKeyForSeeker, iv, access_count, validity_period, item_type } = response.data;

      let decryptedValue = item_type === "text" ? "XXXX" : null;
      let fileUrl = null;

      if (consent_status === "approved") {
        const privateKeyPem = await getPrivateKey(username);
        if (!privateKeyPem) throw new Error("Seeker private key not found");

        if (item_type === "text") {
          decryptedValue = await decryptItem(encryptedData, encryptedAESKeyForSeeker, iv, privateKeyPem);
        } else {
          fileUrl = await decryptFileUrl(encryptedUrl, encryptedAESKeyForSeeker, iv, itemId);
        }
      }

      setUserItems((prevState) => {
        const updatedItems = prevState.map((item) =>
          item._id === itemId
            ? {
                ...item,
                status: consent_status,
                item_value: item_type === "text" ? (consent_status === "approved" ? decryptedValue : "XXXX") : null,
                item_url: consent_status === "approved" && item_type !== "text" ? fileUrl : null,
                access_count: consent_status === "approved" ? (item_type === "text" ? access_count : access_count - 1) : null, // Reflect post-fetch count for non-text
                validity_period: consent_status === "approved" ? validity_period : null,
                isViewed: consent_status !== "pending",
              }
            : item
        );
        console.log("Updated items:", updatedItems);
        return updatedItems;
      });

      if (response.status === 200 && consent_status === "approved" && item_type !== "text" && fileUrl) {
        // Open the file in a modal for viewing
        setViewFileUrl(fileUrl);
        setViewItemType(item_type);
        setIsViewModalOpen(true);
        toast.success(`${message} Remaining accesses: ${item_type === "text" ? access_count : access_count - 1}, Valid till: ${validity_period}`);
      } else if (response.status === 200 && item_type === "text") {
        toast.success(`${message} Remaining accesses: ${access_count}, Valid till: ${validity_period}`);
      } else if (response.status === 202 || response.status === 403) {
        toast.info(message);
      } else {
        toast.warning("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error("Error accessing item:", error);
      toast.error(error.response?.data?.message || "Failed to access item.");
    }
  };

  const handleRequestConsent = async (itemId) => {
    try {
      const response = await axios.post(`/seeker/${seekerId}/requestAccessAgain`, {
        item_id: itemId,
      });
      console.log("Request consent response:", response.data);
      setUserItems((prevState) =>
        prevState.map((item) =>
          item._id === itemId
            ? { ...item, status: "pending", isViewed: false }
            : item
        )
      );
      toast.info(response.data.message);
    } catch (error) {
      console.error("Error requesting consent:", error);
      toast.error(error.response?.data?.message || "Failed to request consent.");
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    if (viewFileUrl) URL.revokeObjectURL(viewFileUrl);
    setViewFileUrl(null);
    setViewItemType(null);
  };

  return (
    <div className="mt-4 h-[100%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="px-4 py-4 w-2/5 bg-blue-50">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter Username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-1 rounded-lg shadow bg-violet-500 text-white hover:bg-violet-600 transition"
          >
            Search
          </button>
        </div>
      </div>

      {userDetails && (
        <div className="my-2 px-4 bg-blue-50">
          <div className="flex items-center bg-white p-6 rounded-lg shadow-md">
            <div className="w-24 h-24 rounded-full overflow-hidden mr-6">
              <img
                src={userDetails.image}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                {userDetails.first_name} {userDetails.last_name}
              </h2>
              <p className="text-gray-600">Email: {userDetails.email}</p>
              <p className="text-gray-600">Contact: {userDetails.mobile_no}</p>
            </div>
          </div>
        </div>
      )}

      <div className="py-4 my-1 px-4 mx-4 bg-white border-l shadow-md rounded-md">
        {detailsLoading ? (
          <p className="text-center text-gray-500">Loading user details...</p>
        ) : userItems.length > 0 || userDetails ? (
          <div>
            <ul className="mt-4 space-y-4">
              {userItems.map((item) => (
                <li
                  key={item._id}
                  className="p-4 bg-white rounded-lg shadow-md border-l-8 border-t2 border-violet-400 flex items-center justify-between"
                >
                  <span className="font-medium">
                    {item.item_name}:{" "}
                    <span className="font-normal text-gray-600">
                      {item.item_type === "text" ? item.item_value : item.item_url ? "File Available" : "XXXX"}
                      {(item.access_count !== null || item.validity_period) && (
                        <span className="ml-2 text-sm text-gray-500">
                          {item.access_count !== null && `(Remaining accesses: ${item.access_count})`}
                          {item.validity_period && `, Valid till: ${item.validity_period}`}
                        </span>
                      )}
                    </span>
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewItem(item._id)}
                      disabled={item.status === "pending" || item.isViewed}
                      className={`px-4 py-1 rounded-lg shadow ${
                        item.status === "pending" || item.isViewed
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-violet-500 text-white hover:bg-violet-600"
                      }`}
                    >
                      {item.status === "pending" ? "Pending" : "View"}
                    </button>
                    {["rejected", "revoked", "expired", "count exhausted"].includes(item.status) && (
                      <button
                        onClick={() => handleRequestConsent(item._id)}
                        disabled={item.status === "pending"}
                        className={`px-4 py-1 rounded-lg shadow ${
                          item.status === "pending"
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Request
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No user details to display. Search for a user by entering their username.</p>
        )}
      </div>

      {isViewModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Viewing File</h2>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center">
              {viewFileUrl && (
                viewItemType === "pdf" ? (
                  <iframe
                    src={viewFileUrl}
                    className="w-full h-full"
                    title="PDF Viewer"
                  />
                ) : (
                  <img
                    src={viewFileUrl}
                    alt="Viewed File"
                    className="max-w-full max-h-full object-contain"
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;