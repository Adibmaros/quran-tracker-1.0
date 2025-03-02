"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { tetapkanPembaca, tetapkanBeberapaJuz, getAllJuzData, resetAllProgress } from "../../lib/firebaseFunctions";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog, Save, Users, BookOpen, AlertCircle, Edit, X, RefreshCw, AlertTriangle, FileUp, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const [juzData, setJuzData] = useState({});
  const [pembacaList, setPembacaList] = useState([]);
  const [selectedJuz, setSelectedJuz] = useState("");
  const [selectedPembaca, setSelectedPembaca] = useState("");
  const [newPembacaNama, setNewPembacaNama] = useState("");
  const [bulkAssignPembaca, setBulkAssignPembaca] = useState("");
  const [selectedJuzList, setSelectedJuzList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  // State for filtering
  const [filterPembaca, setFilterPembaca] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Add these new states for bulk import and rotation
  const [bulkImportText, setBulkImportText] = useState("");
  const [shiftDays, setShiftDays] = useState(1);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { toast } = useToast();

  // Add a new pembaca
  const addPembaca = () => {
    if (newPembacaNama.trim() !== "" && !pembacaList.includes(newPembacaNama.trim())) {
      setPembacaList([...pembacaList, newPembacaNama.trim()]);
      setNewPembacaNama("");
      localStorage.setItem("pembacaList", JSON.stringify([...pembacaList, newPembacaNama.trim()]));
    }
  };

  useEffect(() => {
    // Load pembaca list from localStorage
    const savedPembacaList = localStorage.getItem("pembacaList");
    if (savedPembacaList) {
      setPembacaList(JSON.parse(savedPembacaList));
    }

    // Load juz data
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

  // Handle reset all progress
  const handleResetAllProgress = async () => {
    setIsResetting(true);
    try {
      await resetAllProgress();
      toast({
        title: "Berhasil",
        description: "Seluruh progress pembacaan telah direset",
      });
      setResetDialogOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mereset progress",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleJuzSelection = (juz) => {
    if (selectedJuzList.includes(juz.toString())) {
      setSelectedJuzList(selectedJuzList.filter((j) => j !== juz.toString()));
    } else {
      setSelectedJuzList([...selectedJuzList, juz.toString()]);
    }
  };

  const selectAllJuz = () => {
    if (selectedJuzList.length === 30) {
      setSelectedJuzList([]);
    } else {
      setSelectedJuzList(Array.from({ length: 30 }, (_, i) => (i + 1).toString()));
    }
  };

  // Reassign a juz to different pembaca directly from table
  const handleReassignJuz = async (juz, newPembaca) => {
    setIsLoading(true);
    const success = await tetapkanPembaca(juz, newPembaca);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Berhasil",
        description: `Juz ${juz} berhasil direassign kepada ${newPembaca}`,
      });
    } else {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mereassign pembaca",
        variant: "destructive",
      });
    }
  };

  // Quick reassign action for each row
  const QuickReassign = ({ juz, currentPembaca }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newPembaca, setNewPembaca] = useState(currentPembaca || "");

    const handleSave = async () => {
      if (newPembaca !== currentPembaca) {
        await handleReassignJuz(juz, newPembaca);
      }
      setIsEditing(false);
    };

    return isEditing ? (
      <div className="flex items-center gap-2">
        <Select value={newPembaca} onValueChange={setNewPembaca}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Pembaca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-</SelectItem>
            {pembacaList.map((pembaca) => (
              <SelectItem key={pembaca} value={pembaca}>
                {pembaca}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span>{currentPembaca || "-"}</span>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Function to parse the imported text
  const parseImportedAssignments = (text) => {
    try {
      // Split the text into lines
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const assignments = [];

      // Regular expression to extract the Juz number
      const juzRegex = /Juz\s*(\d+)/i;

      for (const line of lines) {
        // Try to match the pattern: number. Name (Juz X)
        const nameParts = line.split("(");

        if (nameParts.length >= 2) {
          // Extract name (remove leading number and dot if present)
          let name = nameParts[0].trim();
          name = name.replace(/^\d+\.\s*⁠*/, "").trim();

          // Extract Juz number
          const juzMatch = juzRegex.exec(nameParts[1]);
          if (juzMatch && juzMatch[1]) {
            let juzNum = parseInt(juzMatch[1]);

            // Handle formatting to ensure two digits
            assignments.push({
              nama: name,
              juz: juzNum.toString().padStart(2, "0"),
            });
          }
        }
      }

      return assignments;
    } catch (error) {
      console.error("Error parsing imported text:", error);
      return [];
    }
  };

  // Function to apply the imported assignments
  const applyImportedAssignments = async () => {
    const assignments = parseImportedAssignments(bulkImportText);

    if (assignments.length === 0) {
      toast({
        title: "Gagal",
        description: "Tidak dapat memparsing format teks yang dimasukkan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, ensure all pembaca are added to the list
      const updatedPembacaList = [...pembacaList];

      for (const assignment of assignments) {
        if (!updatedPembacaList.includes(assignment.nama)) {
          updatedPembacaList.push(assignment.nama);
        }
      }

      // Update pembaca list if needed
      if (updatedPembacaList.length !== pembacaList.length) {
        setPembacaList(updatedPembacaList);
        localStorage.setItem("pembacaList", JSON.stringify(updatedPembacaList));
      }

      // Apply assignments
      for (const assignment of assignments) {
        // Convert juz format from "01" to "1"
        const juzNormal = parseInt(assignment.juz).toString();
        await tetapkanPembaca(juzNormal, assignment.nama);
      }

      toast({
        title: "Berhasil",
        description: `${assignments.length} penugasan berhasil diterapkan`,
      });

      setShowImportDialog(false);
      setBulkImportText("");
    } catch (error) {
      toast({
        title: "Gagal",
        description: `Terjadi kesalahan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to rotate assignments by a number of days
  const rotateAssignments = async () => {
    setIsLoading(true);

    try {
      // Get current assignments
      const allJuzData = await getAllJuzData();
      const currentAssignments = {};

      // Create a map of juz to pembaca
      Object.entries(allJuzData).forEach(([juz, data]) => {
        if (data.penugasan) {
          currentAssignments[juz] = data.penugasan;
        }
      });

      // If no assignments exist, show error
      if (Object.keys(currentAssignments).length === 0) {
        throw new Error("Tidak ada penugasan yang dapat diputar");
      }

      // Create a map of all juz (1-30)
      const allJuz = Array.from({ length: 30 }, (_, i) => (i + 1).toString());

      // Calculate new assignments with rotation
      const newAssignments = {};

      for (const juz of allJuz) {
        if (!currentAssignments[juz]) continue;

        // Calculate new juz number after rotation
        const currentJuzNum = parseInt(juz);
        let newJuzNum = (currentJuzNum + shiftDays) % 30;
        if (newJuzNum === 0) newJuzNum = 30; // Handle the case for juz 30

        // Assign the same pembaca to the new juz
        newAssignments[newJuzNum.toString()] = currentAssignments[juz];
      }

      // Apply new assignments
      for (const [juz, pembaca] of Object.entries(newAssignments)) {
        await tetapkanPembaca(juz, pembaca);
      }

      toast({
        title: "Berhasil",
        description: `Penugasan berhasil dirotasi ${shiftDays} hari ke depan`,
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: `Terjadi kesalahan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter juz data based on selected filters
  const filteredJuzData = Object.entries(juzData).filter(([juz, data]) => {
    // Filter by pembaca
    if (filterPembaca && data.penugasan !== filterPembaca) {
      return false;
    }

    // Filter by status
    if (filterStatus && data.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // Get unique status values
  const statusOptions = ["Belum Dibaca", "Sudah Dibaca"];

  // Calculate stats
  const totalJuz = Object.keys(juzData).length;
  const completedJuz = Object.values(juzData).filter((data) => data.status === "Sudah Dibaca").length;
  const progressPercentage = totalJuz > 0 ? Math.round((completedJuz / totalJuz) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950">
      <div className="mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserCog className="text-emerald-600 dark:text-emerald-400 h-8 w-8" />
            <h1 className="text-4xl font-arabic font-bold text-emerald-800 dark:text-emerald-200">Admin Panel</h1>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400">Pengaturan Tracking Al-Qur'an Ramadhan 1446H</p>

          {/* Overall progress display */}
          <div className="mt-4 p-4 bg-white/50 dark:bg-emerald-800/50 rounded-lg inline-block">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Progress Keseluruhan</p>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{progressPercentage}%</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {completedJuz} dari {totalJuz} juz
                </p>
              </div>

              {/* Reset button */}
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
                    <RefreshCw className="h-4 w-4" />
                    Reset Progress
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                      Reset Semua Progress
                    </DialogTitle>
                    <DialogDescription>Tindakan ini akan mengembalikan semua status pembacaan menjadi "Belum Dibaca" tetapi tetap mempertahankan penugasan pembaca. Apakah Anda yakin ingin melanjutkan?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={handleResetAllProgress} disabled={isResetting}>
                      {isResetting ? "Mereset..." : "Ya, Reset Semua"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="assign">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="assign">Penugasan Juz</TabsTrigger>
            <TabsTrigger value="pembaca">Kelola Pembaca</TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            {/* Add Rotation Card as the first card in the assign tab */}
            <Card className="mb-6 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Rotasi Harian</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="bg-amber-50/50 dark:bg-amber-800/20 p-3 rounded-md mb-4">
                      <p className="text-amber-700 dark:text-amber-300 text-sm">Import daftar penugasan dari format teks, atau rotasi penugasan yang sudah ada ke hari berikutnya.</p>
                    </div>

                    <Button className="w-full mb-2" variant="outline" onClick={() => setShowImportDialog(true)}>
                      <FileUp className="h-4 w-4 mr-2" />
                      Import Daftar Penugasan
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="shift-days">Rotasi Maju (Hari)</Label>
                        <Input id="shift-days" type="number" min="1" max="29" value={shiftDays} onChange={(e) => setShiftDays(parseInt(e.target.value) || 1)} className="bg-white/70 dark:bg-emerald-800/70" />
                      </div>
                      <Button onClick={rotateAssignments} disabled={isLoading}>
                        {isLoading ? "Memproses..." : "Rotasi"}
                      </Button>
                    </div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Contoh: Jika Putri memiliki Juz 3 hari ini, setelah rotasi 1 hari dia akan mendapatkan Juz 4.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                          const juzInfo = juzData[juz.toString()];
                          return (
                            <SelectItem key={juz} value={juz.toString()}>
                              Juz {juz} {juzInfo?.penugasan ? `(${juzInfo.penugasan})` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedJuz && juzData[selectedJuz]?.penugasan && <p className="text-amber-600 text-sm mt-1">Juz ini sudah ditugaskan kepada: {juzData[selectedJuz]?.penugasan}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pembaca-select">Pilih Pembaca</Label>
                    <Select value={selectedPembaca} onValueChange={setSelectedPembaca}>
                      <SelectTrigger id="pembaca-select">
                        <SelectValue placeholder="Pilih Pembaca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {pembacaList.map((pembaca) => (
                          <SelectItem key={pembaca} value={pembaca}>
                            {pembaca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleAssignPembaca} disabled={!selectedJuz || isLoading}>
                    {isLoading ? "Menyimpan..." : juzData[selectedJuz]?.penugasan ? "Perbarui Penugasan" : "Tetapkan Pembaca"}
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
                        <SelectItem value="none">-</SelectItem>
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
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                        const juzStr = juz.toString();
                        const hasAssignment = juzData[juzStr]?.penugasan;
                        return (
                          <Button
                            key={juz}
                            variant={selectedJuzList.includes(juzStr) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleJuzSelection(juzStr)}
                            className={`${selectedJuzList.includes(juzStr) ? "bg-emerald-600" : ""} ${hasAssignment ? "border-amber-400" : ""}`}
                          >
                            {juz}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleBulkAssign} disabled={selectedJuzList.length === 0 || isLoading}>
                    {isLoading ? "Menyimpan..." : `Tetapkan ${selectedJuzList.length} Juz`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Status Penugasan Juz</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Select value={filterPembaca} onValueChange={setFilterPembaca}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Filter Pembaca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Pembaca</SelectItem>
                        {pembacaList.map((pembaca) => (
                          <SelectItem key={pembaca} value={pembaca}>
                            {pembaca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(filterPembaca || filterStatus) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterPembaca("");
                          setFilterStatus("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                      {filteredJuzData.map(([juz, data]) => (
                        <TableRow key={juz} className={data.status === "Sudah Dibaca" ? "bg-emerald-100/50 dark:bg-emerald-800/30" : ""}>
                          <TableCell>Juz {juz}</TableCell>
                          <TableCell>
                            <QuickReassign juz={juz} currentPembaca={data.penugasan} />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={data.status === "Sudah Dibaca" ? "success" : "outline"}
                              className={data.status === "Sudah Dibaca" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}
                            >
                              {data.status || "Belum Dibaca"}
                            </Badge>
                          </TableCell>
                          <TableCell>{data.pembaca || "-"}</TableCell>
                          <TableCell>
                            {data.timestamp
                              ? new Date(data.timestamp).toLocaleString("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </TableCell>
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
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="new-pembaca">Tambah Pembaca Baru</Label>
                        <Input id="new-pembaca" placeholder="Nama pembaca" value={newPembacaNama} onChange={(e) => setNewPembacaNama(e.target.value)} className="bg-white/70 dark:bg-emerald-800/70" />
                      </div>
                      <Button onClick={addPembaca} disabled={!newPembacaNama.trim()}>
                        Tambah
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Label>Daftar Pembaca</Label>
                    <div className="mt-2 p-3 bg-white/70 dark:bg-emerald-800/70 rounded-md max-h-40 overflow-y-auto">
                      {pembacaList.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                          Belum ada pembaca yang ditambahkan
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {pembacaList.map((pembaca) => (
                            <li key={pembaca} className="flex items-center justify-between py-1 px-2 rounded hover:bg-emerald-100/50 dark:hover:bg-emerald-700/50">
                              <span>{pembaca}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setPembacaList(pembacaList.filter((p) => p !== pembaca));
                                  localStorage.setItem("pembacaList", JSON.stringify(pembacaList.filter((p) => p !== pembaca)));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-emerald-600" />
                Import Penugasan Juz
              </DialogTitle>
              <DialogDescription>Paste daftar penugasan dalam format: "1. Nama (Juz X)"</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder="Contoh:
1. Putri Nisrina (Juz 3)
2. Nabiilah Azzahra (Juz 4)
..."
                className="min-h-[200px] bg-white/70 dark:bg-emerald-800/70"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Batal
              </Button>
              <Button onClick={applyImportedAssignments} disabled={isLoading || !bulkImportText.trim()}>
                {isLoading ? "Memproses..." : "Import Penugasan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
