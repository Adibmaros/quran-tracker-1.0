import { db, ref, set, update, get } from "../lib/firebaseConfig";

export const tambahDataAwal = () => {
  const data = {
    1: { nama: "Juz 1", status: "belum dibaca", dibaca_oleh: null },
    2: { nama: "Juz 2", status: "belum dibaca", dibaca_oleh: null },
    3: { nama: "Juz 3", status: "sudah dibaca", dibaca_oleh: "Ahmad" },
    4: { nama: "Juz 4", status: "sudah dibaca", dibaca_oleh: "Fatimah" },
    5: { nama: "Juz 5", status: "belum dibaca", dibaca_oleh: null },
    6: { nama: "Juz 6", status: "sudah dibaca", dibaca_oleh: "Ali" },
    7: { nama: "Juz 7", status: "belum dibaca", dibaca_oleh: null },
    8: { nama: "Juz 8", status: "sudah dibaca", dibaca_oleh: "Zainab" },
    9: { nama: "Juz 9", status: "belum dibaca", dibaca_oleh: null },
    10: { nama: "Juz 10", status: "sudah dibaca", dibaca_oleh: "Umar" },
    11: { nama: "Juz 11", status: "sudah dibaca", dibaca_oleh: "Aisyah" },
    12: { nama: "Juz 12", status: "belum dibaca", dibaca_oleh: null },
    13: { nama: "Juz 13", status: "sudah dibaca", dibaca_oleh: "Bilal" },
    14: { nama: "Juz 14", status: "belum dibaca", dibaca_oleh: null },
    15: { nama: "Juz 15", status: "sudah dibaca", dibaca_oleh: "Hasan" },
    16: { nama: "Juz 16", status: "sudah dibaca", dibaca_oleh: "Husain" },
    17: { nama: "Juz 17", status: "belum dibaca", dibaca_oleh: null },
    18: { nama: "Juz 18", status: "sudah dibaca", dibaca_oleh: "Khalid" },
    19: { nama: "Juz 19", status: "belum dibaca", dibaca_oleh: null },
    20: { nama: "Juz 20", status: "sudah dibaca", dibaca_oleh: "Utsman" },
    21: { nama: "Juz 21", status: "sudah dibaca", dibaca_oleh: "Siti" },
    22: { nama: "Juz 22", status: "belum dibaca", dibaca_oleh: null },
    23: { nama: "Juz 23", status: "sudah dibaca", dibaca_oleh: "Abu Bakar" },
    24: { nama: "Juz 24", status: "belum dibaca", dibaca_oleh: null },
    25: { nama: "Juz 25", status: "sudah dibaca", dibaca_oleh: "Salman" },
    26: { nama: "Juz 26", status: "sudah dibaca", dibaca_oleh: "Yusuf" },
    27: { nama: "Juz 27", status: "belum dibaca", dibaca_oleh: null },
    28: { nama: "Juz 28", status: "sudah dibaca", dibaca_oleh: "Maryam" },
    29: { nama: "Juz 29", status: "belum dibaca", dibaca_oleh: null },
    30: { nama: "Juz 30", status: "sudah dibaca", dibaca_oleh: "Muhammad" },
  };

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

  try {
    const snapshot = await get(juzRef);
    const juzData = snapshot.val();

    if (juzData?.status === "Sudah Dibaca") {
      // Jika sudah dibaca, ubah ke belum dibaca
      await update(juzRef, {
        status: "Belum Dibaca",
        dibaca_oleh: "",
      });
    } else {
      // Jika belum dibaca, ubah ke sudah dibaca
      await update(juzRef, {
        status: "Sudah Dibaca",
        dibaca_oleh: nama,
      });
    }
  } catch (error) {
    console.error("Error updating juz:", error);
  }
}
