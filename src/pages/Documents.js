import React from "react";
import Reports from "../components/Reports";

const Documents = () => {
  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Documents
        </span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 pb-8">
        <Reports />
      </div>
    </div>
  );
};

export default Documents;