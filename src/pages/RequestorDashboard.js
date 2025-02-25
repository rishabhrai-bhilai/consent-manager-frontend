import React, { useEffect, useState } from "react";
import axios from "./../api/axios";
import { useAuth } from "../context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RequestorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { auth } = useAuth();
  const userId = auth?.userId;

  const fetchRequestorData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/requestor/${userId}/getRequestorData`);
      setUserData(response.data);
    } catch (error) {
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestorData();
  }, []);

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Requestor Dashboard
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 py-6">
        {/* Requestor Card */}
        {isLoading ? (
          <div className="mt-4 mx-auto max-w-3xl bg-background dark:bg-dark-background rounded-xl shadow-md animate-pulse">
            <div className="flex flex-col sm:flex-row items-center p-6 space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex-1 space-y-3 w-full">
                <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded mx-auto sm:mx-0"></div>
                <div className="h-4 w-60 bg-gray-300 dark:bg-gray-600 rounded mx-auto sm:mx-0"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="sm:col-span-2 h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 mx-auto max-w-3xl bg-background dark:bg-dark-background rounded-xl shadow-md dark:shadow-lg overflow-hidden">
            <div className="relative flex flex-col sm:flex-row items-center p-6 sm:p-8 space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="absolute -top-4 -right-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary dark:bg-dark-primary opacity-20"></div>
              <div className="absolute top-4 right-4 text-xl sm:text-2xl text-primary dark:text-dark-primary cursor-pointer hover:text-accent dark:hover:text-dark-accent transition-colors">
                <i className="bx bx-edit"></i>
              </div>
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-md ring-2 ring-primary dark:ring-dark-primary ring-opacity-30">
                <img
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                  src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Requestor Profile"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
                  {userData?.name || "N/A"}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Email: {userData?.email || "N/A"}
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm md:text-base text-text dark:text-dark-text">
                  <div className="flex flex-col">
                    <span className="font-semibold">Type</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {userData?.type || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Registration No</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {userData?.registration_no || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Contact</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {userData?.contact_no || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Address</span>
                    <span className="text-gray-500 dark:text-gray-400 line-clamp-2">
                      {userData?.address || "N/A"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex flex-col">
                    <span className="font-semibold">Created At</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {userData?.created_at
                        ? new Date(userData.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default RequestorDashboard;