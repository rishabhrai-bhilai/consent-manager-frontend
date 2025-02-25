import React, { useState, useEffect } from "react";
import axios from "./../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthProvider";

const NotificationPage = () => {
  const [consentList, setConsentList] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedConsentId, setSelectedConsentId] = useState(null);
  const [accessCount, setAccessCount] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const { auth } = useAuth();
  const userId = auth?.userId;

  useEffect(() => {
    const fetchConsentList = async () => {
      if (!userId) {
        toast.error("User ID not found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(`/individual/${userId}/getConsentListByUserId`);
        console.log("Pending consents received:", response.data);
        setConsentList(response.data);
      } catch (error) {
        console.error("Error fetching consent list:", error);
        toast.error("Failed to load pending consent requests.");
      }
    };

    fetchConsentList();
  }, [userId]);

  const handleConsent = async (consentId, action) => {
    if (action === "yes") {
      setSelectedConsentId(consentId);
      setIsPopupOpen(true);
    } else {
      try {
        const response = await axios.post("/individual/giveConsent", {
          consent_id: consentId,
          consent: action,
        });
        toast.success(response.data.message);
        refreshConsentList();
      } catch (error) {
        console.error(`Error ${action === "no" ? "rejecting" : "processing"} consent:`, error);
        toast.error(`Failed to ${action === "no" ? "reject" : "process"} consent.`);
      }
    }
  };

  const handleSubmitConsent = async () => {
    if (!accessCount || !validityDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post("/individual/giveConsent", {
        consent_id: selectedConsentId,
        consent: "yes",
        count: accessCount,
        validity: validityDate,
      });

      toast.success(response.data.message);
      setIsPopupOpen(false);
      setAccessCount("");
      setValidityDate("");
      refreshConsentList();
    } catch (error) {
      console.error("Error giving consent:", error);
      toast.error("Failed to give consent.");
    }
  };

  const refreshConsentList = async () => {
    try {
      const response = await axios.get(`/individual/${userId}/getConsentListByUserId`);
      setConsentList(response.data);
    } catch (error) {
      console.error("Error refreshing consent list:", error);
      toast.error("Failed to refresh consent list.");
    }
  };

  const pendingConsents = consentList.filter((consent) => consent.status === "pending");

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Pending Notifications
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 pb-8">
        {pendingConsents.length > 0 ? (
          <div className="space-y-4">
            {pendingConsents.map((consent) => (
              <div
                key={consent.consent_id}
                className="bg-white rounded-lg shadow-sm border border-outlines overflow-hidden"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-secondary rounded-full">
                      <i className="bx bx-bell text-xl text-yellow-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-text dark:text-dark-text text-sm font-medium">
                        {consent.seeker_email || "Unknown Seeker"}
                      </p>
                      <p className="text-text dark:text-dark-text text-xs">
                        wants <span className="font-medium">{consent.item_name || "Unknown Item"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-text dark:text-dark-text mb-3">
                    <p>
                      Status: <span className="font-semibold text-yellow-600 uppercase">Pending</span>
                    </p>
                    <p>Requested by: {consent.seeker_name || "N/A"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-primary text-white py-1 px-2 rounded-md hover:bg-accent transition-colors text-xs"
                      onClick={() => handleConsent(consent.consent_id, "yes")}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 border-2 border-primary text-primary py-1 px-2 rounded-md hover:bg-secondary transition-colors text-xs"
                      onClick={() => handleConsent(consent.consent_id, "no")}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-start sm:p-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-secondary rounded-full">
                      <i className="uppercase bx bx-bell font-semibold text-yellow-600"></i>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text dark:text-dark-text">
                        <span className="font-medium">{consent.seeker_email || "Unknown Seeker"}</span>{" "}
                        has requested access to{" "}
                        <span className="font-medium">{consent.item_name || "Unknown Item"}</span>.
                      </p>
                      <p className="text-sm text-text dark:text-dark-text mt-2">
                        Status: <span className="font-semibold text-yellow-600 uppercase">Pending</span>
                      </p>
                      <p className="text-sm text-text dark:text-dark-text mt-1">
                        Requested by: <span className="font-medium">{consent.seeker_name || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="bg-primary text-white px-4 py-1 rounded-lg hover:bg-accent transition-colors flex items-center"
                      onClick={() => handleConsent(consent.consent_id, "yes")}
                    >
                      Accept
                    </button>
                    <button
                      className="border-2 border-primary text-primary px-4 py-1 rounded-lg hover:bg-secondary transition-colors flex items-center"
                      onClick={() => handleConsent(consent.consent_id, "no")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text dark:text-dark-text py-4">No pending requests.</p>
        )}
      </div>

      <ToastContainer />

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-text dark:text-dark-text mb-4">Give Consent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                  Access Count
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-outlines rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={accessCount}
                  onChange={(e) => setAccessCount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                  Validity Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-outlines rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                />
              </div>
              <div className="flex gap-3 sm:space-x-4 flex-col sm:flex-row">
                <button
                  className="w-full bg-text text-white py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsPopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={handleSubmitConsent}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;