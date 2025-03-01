"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { tetapkanPembaca, tetapkanBeberapaJuz, getAllJuzData } from "../../lib/firebaseFunctions";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog, Save, Users, BookOpen, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPage() {
  const [juzData, setJuzData] = useState({});
  const [pembacaList, setPembacaList] = useState([]);
  const [selectedJuz, setSelectedJuz] = useState("");
  const [selectedPembaca, setSelectedPembaca] = useState("");
  const [newPembacaNama, setNewPembacaNama] = useState("");
  const [bulkAssignPembaca, setBulkAssignPembaca] = useState("");
  const [selectedJuzList, setSelectedJuzList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Get toast function from the hook
  const { toast } = useToast();

  // Daftar pembaca (seharusnya dari database, namun ini contoh saja)
  const addPembaca = () => {
    if (newPembacaNama.trim() !== "" && !pembacaList.includes(newPembacaNama.trim())) {
      setPembacaList([...pembacaList, newPembacaNama.trim()]);
      setNewPembacaNama("");
      localStorage.setItem("pembacaList", JSON.stringify([...pembacaList, newPembacaNama.trim()]));
    }
  };

  useEffect(() => {
    // Load daftar pembaca dari localStorage
    const savedPembacaList = localStorage.getItem("pembacaList");
    if (savedPembacaList) {
      setPembacaList(JSON.parse(savedPembacaList));
    }

    // Load data juz
    const juzRef = ref(db, "juz_tracking");
    onValue(juzRef, (snapshot) => {
      const data = snapshot.val() || {};
      setJuzData(data);
    });
  }, []);

  const handleAssignPembaca = async () => {
    if (selectedJuz && selectedPembaca) {
      setIsLoading(true);
      const success = await tetapkanPembaca(selectedJuz, selectedPembaca);
      setIsLoading(false);

      if (success) {
        toast({
          title: "Berhasil",
          description: `Juz ${selectedJuz} berhasil ditugaskan kepada ${selectedPembaca}`,
        });
      } else {
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat menetapkan pembaca",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkAssign = async () => {
    if (selectedJuzList.length > 0 && bulkAssignPembaca) {
      setIsLoading(true);
      const success = await tetapkanBeberapaJuz(selectedJuzList, bulkAssignPembaca);
      setIsLoading(false);

      if (success) {
        toast({
          title: "Berhasil",
          description: `${selectedJuzList.length} juz berhasil ditugaskan kepada ${bulkAssignPembaca}`,
        });
        setSelectedJuzList([]);
      } else {
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat menetapkan beberapa juz",
          variant: "destructive",
        });
      }
    }
  };

  const toggleJuzSelection = (juz) => {
    if (selectedJuzList.includes(juz)) {
      setSelectedJuzList(selectedJuzList.filter((j) => j !== juz));
    } else {
      setSelectedJuzList([...selectedJuzList, juz]);
    }
  };

  const selectAllJuz = () => {
    if (selectedJuzList.length === 30) {
      setSelectedJuzList([]);
    } else {
      setSelectedJuzList(Array.from({ length: 30 }, (_, i) => (i + 1).toString()));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserCog className="text-emerald-600 dark:text-emerald-400 h-8 w-8" />
            <h1 className="text-4xl font-arabic font-bold text-emerald-800 dark:text-emerald-200">Admin Panel</h1>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400">Pengaturan Tracking Al-Qur'an Ramadhan 1446H</p>
        </div>

        <Tabs defaultValue="assign">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="assign">Penugasan Juz</TabsTrigger>
            <TabsTrigger value="pembaca">Kelola Pembaca</TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Penugasan Juz Individu</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="juz-select">Pilih Juz</Label>
                    <Select value={selectedJuz} onValueChange={setSelectedJuz}>
                      <SelectTrigger id="juz-select">
                        <SelectValue placeholder="Pilih Juz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                          <SelectItem key={juz} value={juz.toString()}>
                            Juz {juz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pembaca-select">Pilih Pembaca</Label>
                    <Select value={selectedPembaca} onValueChange={setSelectedPembaca}>
                      <SelectTrigger id="pembaca-select">
                        <SelectValue placeholder="Pilih Pembaca" />
                      </SelectTrigger>
                      <SelectContent>
                        {pembacaList.map((pembaca) => (
                          <SelectItem key={pembaca} value={pembaca}>
                            {pembaca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleAssignPembaca} disabled={!selectedJuz || !selectedPembaca || isLoading}>
                    {isLoading ? "Menyimpan..." : "Tetapkan Pembaca"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Penugasan Massal</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-pembaca-select">Pilih Pembaca</Label>
                    <Select value={bulkAssignPembaca} onValueChange={setBulkAssignPembaca}>
                      <SelectTrigger id="bulk-pembaca-select">
                        <SelectValue placeholder="Pilih Pembaca" />
                      </SelectTrigger>
                      <SelectContent>
                        {pembacaList.map((pembaca) => (
                          <SelectItem key={pembaca} value={pembaca}>
                            {pembaca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Pilih Beberapa Juz</Label>
                      <Button variant="outline" size="sm" onClick={selectAllJuz}>
                        {selectedJuzList.length === 30 ? "Batal Pilih Semua" : "Pilih Semua"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                        <Button
                          key={juz}
                          variant={selectedJuzList.includes(juz.toString()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleJuzSelection(juz.toString())}
                          className={selectedJuzList.includes(juz.toString()) ? "bg-emerald-600" : ""}
                        >
                          {juz}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleBulkAssign} disabled={selectedJuzList.length === 0 || !bulkAssignPembaca || isLoading}>
                    {isLoading ? "Menyimpan..." : `Tetapkan ${selectedJuzList.length} Juz`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Status Penugasan Juz</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Juz</TableHead>
                        <TableHead>Pembaca yang Ditugaskan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dibaca Oleh</TableHead>
                        <TableHead>Waktu Selesai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(juzData).map(([juz, data]) => (
                        <TableRow key={juz}>
                          <TableCell>Juz {juz}</TableCell>
                          <TableCell>{data.penugasan || "-"}</TableCell>
                          <TableCell>{data.status}</TableCell>
                          <TableCell>{data.dibaca_oleh || "-"}</TableCell>
                          <TableCell>{data.waktu_selesai || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pembaca">
            <Card className="bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Kelola Daftar Pembaca</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-pembaca">Tambah Pembaca Baru</Label>
                    <Input id="new-pembaca" placeholder="Nama pembaca" value={newPembacaNama} onChange={(e) => setNewPembacaNama(e.target.value)} className="bg-white/70 dark:bg-emerald-800/70" />
                  </div>
                  <Button onClick={addPembaca} disabled={!newPembacaNama.trim()}>
                    Tambah
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-emerald-800 dark:text-emerald-200">Daftar Pembaca</h3>
                  {pembacaList.length > 0 ? (
                    <div className="space-y-2">
                      {pembacaList.map((pembaca, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/30 dark:bg-emerald-800/30 rounded-md">
                          <span>{pembaca}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newList = pembacaList.filter((_, i) => i !== index);
                              setPembacaList(newList);
                              localStorage.setItem("pembacaList", JSON.stringify(newList));
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-md">
                      <AlertCircle className="h-5 w-5" />
                      <p>Belum ada pembaca yang terdaftar. Tambahkan pembaca terlebih dahulu.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
