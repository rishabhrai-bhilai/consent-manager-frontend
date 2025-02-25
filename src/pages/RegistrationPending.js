import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faBan, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const RegistrationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const status = location.state?.status || 'pending'; // Default to 'pending'
  const message = location.state?.message || 
    'Admin is processing your data. We\'ll send you an email soon. Stay connected!'; // Default message

  const handleGoBack = () => {
    navigate(-1);
  };

  const getHeading = () => {
    switch (status) {
      case 'rejected':
        return 'Registration Rejected';
      case 'pending':
        return 'Registration Pending';
      default:
        return 'Registration Status';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'rejected':
        return faBan; // Ban icon for rejected
      case 'pending':
        return faHourglassHalf; // Hourglass for pending
      default:
        return faHourglassHalf;
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'rejected':
        return 'text-red-500 dark:text-red-400'; // Red for rejected
      case 'pending':
        return 'text-accent dark:text-dark-accent'; // Violet from your theme for pending
      default:
        return 'text-accent dark:text-dark-accent';
    }
  };

  return (
    <section className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-dark-background-black rounded-lg shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
        {/* Header with Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-dark-background-grey flex items-center justify-center mb-4 animate-pulse">
            <FontAwesomeIcon
              icon={getIcon()}
              className={`text-3xl sm:text-4xl ${getIconColor()}`}
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text text-center">
            {getHeading()}
          </h2>
        </div>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-8">
          {message}
        </p>

        {/* Go Back Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-6 py-2 bg-primary dark:bg-dark-primary text-white text-sm sm:text-base font-medium rounded-md shadow-sm hover:bg-accent dark:hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegistrationPending;