import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <section className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-dark-background-black rounded-lg shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
        {/* Header with Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-dark-background-grey flex items-center justify-center mb-4 animate-pulse">
            <FontAwesomeIcon
              icon={faLock}
              className="text-3xl sm:text-4xl text-accent dark:text-dark-accent"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text text-center">
            Unauthorized Access
          </h1>
        </div>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-8">
          You do not have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>

        {/* Go Back Button */}
        <div className="flex justify-center">
          <button
            onClick={goBack}
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

export default Unauthorized;