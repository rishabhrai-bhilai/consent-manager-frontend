import React, { useEffect, useState } from 'react';
import axios from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Reusable List Component with Modern Accordion
const RequestList = ({ requests, onApprove, onReject }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (requests.length === 0) {
    return (
      <p className="text-center text-sm font-medium text-text dark:text-dark-text opacity-80">
        No Pending Requests
      </p>
    );
  }

  return (
    <div className="space-y-4 r-max-w-3xl r-mx-auto">
      {requests.map((request) => (
        <div
          key={request._id}
          className="bg-white dark:bg-dark-background-black border border-outlines dark:border-dark-background-grey rounded-lg shadow-sm p-3 sm:p-4 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Accordion Toggle */}
            <button
              onClick={() => toggleExpand(request._id)}
              className="flex items-center justify-center w-7 h-7 text-text dark:text-dark-text rounded-full hover:text-accent dark:hover:text-dark-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-dark-accent"
              aria-label="Toggle details"
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-xs transform transition-transform duration-300 ${
                  expandedId === request._id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Request Summary */}
            <div className="flex-grow space-y-1 sm:ml-4">
              <h3 className="text-base font-semibold text-text dark:text-dark-text leading-tight">
                {request.first_name ? `${request.first_name} ${request.last_name || ''}` : request.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {request.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mobile: {request.mobile_no || request.contact_no}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(request._id)}
                className="px-4 py-1.5 border-2 border-accent dark:border-dark-accent text-accent dark:text-dark-accent text-sm font-medium rounded hover:bg-accent hover:text-white dark:hover:bg-dark-accent dark:hover:text-dark-text focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent dark:focus:ring-dark-accent transition-all duration-200"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request._id)}
                className="px-4 py-1.5 bg-primary dark:bg-dark-primary text-white text-sm font-medium rounded shadow-sm hover:bg-accent dark:hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Expandable Details */}
          {expandedId === request._id && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-dark-background-grey rounded-md shadow-inner transition-all duration-300 ease-in-out">
              <h4 className="text-sm font-semibold text-text dark:text-dark-text mb-2">Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text dark:text-dark-text">
                {Object.entries(request).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 break-words">
                      {typeof value === 'object' && value !== null ? (
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        value?.toString() || 'N/A'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// PendingRequest Component
const PendingRequest = ({ type }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'individual'
          ? '/admin/getProviderBackLog'
          : '/admin/getSeekerBackLog';

        const response = await axios.get(endpoint, { signal: abortController.signal });
        setRequests(response.data.data || []);
        console.log(response.data.data);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching pending requests:', error);
          toast.error('Error fetching requests');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      abortController.abort();
    };
  }, [type]);

  const handleApprove = async (id) => {
    try {
      const endpoint = type === 'individual' ? '/admin/approval/provider' : '/admin/approval/seeker';
      const paramName = type === 'individual' ? 'providerId' : 'seekerId';
      const response = await axios.post(endpoint, {
        [paramName]: id, // Use dynamic key to match backend expectation
        action: 'approve',
      });

      if (response.status === 200) {
        setRequests(requests.filter((request) => request._id !== id));
        toast.success('Request approved successfully');
      } else {
        toast.error('Approval failed');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error approving request');
    }
  };

  const handleReject = async (id) => {
    try {
      const endpoint = type === 'individual' ? '/admin/approval/provider' : '/admin/approval/seeker';
      const paramName = type === 'individual' ? 'providerId' : 'seekerId';
      const response = await axios.post(endpoint, {
        [paramName]: id, // Use dynamic key to match backend expectation
        action: 'reject',
      });

      if (response.status === 200) {
        setRequests(requests.filter((request) => request._id !== id));
        toast.success('Request rejected successfully');
      } else {
        toast.error('Rejection failed');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error rejecting request');
    }
  };

  return (
    <div className="p-0 sm:p-0 r-sm:bg-background dark:bg-dark-background min-h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-base font-medium text-text dark:text-dark-text animate-pulse">Loading...</p>
        </div>
      ) : (
        <RequestList
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default PendingRequest;