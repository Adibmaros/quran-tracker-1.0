"use client";

import React from "react";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Under Maintenance</h1>
        <p className="text-gray-600 mb-8">We're currently performing some maintenance. Please check back soon.</p>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Maintenance;
