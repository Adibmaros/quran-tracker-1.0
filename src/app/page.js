"use client";
import { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { updateJuzStatus } from "../lib/firebaseFunctions";

export default function Home() {
  const [juzList, setJuzList] = useState({});
  const [userName, setUserName] = useState(""); // Menyimpan nama pengguna

  useEffect(() => {
    const juzRef = ref(db, "juz_tracking");
    onValue(juzRef, (snapshot) => {
      setJuzList(snapshot.val() || {});
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📖 Tracker Bacaan Al-Qur'an</h1>

      {/* Input untuk Nama Pengguna */}
      <div className="mb-4">
        <label className="block font-semibold">Nama Anda:</label>
        <input type="text" className="border rounded p-2 w-full" value={userName} onChange={(e) => setUserName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(juzList).map(([juz, data]) => (
          <div key={juz} className="border p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Juz {juz}</h2>
            <p>Status: {data.status}</p>
            <p>Dibaca oleh: {data.dibaca_oleh || "Belum ada"}</p>

            {/* Tombol untuk toggle status */}
            <button
              className={`mt-2 px-4 py-2 rounded ${data.status === "Sudah Dibaca" ? "bg-red-500" : "bg-blue-500"} text-white`}
              onClick={() => updateJuzStatus(juz, userName)}
              disabled={!userName} // Disabled jika nama kosong
            >
              {data.status === "Sudah Dibaca" ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
