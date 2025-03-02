"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PieChart, BarChart, Award, Users, Download, Clock, Calendar, BookOpen, TrendingUp, Star } from "lucide-react";
import { getReadingStats, getReaderHistory } from "../../lib/firebaseFunctions";

export default function StatsDashboard() {
  const [stats, setStats] = useState({
    totalJuz: 30,
    completedJuz: 0,
    assignedJuz: 0,
    uniqueReaders: 0,
    juzPerReader: {},
  });

  const [earliestReaders, setEarliestReaders] = useState([]);
  const [readerHistory, setReaderHistory] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [topReaders, setTopReaders] = useState([]);
  const [weeklyComparison, setWeeklyComparison] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get general reading stats
        const readingStats = await getReadingStats();
        setStats(readingStats);

        // Get reader history
        const history = await getReaderHistory();
        setReaderHistory(history);

        // Process today's readers
        const today = new Date().toISOString().split("T")[0];
        const todaysReaders = history
          .filter((entry) => entry.date === today)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(0, 5);
        setEarliestReaders(todaysReaders);

        // Process top readers
        const readerCountMap = {};
        history.forEach((entry) => {
          if (!readerCountMap[entry.name]) readerCountMap[entry.name] = 0;
          readerCountMap[entry.name]++;
        });

        const sortedReaders = Object.entries(readerCountMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));
        setTopReaders(sortedReaders);

        // Process daily progress for the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split("T")[0];

          const entriesOnDate = history.filter((entry) => entry.date === dateString);
          const uniqueJuzRead = new Set(entriesOnDate.map((entry) => entry.juz)).size;

          last7Days.push({
            date: dateString,
            count: uniqueJuzRead,
            label: date.toLocaleDateString("id-ID", { weekday: "short" }),
          });
        }
        setDailyProgress(last7Days);

        // Calculate weekly comparison
        const thisWeekEntries = history.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        });

        const lastWeekEntries = history.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          const twoWeeksAgo = new Date();
          const oneWeekAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
        });

        const thisWeekCount = thisWeekEntries.length;
        const lastWeekCount = lastWeekEntries.length;
        const percentChange = lastWeekCount ? (((thisWeekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1) : 100;

        setWeeklyComparison({
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
          percentChange: percentChange,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const remainingJuz = stats.totalJuz - stats.completedJuz;
  const unassignedJuz = stats.totalJuz - stats.assignedJuz;

  // Function to download reader history as CSV
  const downloadReaderHistory = () => {
    if (readerHistory.length === 0) return;

    // Create CSV headers
    const headers = ["Name", "Juz", "Date", "Time"];

    // Create CSV rows
    const rows = readerHistory.map((entry) => {
      const timestamp = new Date(entry.timestamp);
      const time = timestamp.toLocaleTimeString();
      return [entry.name, entry.juz, entry.date, time];
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reader-history-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const estimatedCompletionDate = () => {
    if (dailyProgress.length === 0 || stats.completedJuz >= stats.totalJuz) return "Sudah selesai";

    // Calculate average juz read per day from the last 7 days
    const totalJuzLastWeek = dailyProgress.reduce((sum, day) => sum + day.count, 0);
    const avgJuzPerDay = totalJuzLastWeek / dailyProgress.length;

    if (avgJuzPerDay <= 0) return "Tidak dapat diperkirakan";

    // Calculate days needed to complete remaining juz
    const daysNeeded = Math.ceil(remainingJuz / avgJuzPerDay);

    // Calculate estimated completion date
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);

    return completionDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 my-4 mb-8">
      {/* Main Stats Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800 md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Statistik Bacaan</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-100/50 dark:bg-emerald-800/50 rounded-lg text-center">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm mb-1">Juz Selesai</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedJuz}</p>
              <p className="text-emerald-600/70 dark:text-emerald-400/70 text-xs">dari {stats.totalJuz} juz</p>
            </div>

            <div className="p-4 bg-amber-100/50 dark:bg-amber-800/50 rounded-lg text-center">
              <p className="text-amber-800 dark:text-amber-200 text-sm mb-1">Juz Belum Selesai</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{remainingJuz}</p>
              <p className="text-amber-600/70 dark:text-amber-400/70 text-xs">dari {stats.totalJuz} juz</p>
            </div>

            <div className="p-4 bg-blue-100/50 dark:bg-blue-800/50 rounded-lg text-center">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-1">Juz Ditugaskan</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.assignedJuz}</p>
              <p className="text-blue-600/70 dark:text-blue-400/70 text-xs">dari {stats.totalJuz} juz</p>
            </div>

            <div className="p-4 bg-purple-100/50 dark:bg-purple-800/50 rounded-lg text-center">
              <p className="text-purple-800 dark:text-purple-200 text-sm mb-1">Juz Belum Ditugaskan</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{unassignedJuz}</p>
              <p className="text-purple-600/70 dark:text-purple-400/70 text-xs">dari {stats.totalJuz} juz</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Comparison Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-cyan-200 dark:bg-cyan-900/50 dark:border-cyan-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">Perbandingan Mingguan</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-cyan-100/50 dark:bg-cyan-800/50 rounded-lg text-center">
                <p className="text-cyan-800 dark:text-cyan-200 text-xs mb-1">Minggu Ini</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{weeklyComparison.thisWeek}</p>
                <p className="text-cyan-600/70 dark:text-cyan-400/70 text-xs">bacaan</p>
              </div>
              <div className="p-3 bg-cyan-100/50 dark:bg-cyan-800/50 rounded-lg text-center">
                <p className="text-cyan-800 dark:text-cyan-200 text-xs mb-1">Minggu Lalu</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{weeklyComparison.lastWeek}</p>
                <p className="text-cyan-600/70 dark:text-cyan-400/70 text-xs">bacaan</p>
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${parseFloat(weeklyComparison.percentChange) >= 0 ? "bg-green-100/50 dark:bg-green-800/50" : "bg-red-100/50 dark:bg-red-800/50"}`}>
              <p className={`text-sm font-medium ${parseFloat(weeklyComparison.percentChange) >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {parseFloat(weeklyComparison.percentChange) >= 0 ? "↑ " : "↓ "}
                {Math.abs(parseFloat(weeklyComparison.percentChange))}%{parseFloat(weeklyComparison.percentChange) >= 0 ? " peningkatan" : " penurunan"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card className="md:col-span-3 bg-white/50 backdrop-blur-sm border-cyan-200 dark:bg-cyan-900/50 dark:border-cyan-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">Progres Keseluruhan</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-1000"
              style={{ width: `${Math.max(5, (stats.completedJuz / stats.totalJuz) * 100)}%` }}
            >
              {Math.round((stats.completedJuz / stats.totalJuz) * 100)}%
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              {stats.completedJuz} dari {stats.totalJuz} juz selesai
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>Estimasi selesai: {estimatedCompletionDate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800 md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Progres Harian (7 Hari Terakhir)</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between space-x-2">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Memuat data...</p>
              </div>
            ) : dailyProgress.length > 0 ? (
              dailyProgress.map((day, index) => {
                // Find max value for scaling
                const maxCount = Math.max(...dailyProgress.map((d) => d.count), 1);
                const height = (day.count / maxCount) * 100;

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(5, height)}%` }}></div>
                    <div className="mt-2 text-xs text-center">
                      <div className="text-indigo-600 dark:text-indigo-300 font-semibold">{day.count}</div>
                      <div className="text-gray-500 dark:text-gray-400">{day.label}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 italic">Belum ada data progres harian</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Readers Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-amber-200 dark:bg-amber-900/50 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Pembaca Terbaik</h2>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data...</div>
          ) : topReaders.length > 0 ? (
            <div className="space-y-3">
              {topReaders.map((reader, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-900">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-amber-400" : index === 2 ? "bg-amber-300" : "bg-amber-200"}`}>{index + 1}</div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{reader.name}</span>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">{reader.count} juz</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">Belum ada data pembaca</div>
          )}
        </CardContent>
      </Card>

      {/* Today's Readers Card */}
      <Card className="bg-white/50 backdrop-blur-sm border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800 md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Pembaca Pagi Hari Ini</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-indigo-100/50 dark:bg-indigo-800/50 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-indigo-800 dark:text-indigo-200 text-sm">Total Pembaca</p>
                <p className="text-indigo-800 dark:text-indigo-200 text-xs opacity-70">Keseluruhan</p>
              </div>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.uniqueReaders}</p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pembaca Paling Pertama Hari Ini</h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data...</div>
              ) : earliestReaders.length > 0 ? (
                <div className="space-y-2">
                  {earliestReaders.map((reader, index) => (
                    <div key={`${reader.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-gray-100/70 dark:bg-gray-800/70">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">{index + 1}</span>
                        <span className="text-gray-800 dark:text-gray-200">{reader.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Juz {reader.juz}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{new Date(reader.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">Belum ada pembaca hari ini</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reader History Card */}
      <Card className="md:col-span-3 bg-white/50 backdrop-blur-sm border-amber-200 dark:bg-amber-900/50 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Riwayat Pembaca</h2>
            </div>
            <button
              onClick={downloadReaderHistory}
              disabled={readerHistory.length === 0 || isLoading}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-800 dark:hover:bg-amber-700 dark:text-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data...</div>
          ) : readerHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-950/50">
                    <th className="p-2 text-left text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">Nama</th>
                    <th className="p-2 text-left text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">Juz</th>
                    <th className="p-2 text-left text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">Tanggal</th>
                    <th className="p-2 text-left text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {readerHistory.slice(0, 10).map((entry, index) => {
                    const timestamp = new Date(entry.timestamp);
                    return (
                      <tr key={`history-${index}`} className="border-b border-amber-100 dark:border-amber-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/30">
                        <td className="p-2 text-gray-800 dark:text-gray-200">{entry.name}</td>
                        <td className="p-2 text-amber-700 dark:text-amber-300 font-medium">Juz {entry.juz}</td>
                        <td className="p-2 text-gray-600 dark:text-gray-400">{new Date(entry.date).toLocaleDateString("id-ID")}</td>
                        <td className="p-2 text-gray-600 dark:text-gray-400">{timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {readerHistory.length > 10 && <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">Menampilkan 10 dari {readerHistory.length} entri. Download untuk melihat semua data.</div>}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">Belum ada data riwayat pembaca</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
