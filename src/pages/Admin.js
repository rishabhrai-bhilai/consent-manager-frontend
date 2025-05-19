import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHourglassHalf,
  faUserPlus,
  faClockRotateLeft,
  faUserLock,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import PendingRequest from './PendingRequest';
import BlockUser from './BlockUser';
import UnblockUser from './UnblockUser';

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
      name: 'blockIndividual',
      icon: faUserLock,
      title: 'Block Individual',
      count: '0',
      color: '#e63946',
      darkColor: '#f94144',
    },
    {
      name: 'unblockIndividual',
      icon: faUserCheck,
      title: 'Unblock Individual',
      count: '0',
      color: '#52b788',
      darkColor: '#95d5b2',
    },
    {
      name: 'blockRequestor',
      icon: faUserLock,
      title: 'Block Requestor',
      count: '0',
      color: '#e63946',
      darkColor: '#f94144',
    },
    {
      name: 'unblockRequestor',
      icon: faUserCheck,
      title: 'Unblock Requestor',
      count: '0',
      color: '#52b788',
      darkColor: '#95d5b2',
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
        {/* Horizontally Scrollable Tabs with Hidden Scrollbar */}
        <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hidden">
          <div className="inline-flex gap-2 sm:gap-4">
            {tabData.map((tab) => (
              <div
                key={tab.name}
                className={`bg-white dark:bg-dark-background-black rounded-md shadow-md p-3 flex items-center justify-between transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:-translate-y-1 w-40 sm:w-48 ${
                  activeTab === tab.name ? 'ring-2 ring-offset-2 ring-opacity-30 dark:ring-0' : ''
                }`}
                style={{
                  ...(activeTab === tab.name && {
                    '--tw-ring-color': tab.color,
                  }),
                }}
                onClick={() => setActiveTab(tab.name)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="w-6 h-6 flex items-center justify-center rounded-full border-2 shrink-0"
                    style={{ borderColor: tab.color }}
                  >
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className="text-xs"
                      style={{ color: tab.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xs font-semibold text-text dark:text-dark-text truncate">
                      {tab.title}
                    </h2>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">
                      {tab.count} {tab.count === '1' ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 sm:mt-8 r-sm:shadow-lg r-sm:bg-background dark:bg-dark-background p-0 sm:p-0 sm:rounded-md overflow-hidden overflow-y-auto max-h-[60vh] scrollbar-hidden">
          {!activeTab && (
            <p className="text-text dark:text-dark-text text-md font-medium sm:text-text">
              Select a tab to view details
            </p>
          )}
          {activeTab === 'individual' && <PendingRequest type={activeTab} />}
          {activeTab === 'requestor' && <PendingRequest type={activeTab} />}
          {activeTab === 'blockIndividual' && <BlockUser type={activeTab} />}
          {activeTab === 'unblockIndividual' && <UnblockUser type={activeTab} />}
          {activeTab === 'blockRequestor' && <BlockUser type={activeTab} />}
          {activeTab === 'unblockRequestor' && <UnblockUser type={activeTab} />}
          {tabData.map((tab) => (
            activeTab === tab.name && !['individual', 'requestor', 'blockIndividual', 'unblockIndividual', 'blockRequestor', 'unblockRequestor'].includes(tab.name) && (
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