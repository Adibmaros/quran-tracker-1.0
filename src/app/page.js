"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { updateJuzStatus } from "../lib/firebaseFunctions";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, BookOpen, PieChart, CheckCircle2, Circle, Bell, UserCircle, User, Filter, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function Home() {
  const [juzList, setJuzList] = useState({});
  const [userName, setUserName] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const totalJuzCount = 30;
  const allJuzRange = Array.from({ length: totalJuzCount }, (_, i) => i + 1);

  useEffect(() => {
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
      setSearchInput(savedUserName);
    }

    const juzRef = ref(db, "juz_tracking");
    onValue(juzRef, (snapshot) => {
      const allJuz = snapshot.val() || {};

      const completeJuzList = {};
      allJuzRange.forEach((juz) => {
        completeJuzList[juz] = allJuz[juz] || {
          status: "Belum Dibaca",
          dibaca_oleh: "",
          waktu_selesai: null,
          penugasan: "",
        };
      });

      setJuzList(completeJuzList);

      const activities = Object.entries(allJuz)
        .filter(([_, juzData]) => juzData.waktu_selesai)
        .map(([juz, juzData]) => ({
          juz,
          name: juzData.dibaca_oleh,
          timestamp: juzData.waktu_selesai,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      setRecentActivity(activities);
    });
  }, []);

  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName);
    }
  }, [userName]);

  const handleUpdateJuz = async (juz) => {
    await updateJuzStatus(juz, userName);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setUserName(searchInput.trim());
  };

  const normalizeString = (str) => {
    return str.toLowerCase().trim();
  };

  const isAssignedToUserPartial = (penugasan, name) => {
    if (!penugasan || !name) return false;
    return normalizeString(penugasan).includes(normalizeString(name)) || normalizeString(name).includes(normalizeString(penugasan));
  };

  const totalJuz = Object.keys(juzList).length;
  const completedJuz = Object.values(juzList).filter((juz) => juz.status === "Sudah Dibaca").length;
  const progressPercentage = (completedJuz / totalJuz) * 100;

  const assignedToCurrentUser = Object.values(juzList).filter((juz) => isAssignedToUserPartial(juz.penugasan, userName)).length;
  const userCompletedJuz = Object.values(juzList).filter((juz) => isAssignedToUserPartial(juz.penugasan, userName) && juz.status === "Sudah Dibaca").length;
  const userProgressPercentage = assignedToCurrentUser > 0 ? (userCompletedJuz / assignedToCurrentUser) * 100 : 0;

  const filteredJuzRange = showOnlyAssigned && userName ? allJuzRange.filter((juz) => isAssignedToUserPartial(juzList[juz]?.penugasan, userName)) : allJuzRange;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Moon className="text-emerald-600 dark:text-emerald-400 h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-3xl md:text-4xl font-arabic font-bold text-emerald-800 dark:text-emerald-200 leading-tight">Tracker Bacaan Al-Qur'an</h1>
          </div>
          <p className="text-lg text-emerald-600 dark:text-emerald-400">Ramadhan Kareem 1446H</p>
        </div>

        <div className="mb-4 flex  justify-end">
          <Button asChild variant="outline">
            <Link href="/dashboard">Statistik Bacaan</Link>
          </Button>
        </div>

        <Card className="mb-6 shadow-lg bg-white/70 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">Identitas Pembaca</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Masukkan nama Anda"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 bg-white/90 dark:bg-emerald-800/70 text-lg py-6"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="default" onClick={handleSearch} className="w-full sm:w-auto py-6 text-lg font-medium">
                  <Search className="h-5 w-5 mr-2" />
                  Cari
                </Button>
              </div>

              {!userName && <p className="text-sm text-amber-600 dark:text-amber-400">ℹ️ Silakan masukkan nama Anda untuk mulai menandai bacaan</p>}

              {userName && assignedToCurrentUser > 0 && (
                <div className="p-4 bg-emerald-100/50 dark:bg-emerald-800/50 rounded-lg">
                  <p className="text-emerald-700 dark:text-emerald-300 mb-3 text-lg">
                    <User className="h-5 w-5 inline mr-2" />
                    <span className="font-medium">{userName}</span>, Anda ditugaskan membaca {assignedToCurrentUser} juz
                  </p>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progress Anda</span>
                      <span>
                        {userCompletedJuz} / {assignedToCurrentUser} Juz
                      </span>
                    </div>
                    <Progress value={userProgressPercentage} className="h-3" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <PieChart className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-emerald-800">Progress Keseluruhan</h2>
              </div>
              <span className="text-lg text-emerald-600 font-medium">30 Juz Al-Qur'an</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-lg">
                  <span className="text-emerald-700 dark:text-emerald-300">Progress Keseluruhan</span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {completedJuz} / {totalJuz} Juz
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-emerald-800">Aktivitas Terbaru</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-800/30">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-300 flex-1">
                    {activity.name} telah menyelesaikan Juz {activity.juz}
                  </span>
                  <span className="text-sm text-emerald-600/70">{activity.timestamp}</span>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-center text-emerald-600/70 py-4">Belum ada aktivitas terbaru</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-emerald-800">Daftar Juz</h2>
              </div>
              {userName && assignedToCurrentUser > 0 && (
                <Button variant="outline" onClick={() => setShowOnlyAssigned(!showOnlyAssigned)} className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {showOnlyAssigned ? "Tampilkan Semua" : "Hanya Juz Saya"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {userName && isSearching && filteredJuzRange.length === 0 ? (
              <div className="text-center p-6 text-amber-600">
                <p>Tidak ditemukan juz yang ditugaskan untuk "{userName}". Mohon periksa penulisan nama Anda atau hubungi admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredJuzRange.map((juz) => {
                  const juzData = juzList[juz] || { status: "Belum Dibaca", penugasan: "" };
                  const isAssignedToUser = isAssignedToUserPartial(juzData.penugasan, userName);
                  const isCompleted = juzData.status === "Sudah Dibaca";

                  return (
                    <div
                      key={juz}
                      className={`
                        bg-white/80 dark:bg-emerald-800/30 rounded-xl p-4 shadow-md
                        hover:shadow-lg transition-all
                        ${isCompleted ? "bg-emerald-500/20" : ""}
                        ${isAssignedToUser ? "border-2 border-amber-400" : ""}
                      `}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <span className="text-2xl font-bold text-emerald-700">Juz {juz}</span>

                        {juzData.penugasan && <div className="text-sm text-emerald-600 text-center">{isAssignedToUser ? "✨ Ditugaskan untuk Anda" : `Ditugaskan: ${juzData.penugasan}`}</div>}

                        <div className="flex items-center gap-2">
                          {isCompleted ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-emerald-300" />}
                          <span className="text-sm font-medium text-emerald-600">{juzData.status}</span>
                        </div>

                        {juzData.dibaca_oleh && <div className="text-sm text-emerald-600/70">Dibaca oleh: {juzData.dibaca_oleh}</div>}

                        <Button variant={isCompleted ? "destructive" : "default"} size="lg" className="w-full" disabled={!userName} onClick={() => handleUpdateJuz(juz)}>
                          {isCompleted ? "Tandai Belum" : "Tandai Sudah"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!userName && (
              <div className="text-center p-6 text-amber-600">
                <p>Silakan masukkan nama Anda di bagian Identitas Pembaca untuk melihat juz yang ditugaskan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
