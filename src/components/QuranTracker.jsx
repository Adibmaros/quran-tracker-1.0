"use client";

import React, { useEffect, useState } from "react";

const QuranTracker = () => {
  const [datanya, setDatanya] = useState([]); // Inisialisasi state sebagai array
  const [loading, setLoading] = useState(true); // State untuk loading
  const [error, setError] = useState(null); // State untuk error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reading-progress");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const json = await response.json();
        setDatanya(json); // Set data ke state
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false setelah selesai
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Tampilkan loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Tampilkan pesan error
  }

  return (
    <div>
      <h1>Quran Reading Progress</h1>
      {datanya.length > 0 ? (
        <ul>
          {datanya.map((data) => (
            <li key={data.id}>
              <h2>Juz {data.juzNumber}</h2>
              <p>Status: {data.isCompleted ? "Completed" : "Not Completed"}</p>
              <p>Last Read Date: {data.lastReadDate ? new Date(data.lastReadDate).toLocaleDateString() : "N/A"}</p>
              <p>Notes: {data.notes || "No notes"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default QuranTracker;