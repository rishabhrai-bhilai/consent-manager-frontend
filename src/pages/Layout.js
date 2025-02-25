import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";

const Layout = ({ role }) => {
  const [isClosed, setIsClosed] = useState(false);

  const toggleSidebar = () => setIsClosed(!isClosed);

  return (
    <main className="min-h-screen">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Navbar */}
        <Navbar
          role={role}
          isClosed={isClosed}
          toggleSidebar={toggleSidebar}
          className="w-full md:w-auto md:basis-1/6 bg-secondary dark:bg-dark-secondary p-4 md:p-6"
        />

        {/* Content Area */}
        <div
          className={`flex-1 w-full md:basis-5/6 bg-secondary dark:bg-dark-background-secondary transition-all duration-200 ease-in-out ${
            isClosed ? "md:ml-[88px]" : "md:ml-[250px]"
          }`}
        >
          <div className="w-full bg-secondary dark:bg-dark-background-secondary px-2 sm:px-4 md:px-6 h-full">
            <div className="mx-auto max-w-screen-lg h-full">
              <div className="pt-6 flex w-full flex-col h-[calc(100vh-4rem-1rem)] sm:h-[calc(100vh-4rem-2rem)] md:h-[calc(100vh-2rem)] bg-secondary dark:bg-dark-background-secondary">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;