"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseConfig";
import { ref, get, set } from "firebase/database";

export default function JuzDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState({
    status: "Belum",
    dibaca_oleh: "",
  });

  useEffect(() => {
    if (!id) return;
    const juzRef = ref(db, `juz_tracking/${id}`);
    get(juzRef).then((snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      }
    });
  }, [id]);

  const markAsRead = () => {
    const namaPembaca = prompt("Masukkan nama pembaca:");
    if (!namaPembaca) return;

    set(ref(db, `juz_tracking/${id}`), {
      status: "Sudah",
      dibaca_oleh: namaPembaca,
    });

    setData({ status: "Sudah", dibaca_oleh: namaPembaca });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📖 Juz {id}</h1>
      <p>Status: {data.status}</p>
      <p>Dibaca oleh: {data.dibaca_oleh || "Belum ada"}</p>
      <button onClick={markAsRead} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
        Tandai Sudah Dibaca
      </button>
    </div>
  );
}
