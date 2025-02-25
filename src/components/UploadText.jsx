import React, { useState } from "react";
import axios from "axios";

function UploadText() {
  const [formData, setFormData] = useState([{ key: "", value: "" }]); // Form data state
  const [isOpen, setIsOpen] = useState(false); // Modal visibility state

  // Handle input change
  const handleInputChange = (index, field, value) => {
    const updatedData = [...formData];
    updatedData[index][field] = value;
    setFormData(updatedData);
  };

  // Add more key-value pairs
  const handleAddMore = () => {
    setFormData([...formData, { key: "", value: "" }]);
  };

  // Clear form
  const handleCancel = () => {
    setFormData([{ key: "", value: "" }]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const jsonData = formData.reduce((obj, pair) => {
      obj[pair.key] = pair.value;
      return obj;
    }, {});

    try {
      const response = await axios.post("http://your-backend-endpoint/api", jsonData);
      console.log("Response:", response.data);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };

  return (
    <div>
      

      <div
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-violet-500 text-white  shadow-lg hover:bg-violet-600 transition"
        onClick={() => setIsOpen(true)} >
              <i class="bx bx-plus bx-sm bg-sslate-400 left-2/4 top-2/4 translate-x-2/4 translate-y-2/4 rounded-full "></i>
            </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-lg relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition"
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>

            <h1 className="text-xl font-bold mb-4 text-gray-800">Key-Value Form</h1>
            <form onSubmit={handleSubmit}>
              {formData.map((item, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => handleInputChange(index, "key", e.target.value)}
                    className="w-1/2 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => handleInputChange(index, "value", e.target.value)}
                    className="w-1/2 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
              <div className="flex gap-4">
                {/* <button
                  type="button"
                  onClick={handleAddMore}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Add More
                </button> */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadText;
