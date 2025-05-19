import React, { useEffect, useState, useMemo } from 'react';
import axios from './../api/axios';
import { useAuth } from '../context/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPlus, faMinus, faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

const ConsentHistory = () => {
  const [consentHistory, setConsentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [tempFilters, setTempFilters] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const { auth } = useAuth();
  const userId = auth?.userId;

  useEffect(() => {
    const fetchConsentHistory = async () => {
      if (!userId) {
        setError('User ID not found. Please log in.');
        toast.error('Please log in to view consent history.');
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching consent history for userId:", userId);
        // Corrected endpoint: /provider/:providerId/getConsentHistory
        const response = await axios.get(`/provider/${userId}/getConsentHistory`);
        console.log("Consent history response:", response.data);

        if (response.data.success) {
          setConsentHistory(response.data.data);
          console.log("Set consent history:", response.data.data);
        } else {
          setError(response.data.message || 'No consent history found.');
          toast.info(response.data.message || 'No consent history found.');
        }
      } catch (err) {
        console.error("Error fetching consent history:", err);
        setError('Could not fetch consent history. Please try again later.');
        toast.error('Could not fetch consent history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsentHistory();
  }, [userId]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const uniqueValues = useMemo(() => {
    const values = {};
    consentHistory.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'additional_info') {
          if (!values[key]) values[key] = new Set();
          const value = key === 'requested_at' ? formatDate(item[key]) : item[key];
          values[key].add(value);
        }
      });
    });
    return Object.fromEntries(Object.entries(values).map(([key, set]) => [key, [...set]]));
  }, [consentHistory]);

  const filteredData = useMemo(() => {
    return consentHistory.filter((row) =>
      Object.entries(columnFilters).every(([key, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        const rowValue = key === 'requested_at' ? formatDate(row[key]) : row[key];
        return selectedValues.includes(rowValue);
      })
    );
  }, [consentHistory, columnFilters]);

  const toggleDropdown = (column) => {
    setDropdownOpen(dropdownOpen === column ? null : column);
  };

  const handleCheckboxChange = (column, value) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[column]) newFilters[column] = [];
      if (newFilters[column].includes(value)) {
        newFilters[column] = newFilters[column].filter((v) => v !== value);
      } else {
        newFilters[column] = [...newFilters[column], value];
      }
      return newFilters;
    });
  };

  const handleTempCheckboxChange = (column, value) => {
    setTempFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[column]) newFilters[column] = [];
      if (newFilters[column].includes(value)) {
        newFilters[column] = newFilters[column].filter((v) => v !== value);
      } else {
        newFilters[column] = [...newFilters[column], value];
      }
      return newFilters;
    });
  };

  const applyMobileFilters = () => {
    setColumnFilters(tempFilters);
    setIsMobileFilterOpen(false);
    setSelectedColumn(null);
  };

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
    setTempFilters({ ...columnFilters });
    setSelectedColumn(null);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
    setTempFilters({});
    setSelectedColumn(null);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setTempFilters({});
    setSelectedColumn(null);
    setDropdownOpen(null);
  };

  const handleColumnSelect = (column) => {
    setSelectedColumn(column === selectedColumn ? null : column);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown') && !event.target.closest('.mobile-filter-drawer')) {
      setDropdownOpen(null);
    }
  };

  const toggleAccordion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const statusColors = {
    approved: 'bg-green-50 text-green-800 border border-green-200',
    rejected: 'bg-red-50 text-red-800 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    accessed: 'bg-blue-50 text-blue-800 border border-blue-200',
    'count exhausted': 'bg-orange-50 text-orange-800 border border-orange-200',
    revoked: 'bg-gray-50 text-gray-800 border border-gray-200',
    expired: 'bg-purple-50 text-purple-800 border border-purple-200',
  };

  const columns = useMemo(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => toggleAccordion(row.id)}
            className="w-6 h-6 flex items-center justify-center text-primary font-bold text-md rounded-full hover:text-violet-700 transition-colors"
          >
            <FontAwesomeIcon icon={expandedRows[row.id] ? faMinus : faPlus} />
          </button>
        ),
      },
      { accessorKey: 'item_name', header: 'Item Name' },
      { accessorKey: 'item_type', header: 'Type' },
      { accessorKey: 'seeker_name', header: 'Seeker Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          let colorClass = statusColors[status] || 'bg-gray-50 text-gray-800 border border-gray-200';
          return (
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-md shadow-sm ${colorClass}`}
            >
              {status}
            </span>
          );
        },
      },
      { 
        accessorKey: 'requested_at', 
        header: 'Requested At',
        cell: ({ getValue }) => formatDate(getValue()),
      },
    ],
    [expandedRows]
  );

  const parseSeekerDetails = (additionalInfo) => {
    if (!additionalInfo || additionalInfo === "N/A" || additionalInfo === "Seeker details not found") {
      return { "Details": "N/A" };
    }
    const pairs = additionalInfo.split(", ");
    const details = {};
    pairs.forEach(pair => {
      const [key, value] = pair.split(": ");
      details[key] = value;
    });
    return details;
  };

  const formatDetails = (data) => {
    const seekerDetails = parseSeekerDetails(data.additional_info);
    return (
      <div className="flex flex-col sm:flex-row text-sm text-gray-700 gap-6">
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-900 mb-2">Record Details</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="font-semibold text-gray-900">Item Name:</span> {data.item_name}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Type:</span> {data.item_type}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Seeker Name:</span> {data.seeker_name}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Status:</span> {data.status}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Requested At:</span> {formatDate(data.requested_at)}
            </div>
          </div>
        </div>
        <div className="hidden sm:block border-l border-gray-300"></div>
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-900 mb-2">Seeker Details</h4>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(seekerDetails).map(([key, value]) => (
              <div key={key}>
                <span className="font-semibold text-gray-900">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full bg-secondary flex flex-col">
      <div className="heading px-4 py-4 bg-secondary dark:bg-dark-background-secondary sticky top-0 z-10 flex justify-between items-center">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-text dark:text-dark-text">
          Consent History
        </span>
        <button
          onClick={clearAllFilters}
          className="hidden sm:block text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden px-4 pb-8">
        {loading ? (
          <>
            <div className="space-y-4 sm:hidden mt-4">
              {Array(5).fill().map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
            <div className="hidden sm:block mt-4 bg-white rounded-lg shadow-lg overflow-x-auto">
              <div className="space-y-2 p-4">
                {Array(5).fill().map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-md"></div>
                ))}
              </div>
            </div>
          </>
        ) : error ? (
          <div className="mt-4 text-center text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <div className="space-y-4 sm:hidden mt-4">
              {filteredData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900">{item.item_name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.seeker_name} • {formatDate(item.requested_at)}
                      </p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${statusColors[item.status] || 'bg-gray-50 text-gray-800 border border-gray-200'}`}>
                      {item.status}
                    </span>
                  </div>
                  {expandedRows[index] && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {formatDetails(item)}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="mt-3 flex items-center text-primary hover:text-violet-700 text-xs font-medium transition-colors duration-200 focus:outline-none"
                    aria-label={expandedRows[index] ? 'Hide details' : 'Show details'}
                  >
                    <FontAwesomeIcon
                      icon={expandedRows[index] ? faChevronUp : faChevronDown}
                      className="mr-1"
                    />
                    {expandedRows[index] ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              ))}
              <div className="fixed bottom-4 right-4 sm:hidden">
                <button
                  onClick={openMobileFilter}
                  className="bg-violet-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center"
                  aria-label="Open filters"
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="hidden sm:block mt-4 bg-white rounded-lg shadow-lg overflow-x-auto lg:w-full">
              <div className="max-h-[calc(100vh-10.5rem)] overflow-y-auto scrollbar-hidden">
                <table className="min-w-full divide-y divide-gray-200 lg:w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="relative py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase"
                          >
                            <div className="flex items-center justify-between cursor-pointer relative dropdown">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.id !== 'expand' && (
                                <button
                                  onClick={() => toggleDropdown(header.column.id)}
                                  className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  <FontAwesomeIcon icon={faFilter} className="text-sm sm:text-base" />
                                </button>
                              )}
                            </div>
                            {dropdownOpen === header.column.id && uniqueValues[header.column.columnDef.accessorKey] && (
                              <div className="absolute left-0 mt-2 w-48 max-h-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-2 overflow-y-auto scrollbar-hidden">
                                {uniqueValues[header.column.columnDef.accessorKey].map((value) => (
                                  <label key={value} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                    <input
                                      type="checkbox"
                                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                      checked={columnFilters[header.column.columnDef.accessorKey]?.includes(value) || false}
                                      onChange={() => handleCheckboxChange(header.column.columnDef.accessorKey, value)}
                                    />
                                    {value}
                                  </label>
                                ))}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-4 px-4 text-sm text-gray-700">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                        {expandedRows[row.id] && (
                          <tr>
                            <td colSpan={columns.length} className="bg-gray-50 p-4">
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                {formatDetails(row.original)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 p-4">No consent history found.</p>
        )}
      </div>

      {isMobileFilterOpen && window.innerWidth < 640 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
          <div className="bg-white w-full max-h-[90%] rounded-t-lg shadow-lg p-4 overflow-y-auto scrollbar-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-red-500 text-sm font-medium hover:text-red-600"
              >
                CLEAR ALL
              </button>
            </div>
            <div className="flex">
              <div className="w-1/2 pr-2">
                {Object.keys(uniqueValues)
                  .filter((key) => key !== 'expand' && key !== 'additional_info')
                  .map((key) => (
                    <button
                      key={key}
                      onClick={() => handleColumnSelect(key)}
                      className={`w-full text-left px-4 py-2 mb-2 rounded-md text-sm font-medium ${
                        selectedColumn === key
                          ? 'bg-violet-100 text-violet-800 border border-violet-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {key.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
              </div>
              <div className="w-1/2 pl-2">
                {selectedColumn && uniqueValues[selectedColumn] && (
                  <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hidden">
                    {uniqueValues[selectedColumn].map((value) => (
                      <label key={value} className="flex items-center px-2 py-2 hover:bg-gray-100 border-b border-gray-200">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                          checked={tempFilters[selectedColumn]?.includes(value) || false}
                          onChange={() => handleTempCheckboxChange(selectedColumn, value)}
                        />
                        <span className="text-sm text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
              <button
                onClick={closeMobileFilter}
                className="text-gray-600 text-sm font-medium hover:text-gray-800"
              >
                CLOSE
              </button>
              <button
                onClick={applyMobileFilters}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default ConsentHistory;