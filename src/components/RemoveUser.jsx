import React, { useState } from "react";

const RemoveUser = () => {
    const [email, setEmail] = useState("");
    const [notification, setNotification] = useState(null);

    const handleRemoveUser = () => {
        // Simulate API call to remove user
        if (email === "john.doe@example.com") {
            setTimeout(() => {
                setNotification({ type: "success", message: "User removed successfully!" });
            }, 1000);
        } else {
            setTimeout(() => {
                setNotification({ type: "error", message: "No user found with this email!" });
            }, 1000);
        }
    };

    return (
        <div>
            {/* Search Input */}
            <div className="mb-4">
                <input
                    type="email"
                    placeholder="Enter user email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>

            {/* Remove Button */}
            <button
                onClick={handleRemoveUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Remove User
            </button>

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

export default RemoveUser;