import React, { useState } from "react";

const ApproveDeclineRegistration = () => {
    const [notification, setNotification] = useState(null);

    // Mock user registration data (replace with API call)
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        role: "seeker",
    };

    const handleApprove = () => {
        // Simulate API call to approve registration
        setTimeout(() => {
            setNotification({ type: "success", message: "Registration approved successfully!" });
        }, 1000);
    };

    const handleDecline = () => {
        // Simulate API call to decline registration
        setTimeout(() => {
            setNotification({ type: "error", message: "Registration declined!" });
        }, 1000);
    };

    return (
        <div>
            {/* User Info */}
            <div className="mb-4">
                <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
                <p className="text-gray-700"><strong>Role:</strong> {user.role}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleApprove}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Approve
                </button>
                <button
                    onClick={handleDecline}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Decline
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
                        notification.type === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default ApproveDeclineRegistration;