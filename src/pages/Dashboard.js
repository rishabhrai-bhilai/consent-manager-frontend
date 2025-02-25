import React, { useEffect, useState } from "react";
import axios from "./../api/axios";
import { useAuth } from "../context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    item_id: null,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const { auth } = useAuth();
  const userId = auth?.userId;

  const fetchUserDataAndItems = async () => {
    setIsLoading(true);
    try {
      const userResponse = await axios.get(`/individual/${userId}/getUserData`);
      setUserData(userResponse.data);

      const itemsResponse = await axios.get(`/individual/${userId}/getItems`);
      console.log("Items Response:", itemsResponse.data);
      const filteredData = itemsResponse.data.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_value: item.item_value,
      }));
      setKeyValuePairs(filteredData);
    } catch (error) {
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndItems();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({ key: "", value: "", item_id: null });
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (formData.item_id) {
        response = await axios.post(`/individual/${userId}/editItems`, {
          itemId: formData.item_id,
          item_name: formData.key,
          item_value: formData.value,
        });
        if (response.status === 200) {
          toast.success(`Item "${formData.key}" updated successfully!`);
          setKeyValuePairs(
            keyValuePairs.map((it) =>
              it.item_id === formData.item_id
                ? { ...it, item_name: formData.key, item_value: formData.value }
                : it
            )
          );
        }
      } else {
        response = await axios.post(`/individual/${userId}/addItems`, {
          item_name: formData.key,
          item_value: formData.value,
        });
        if (response.status === 201) {
          toast.success(`Item "${formData.key}" added successfully!`);
          setKeyValuePairs([
            ...keyValuePairs,
            {
              item_id: response.data.item_id,
              item_name: formData.key,
              item_value: formData.value,
            },
          ]);
        }
      }
      handleCancel();
    } catch (error) {
      console.error("Error handling item:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (itemId, itemName) => {
    try {
      const response = await axios.post(`/individual/${userId}/deleteItems`, {
        itemId: itemId,
      });
      if (response.status === 200) {
        toast.success(`Item "${itemName}" deleted successfully!`);
        setKeyValuePairs(
          keyValuePairs.filter((item) => item.item_id !== itemId)
        );
      } else {
        toast.error("Failed to delete item. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      key: item.item_name,
      value: item.item_value,
      item_id: item.item_id,
    });
    setIsOpen(true);
  };

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Dashboard
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 pb-8">
        {/* User Card */}
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

        {/* Key-Value Pairs Card */}
        <div className="flex card sshadow-xl dark:shadow-lg border-0 flex-wrap mt-2 gap-2 justify-between">
          <div className="relative rounded-md mt-4 w-full space-y-0 overflow-hidden bg-secondary dark:bg-dark-background sshadow-md dark:shadow-lg">
            <div className="w-full flex justify-between bg-secondary dark:bg-dark-background p-4 border-b border-secondary dark:border-dark-secondary">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text dark:text-dark-text">
                Vault Data
              </h3>
              <span className="text-md sm:text-md md:text-base text-primary dark:text-gray-400">
                {keyValuePairs.length} Items
              </span>
            </div>
            <div className="flex flex-wrap w-full mtxx-4 gap-4 p4 bg-secondary dark:bg-dark-background rounded-md">
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
                      onClick={() => handleEdit({ item_id, item_name, item_value })}
                    ></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
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
                  value={formData.key}
                  onChange={(e) => handleInputChange("key", e.target.value)}
                  className="w-full text-xs sm:text-sm md:text-base h-[50px] px-4 text-text dark:text-dark-text bg-background dark:bg-dark-background rounded-[8px] border border-gray-400 dark:border-dark-secondary focus:border-primary dark:focus:border-dark-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
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

      {/* Add Item Button */}
      <div
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-primary text-white shadow-lg dark:shadow-xl hover:bg-accent dark:hover:bg-dark-accent transition"
        onClick={() => {
          setFormData({ key: "", value: "", item_id: null });
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