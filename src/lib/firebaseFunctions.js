import { db, ref, set, update, get } from "../lib/firebaseConfig";

export const tambahDataAwal = () => {
  const currentTime = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  //   const data = {
  //     1: { nama: "Juz 1", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     2: { nama: "Juz 2", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     3: { nama: "Juz 3", status: "sudah dibaca", dibaca_oleh: "Ahmad", waktu_selesai: currentTime },
  //     4: { nama: "Juz 4", status: "sudah dibaca", dibaca_oleh: "Fatimah", waktu_selesai: currentTime },
  //     5: { nama: "Juz 5", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     6: { nama: "Juz 6", status: "sudah dibaca", dibaca_oleh: "Ali", waktu_selesai: currentTime },
  //     7: { nama: "Juz 7", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     8: { nama: "Juz 8", status: "sudah dibaca", dibaca_oleh: "Zainab", waktu_selesai: currentTime },
  //     9: { nama: "Juz 9", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     10: { nama: "Juz 10", status: "sudah dibaca", dibaca_oleh: "Umar", waktu_selesai: currentTime },
  //     11: { nama: "Juz 11", status: "sudah dibaca", dibaca_oleh: "Aisyah", waktu_selesai: currentTime },
  //     12: { nama: "Juz 12", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     13: { nama: "Juz 13", status: "sudah dibaca", dibaca_oleh: "Bilal", waktu_selesai: currentTime },
  //     14: { nama: "Juz 14", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     15: { nama: "Juz 15", status: "sudah dibaca", dibaca_oleh: "Hasan", waktu_selesai: currentTime },
  //     16: { nama: "Juz 16", status: "sudah dibaca", dibaca_oleh: "Husain", waktu_selesai: currentTime },
  //     17: { nama: "Juz 17", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     18: { nama: "Juz 18", status: "sudah dibaca", dibaca_oleh: "Khalid", waktu_selesai: currentTime },
  //     19: { nama: "Juz 19", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     20: { nama: "Juz 20", status: "sudah dibaca", dibaca_oleh: "Utsman", waktu_selesai: currentTime },
  //     21: { nama: "Juz 21", status: "sudah dibaca", dibaca_oleh: "Siti", waktu_selesai: currentTime },
  //     22: { nama: "Juz 22", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     23: { nama: "Juz 23", status: "sudah dibaca", dibaca_oleh: "Abu Bakar", waktu_selesai: currentTime },
  //     24: { nama: "Juz 24", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     25: { nama: "Juz 25", status: "sudah dibaca", dibaca_oleh: "Salman", waktu_selesai: currentTime },
  //     26: { nama: "Juz 26", status: "sudah dibaca", dibaca_oleh: "Yusuf", waktu_selesai: currentTime },
  //     27: { nama: "Juz 27", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     28: { nama: "Juz 28", status: "sudah dibaca", dibaca_oleh: "Maryam", waktu_selesai: currentTime },
  //     29: { nama: "Juz 29", status: "belum dibaca", dibaca_oleh: null, waktu_selesai: null },
  //     30: { nama: "Juz 30", status: "sudah dibaca", dibaca_oleh: "Muhammad", waktu_selesai: currentTime },
  //   };

  const data = {};

  // Generate complete data for all 30 juz
  for (let i = 1; i <= 30; i++) {
    data[i] = {
      nama: `Juz ${i}`,
      status: "belum dibaca",
      dibaca_oleh: null,
      waktu_selesai: null,
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
 */
export async function updateJuzStatus(juz, nama) {
  const juzRef = ref(db, `juz_tracking/${juz}`);
  const timestamp = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  try {
    const snapshot = await get(juzRef);
    const juzData = snapshot.val();

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
  } catch (error) {
    console.error("Error updating juz:", error);
  }
}
