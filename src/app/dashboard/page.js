"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PieChart, BarChart, Award, Users } from "lucide-react";
import { getReadingStats } from "../../lib/firebaseFunctions";

export default function StatsDashboard() {
  const [stats, setStats] = useState({
    totalJuz: 30,
    completedJuz: 0,
    assignedJuz: 0,
    uniqueReaders: 0,
    juzPerReader: {},
  });

  useEffect(() => {
    const loadStats = async () => {
      const readingStats = await getReadingStats();
      setStats(readingStats);
    };
    loadStats();
  }, []);

  // Get top readers (up to 5)
  const topReaders = Object.entries(stats.juzPerReader || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const remainingJuz = stats.totalJuz - stats.completedJuz;
  const unassignedJuz = stats.totalJuz - stats.assignedJuz;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Statistik Bacaan</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
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

      <Card className="bg-white/50 backdrop-blur-sm border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Statistik Pembaca</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-100/50 dark:bg-indigo-800/50 rounded-lg text-center">
              <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-1">Total Pembaca</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.uniqueReaders}</p>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pembaca Terbanyak</h3>
              </div>

              {topReaders.length > 0 ? (
                <div className="space-y-2">
                  {topReaders.map(([name, count], index) => (
                    <div key={name} className="flex items-center justify-between p-2 rounded-md bg-gray-100/70 dark:bg-gray-800/70">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">{index + 1}</span>
                        <span className="text-gray-800 dark:text-gray-200">{name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{count}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">juz</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">Belum ada data pembaca</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-white/50 backdrop-blur-sm border-cyan-200 dark:bg-cyan-900/50 dark:border-cyan-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">Progres Keseluruhan</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${(stats.completedJuz / stats.totalJuz) * 100}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>Progres: {Math.round((stats.completedJuz / stats.totalJuz) * 100)}%</div>
            <div>
              {stats.completedJuz} dari {stats.totalJuz} juz
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
