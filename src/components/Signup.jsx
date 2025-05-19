import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom"; // Ensure Link is imported
import { ProviderSignup } from "./ProviderSignup";
import RequestorSignup from "./RequestorSignup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import loginSvg from "../asset/logins.svg";

const Signup = () => {
  const [role, setRole] = useState("individual");
  const [success, setSuccess] = useState(false);

  return (
    <>
      {success ? (
        <section className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text">
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text mb-4">Success!</h1>
          <p className="text-sm sm:text-base">
            Your registration is pending approval. Please{" "}
            <Link to="/login" className="text-primary dark:text-dark-primary hover:underline font-medium">
              sign in
            </Link>{" "}
            after approval.
          </p>
        </section>
      ) : (
        <div className="flex w-screen h-screen bg-background dark:bg-dark-background">
          {/* Left Decorative Section (Visible on lg and above) */}
          <div className="hidden lg:block w-1/2 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary to-accent dark:from-dark-primary dark:to-dark-accent"
              style={{ opacity: 0.9 }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundImage: `url(${loginSvg})`, backgroundSize: "cover", opacity: 0.2 }}
            />
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 bg-opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-white dark:text-dark-text opacity-90 animate-pulse">
                Join Us Today
              </h2>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-4 lg:p-6">
            <div className="max-w-xl w-full bg-white dark:bg-dark-background-black rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Header with Icon */}
              <div className="flex flex-col items-center mb-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-dark-background-grey flex items-center justify-center mb-2 animate-pulse">
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    className="text-2xl sm:text-3xl text-accent dark:text-dark-accent"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-dark-text text-center">
                  Sign Up to <span className="text-primary dark:text-dark-primary">App</span>
                </h2>
              </div>

              {/* Role Toggle Buttons */}
              <div className="flex justify-center gap-2 mb-4">
                {["individual", "requestor"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                      role === r
                        ? "bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white"
                        : "bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-background-grey"
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              {/* Conditional Rendering of Signup Forms */}
              {role === "individual" && <ProviderSignup role={role} setSuccess={setSuccess} />}
              {role === "requestor" && <RequestorSignup role={role} setSuccess={setSuccess} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;