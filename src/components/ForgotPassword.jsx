import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import loginSvg from '../asset/logins.svg';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex w-screen h-screen bg-background dark:bg-dark-background">
      {/* Left Decorative Section (Visible on lg and above) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-accent dark:from-dark-primary dark:to-dark-accent"
          style={{ opacity: 0.9 }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundImage: `url(${loginSvg})`, backgroundSize: 'cover', opacity: 0.2 }}
        />
        {/* Simplified pattern using Tailwind bg-opacity and a subtle dot grid */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 bg-opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-white dark:text-dark-text opacity-90 animate-pulse">
            Reset Your Password
          </h2>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-dark-background-black rounded-lg shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
          {/* Header with Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-dark-background-grey flex items-center justify-center mb-4 animate-pulse">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-3xl sm:text-4xl text-accent dark:text-dark-accent"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text text-center">
              Forgot Password
            </h2>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 text-sm text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
                  placeholder="Enter your email"
                />
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-2 bg-primary dark:bg-dark-primary text-white text-sm sm:text-base font-medium rounded-md shadow-sm hover:bg-accent dark:hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
            >
              Submit
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account yet?{' '}
            <a href="#" className="text-accent dark:text-dark-accent hover:underline">
              Sign up for free!
            </a>
          </div>

          {/* Go Back Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-6 py-2 text-sm sm:text-base text-accent dark:text-dark-accent hover:text-primary dark:hover:text-dark-primary focus:outline-none transition-all duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;