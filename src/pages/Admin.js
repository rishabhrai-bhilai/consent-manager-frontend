import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHourglassHalf,    // Pending Individual
  faUserPlus,         // Pending Requestor
  faClockRotateLeft,  // History
  faUserMinus,        // Remove User
} from '@fortawesome/free-solid-svg-icons';
import PendingRequest from './PendingRequest';

const Admin = () => {
  const [activeTab, setActiveTab] = useState(null);

  const tabData = [
    {
      name: 'individual',
      icon: faHourglassHalf,
      title: 'Pending Individual',
      count: '12',
      color: '#db6fb7',
      darkColor: '#e89cd1',
    },
    {
      name: 'requestor',
      icon: faUserPlus,
      title: 'Pending Requestor',
      count: '8',
      color: '#00cfde',
      darkColor: '#4cdce8',
    },
    {
      name: 'history',
      icon: faClockRotateLeft,
      title: 'History',
      count: '45',
      color: '#ff9f00',
      darkColor: '#ffbb4d',
      content: <p>User history and activity logs will be displayed here.</p>,
    },
    {
      name: 'removeUser',
      icon: faUserMinus,
      title: 'Remove User',
      count: '3',
      color: '#00cc99',
      darkColor: '#4dddb3',
      content: <p>More content goes here...</p>,
    },
  ];

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Admin Dashboard
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {tabData.map((tab) => (
            <div
              key={tab.name}
              className={`tab-container bg-white dark:bg-dark-background-black rounded-md shadow-md p-2 sm:p-3 md:p-4 flex items-center justify-between transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                activeTab === tab.name ? 'ring-2 ring-offset-2 ring-opacity-30 dark:ring-0' : ''
              }`}
              style={{
                ...(activeTab === tab.name && {
                  '--tw-ring-color': tab.color,
                }),
              }}
              onClick={() => setActiveTab(tab.name)}
            >
              <div className="tab-info-wrapper flex-1">
                <h2 className="text-xs sm:text-xs md:text-sm font-semibold text-text dark:text-dark-text truncate">
                  {tab.title}
                </h2>
                <span className="text-[10px] sm:text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
                  {tab.count} {tab.count === '1' ? 'item' : 'items'}
                </span>
              </div>
              <div className="tab-icon-wrapper ml-2 sm:ml-3 relative">
                <svg viewBox="0 0 36 36" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                  />
                  <path
                    className="circle"
                    stroke={tab.color}
                    strokeWidth={activeTab === tab.name ? '2' : '2'}
                    strokeDasharray={activeTab === tab.name ? '100, 100' : '75, 100'}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    style={{ stroke: tab.color }}
                    className={`transition-all duration-300 dark:stroke-[${tab.darkColor}] ${
                      activeTab === tab.name ? 'dark:stroke-[1.5]' : ''
                    }`}
                  />
                  <foreignObject
                    x="11"
                    y="11"
                    width="14"
                    height="14"
                    className="sm:x-[10] sm:y-[10] sm:w-[16] sm:h-[16] md:x-[8] md:y-[8] md:w-[20] md:h-[20]"
                  >
                    <div className="flex items-center justify-center h-full">
                      <FontAwesomeIcon
                        icon={tab.icon}
                        className="text-[8px] sm:text-[10px] md:text-xs"
                        style={{ color: tab.color }}
                      />
                    </div>
                  </foreignObject>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 sm:shadow-lg sm:bg-background dark:bg-dark-background p-0 sm:p-0 sm:rounded-md overflow-hidden overflow-y-auto max-h-[60vh] scrollbar-hidden">
          {!activeTab && (
            <p className="text-text dark:text-dark-text text-md font-medium sm:text-text">
              Select a tab to view details
            </p>
          )}
          {activeTab === 'individual' && <PendingRequest type={activeTab} />}
          {activeTab === 'requestor' && <PendingRequest type={activeTab} />}
          {tabData.map((tab) => (
            activeTab === tab.name && !['individual', 'requestor'].includes(tab.name) && (
              <div key={tab.name}>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4 text-text dark:text-dark-text">
                  {tab.title} Details
                </h2>
                {tab.content}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;