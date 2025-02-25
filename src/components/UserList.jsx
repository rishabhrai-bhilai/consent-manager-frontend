import React, { useState, useEffect } from "react";
import axios from "./../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthProvider";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

function UserList() {
  const [userItems, setUserItems] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const { auth } = useAuth();
  const seekerId = auth?.userId;

  useEffect(() => {
    console.log("UserList mounted or updated. searchUsername:", searchUsername);
  }, [searchUsername]);

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      toast.warning("Please enter a valid username.");
      return;
    }

    console.log("handleSearch triggered with username:", searchUsername);
    setDetailsLoading(true);
    try {
      const response = await axios.post(`/requestor/check-consent`, {
        providerName: searchUsername,
        seekerName: auth?.user,
      });
      console.log("Search response:", response.data);

      if (!response.data || !response.data.publicData) {
        throw new Error("Invalid response structure from API");
      }

      setUserDetails({
        first_name: response.data.publicData.firstName,
        middle_name: response.data.publicData.middleName,
        last_name: response.data.publicData.lastName,
        email: response.data.publicData.email,
        mobile_no: response.data.publicData.mobileNo,
        age: response.data.publicData.age,
        image: response.data.publicData.image || "https://via.placeholder.com/150",
      });

      if (!response.data.items || !Array.isArray(response.data.items)) {
        console.warn("Items missing or not an array:", response.data.items);
        setUserItems([]);
      } else {
        console.log("Mapping items:", response.data.items);
        const formattedItems = response.data.items.map((item) => {
          console.log("Processing item:", item);
          return {
            _id: item.itemId,
            item_name: item.itemName,
            item_value: "XXXX",
            status: item.status || null,
            access_count: item.accessCount || null,
            validity_period: item.validityPeriod || null,
            isViewed: false,
          };
        });
        console.log("Formatted items:", formattedItems);
        setUserItems(formattedItems);
      }

      toast.success(`User details fetched successfully!`);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response) {
        if (error.response.status === 404) {
          toast.error(error.response.data.message || "No user found.");
        } else {
          toast.error("An error occurred while fetching user details.");
        }
      } else {
        toast.error(error.message || "An error occurred.");
      }
      setUserDetails(null);
      setUserItems([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewItem = async (itemId) => {
    try {
      console.log("handleViewItem triggered for itemId:", itemId);
      const response = await axios.post(`/requestor/${seekerId}/accessItem`, {
        item_id: itemId,
      });
      console.log("View item response:", response.data);

      if (response.status === 200) {
        const formattedValidity = formatDate(response.data.validity_period);
        setUserItems((prevState) =>
          prevState.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  item_value: response.data.item_value,
                  access_count: response.data.access_count,
                  validity_period: response.data.validity_period,
                  status: response.data.status,
                  isViewed: true,
                }
              : item
          )
        );
        console.log("Item updated after view:", { itemId, status: response.data.status });
        toast.success(
          `Item ${response.data.item_name} accessed! Remaining accesses: ${response.data.access_count}, Valid till: ${formattedValidity}`
        );
      } else if (response.status === 202) {
        setUserItems((prevState) =>
          prevState.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  status: response.data.status, // Use status from response
                  isViewed: response.data.status === "rejected" || response.data.status === "revoked" || response.data.status === "pending", // Disable View for rejected/revoked/pending
                }
              : item
          )
        );
        console.log("Item updated after 202:", { itemId, status: response.data.status });
        toast.info(response.data.message || "Access request sent.");
      } else if (response.status === 403) {
        setUserItems((prevState) =>
          prevState.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  status: response.data.status,
                  isViewed: true,
                }
              : item
          )
        );
        console.log("Item updated after 403:", { itemId, status: response.data.status });
        toast.info(response.data.message);
      } else {
        console.warn("Unexpected response status:", response.status);
        toast.warning("Unexpected response. Try again.");
      }
    } catch (error) {
      console.error("Error accessing item:", error);
      toast.error("Failed to access item.");
    }
  };

  const handleRequestConsent = async (itemId) => {
    try {
      console.log("handleRequestConsent triggered for itemId:", itemId);
      const response = await axios.post(`/requestor/${seekerId}/accessItem`, {
        item_id: itemId,
      });
      console.log("Request consent response:", response.data);

      if (response.status === 202) {
        setUserItems((prevState) =>
          prevState.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  status: "pending",
                  isViewed: true,
                }
              : item
          )
        );
        console.log("Item updated to pending after request:", { itemId });
        toast.info("Permission request sent");
      } else {
        console.warn("Unexpected response status:", response.status);
        toast.warning("Unexpected response. Try again.");
      }
    } catch (error) {
      console.error("Error requesting consent:", error);
      toast.error("Failed to request consent.");
    }
  };

  return (
    <div className="mt-4 h-[100%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
                {userDetails.first_name} {userDetails.middle_name} {userDetails.last_name}
              </h2>
              <p className="text-gray-600">Email: {userDetails.email}</p>
              <p className="text-gray-600">Contact: {userDetails.mobile_no}</p>
              <p className="text-gray-600">Age: {userDetails.age}</p>
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
                      {item.item_value}
                      {item.access_count !== null && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Remaining accesses: {item.access_count}, Valid till: {formatDate(item.validity_period)})
                        </span>
                      )}
                    </span>
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewItem(item._id)}
                      disabled={item.isViewed || item.status === "pending"}
                      className={`px-4 py-1 rounded-lg shadow ${
                        item.isViewed || item.status === "pending"
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-violet-500 text-white hover:bg-violet-600"
                      }`}
                    >
                      {item.status === "pending" ? "Pending" : "View"}
                    </button>
                    {item.status && ["rejected", "revoked", "count exhausted", "expired"].includes(item.status) && (
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

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default UserList;