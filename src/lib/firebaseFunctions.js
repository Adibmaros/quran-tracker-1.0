// lib/firebaseFunctions.js
import { db, ref, set, update, get, query, orderByChild } from "../lib/firebaseConfig";

/**
 * Adds initial data for all 30 juz to the database
 */
export const tambahDataAwal = () => {
  const currentTime = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });
  const data = {};
  // Generate complete data for all 30 juz
  for (let i = 1; i <= 30; i++) {
    data[i] = {
      nama: `Juz ${i}`,
      status: "Belum Dibaca",
      dibaca_oleh: "",
      waktu_selesai: null,
      penugasan: "", // Field baru untuk menyimpan nama orang yang ditugaskan
    };
  }
  set(ref(db, "juz_tracking"), data)
    .then(() => console.log("Data berhasil ditambahkan"))
    .catch((error) => console.error("Gagal menambah data:", error));
};

/**
 * Memperbarui status juz yang telah dibaca
 * @param {number} juz - Nomor juz yang diperbarui
 * @param {string} nama - Nama pembaca yang bertanggung jawab
 * @returns {Promise<boolean>} - Status keberhasilan operasi
 */
export async function updateJuzStatus(juz, nama) {
  if (!nama || nama.trim() === "") {
    console.error("Nama pembaca tidak boleh kosong");
    return false;
  }

  const juzRef = ref(db, `juz_tracking/${juz}`);
  const timestamp = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const isoTimestamp = new Date().toISOString();
  const dateOnly = isoTimestamp.split("T")[0]; // YYYY-MM-DD format

  try {
    const snapshot = await get(juzRef);
    const juzData = snapshot.val();

    // Add to history when marked as read
    if (juzData?.status !== "Sudah Dibaca") {
      // Add to reader history
      const historyRef = ref(db, `reader_history/${Date.now()}`);
      await set(historyRef, {
        name: nama,
        juz: juz,
        timestamp: isoTimestamp,
        date: dateOnly,
      });
    }

    if (juzData?.status === "Sudah Dibaca") {
      // Jika sudah dibaca, ubah ke belum dibaca
      await update(juzRef, {
        status: "Belum Dibaca",
        dibaca_oleh: "",
        waktu_selesai: null,
      });
    } else {
      // Jika belum dibaca, ubah ke sudah dibaca
      await update(juzRef, {
        status: "Sudah Dibaca",
        dibaca_oleh: nama,
        waktu_selesai: timestamp,
      });
    }
    return true;
  } catch (error) {
    console.error("Error updating juz:", error);
    return false;
  }
}

/**
 * Menetapkan pembaca untuk juz tertentu
 * @param {number|string} juz - Nomor juz yang akan ditetapkan pembacanya
 * @param {string} nama - Nama pembaca yang ditugaskan
 * @returns {Promise<boolean>} - Status keberhasilan operasi
 */
export async function tetapkanPembaca(juz, nama) {
  if (!nama || nama.trim() === "") {
    console.error("Nama pembaca tidak boleh kosong");
    return false;
  }

  const juzRef = ref(db, `juz_tracking/${juz}`);

  try {
    await update(juzRef, {
      penugasan: nama,
    });
    console.log(`Juz ${juz} berhasil ditugaskan kepada ${nama}`);
    return true;
  } catch (error) {
    console.error(`Error menetapkan pembaca untuk juz ${juz}:`, error);
    return false;
  }
}

/**
 * Menetapkan beberapa juz sekaligus untuk seorang pembaca
 * @param {Array<number|string>} juzList - Array nomor juz yang akan ditetapkan
 * @param {string} nama - Nama pembaca yang ditugaskan
 * @returns {Promise<boolean>} - Status keberhasilan operasi
 */
export async function tetapkanBeberapaJuz(juzList, nama) {
  if (!nama || nama.trim() === "") {
    console.error("Nama pembaca tidak boleh kosong");
    return false;
  }

  if (!juzList || !Array.isArray(juzList) || juzList.length === 0) {
    console.error("Daftar juz tidak valid");
    return false;
  }

  const updates = {};

  juzList.forEach((juz) => {
    updates[`juz_tracking/${juz}/penugasan`] = nama;
  });

  try {
    await update(ref(db), updates);
    console.log(`${juzList.length} juz berhasil ditugaskan kepada ${nama}`);
    return true;
  } catch (error) {
    console.error("Error menetapkan beberapa juz:", error);
    return false;
  }
}

/**
 * Mendapatkan data semua juz
 * @returns {Promise<Object>} - Data semua juz
 */
export async function getAllJuzData() {
  try {
    const snapshot = await get(ref(db, "juz_tracking"));
    return snapshot.val() || {};
  } catch (error) {
    console.error("Error getting juz data:", error);
    return {};
  }
}

/**
 * Mendapatkan statistik bacaan semua juz
 * @returns {Promise<Object>} - Statistik bacaan
 */
export async function getReadingStats() {
  try {
    const allJuzData = await getAllJuzData();

    const stats = {
      totalJuz: 30,
      completedJuz: 0,
      assignedJuz: 0,
      readers: new Set(),
      juzPerReader: {},
    };

    Object.entries(allJuzData).forEach(([juz, data]) => {
      // Count completed juz
      if (data.status === "Sudah Dibaca") {
        stats.completedJuz++;

        // Add to readers set
        if (data.dibaca_oleh) {
          stats.readers.add(data.dibaca_oleh);

          // Track juz per reader
          if (!stats.juzPerReader[data.dibaca_oleh]) {
            stats.juzPerReader[data.dibaca_oleh] = 1;
          } else {
            stats.juzPerReader[data.dibaca_oleh]++;
          }
        }
      }

      // Count assigned juz
      if (data.penugasan) {
        stats.assignedJuz++;
      }
    });

    // Convert readers set to array size
    stats.uniqueReaders = Array.from(stats.readers).length;

    return stats;
  } catch (error) {
    console.error("Error getting reading stats:", error);
    return {
      totalJuz: 30,
      completedJuz: 0,
      assignedJuz: 0,
      uniqueReaders: 0,
      juzPerReader: {},
    };
  }
}

/**
 * Mendapatkan riwayat pembaca
 * @returns {Promise<Array>} - Array riwayat pembaca
 */
export async function getReaderHistory() {
  try {
    const historyRef = ref(db, "reader_history");
    const snapshot = await get(historyRef);
    const data = snapshot.val() || {};

    // Convert object to array
    const historyArray = Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value,
    }));

    // Sort by timestamp (newest first)
    return historyArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Error getting reader history:", error);
    return [];
  }
}

/**
 * Reset semua status juz ke "Belum Dibaca"
 * @returns {Promise<boolean>} - Status keberhasilan operasi
 */
export async function resetAllJuzStatus() {
  try {
    const allJuzData = await getAllJuzData();
    const updates = {};

    Object.keys(allJuzData).forEach((juz) => {
      updates[`juz_tracking/${juz}/status`] = "Belum Dibaca";
      updates[`juz_tracking/${juz}/dibaca_oleh`] = "";
      updates[`juz_tracking/${juz}/waktu_selesai`] = null;
    });

    await update(ref(db), updates);
    console.log("Semua status juz berhasil direset");
    return true;
  } catch (error) {
    console.error("Error resetting juz status:", error);
    return false;
  }
}
