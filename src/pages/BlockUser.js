import React, { useEffect, useState } from 'react';
import axios from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserList = ({ users, onBlock }) => {
  if (users.length === 0) {
    return <p className="text-center text-sm font-medium text-text dark:text-dark-text opacity-80">No Active Users</p>;
  }
  return (
    <div className="space-y-4 r-max-w-3xl r-mx-auto">
      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white dark:bg-dark-background-black border border-outlines dark:border-dark-background-grey rounded-lg shadow-sm p-3 sm:p-4 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex-grow space-y-1 sm:ml-4">
              <h3 className="text-base font-semibold text-text dark:text-dark-text leading-tight">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.mobile_no ? `Mobile: ${user.mobile_no}` : user.contact_no ? `Contact: ${user.contact_no}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onBlock(user._id)}
                className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-all duration-200"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BlockUser = ({ type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'blockIndividual' ? '/admin/getProviders' : '/admin/getSeekers';
        const response = await axios.get(endpoint, { signal: abortController.signal });
        setUsers(response.data.data || []);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching active users:', error);
          toast.error('Error fetching active users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => abortController.abort();
  }, [type]);

  const handleBlock = async (id) => {
    try {
      const endpoint = type === 'blockIndividual' ? '/admin/inactivateProvider' : '/admin/inactivateSeeker';
      const response = await axios.post(endpoint, { userId: id }); // Backend expects userId here
      if (response.status === 200) {
        setUsers(users.filter((user) => user._id !== id));
        toast.success('User blocked successfully');
      } else {
        toast.error('Block failed');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Error blocking user');
    }
  };

  return (
    <div className="p-0 sm:p-0 r-sm:bg-background dark:bg-dark-background min-h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-base font-medium text-text dark:text-dark-text animate-pulse">Loading...</p>
        </div>
      ) : (
        <UserList users={users} onBlock={handleBlock} />
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default BlockUser;