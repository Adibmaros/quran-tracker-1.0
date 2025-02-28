"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { updateJuzStatus } from "../lib/firebaseFunctions";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, BookOpen, PieChart, CheckCircle2, Circle, Bell, UserCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [juzList, setJuzList] = useState({});
  const [userName, setUserName] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  const startJuz = 1;
  const juzPerDay = 10;
  const currentJuzRange = Array.from({ length: juzPerDay }, (_, i) => startJuz + i);

  useEffect(() => {
    const juzRef = ref(db, "juz_tracking");
    onValue(juzRef, (snapshot) => {
      const allJuz = snapshot.val() || {};
      const todayJuz = Object.fromEntries(Object.entries(allJuz).filter(([juz]) => currentJuzRange.includes(Number(juz))));
      setJuzList(todayJuz);

      // Process recent activities
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

  const totalJuz = Object.keys(juzList).length;
  const completedJuz = Object.values(juzList).filter((juz) => juz.status === "Sudah Dibaca").length;
  const progressPercentage = (completedJuz / totalJuz) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Moon className="text-emerald-600 dark:text-emerald-400 h-8 w-8" />
            <h1 className="text-4xl font-arabic font-bold text-emerald-800 dark:text-emerald-200">Tracker Bacaan Al-Qur'an</h1>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400">Ramadhan Kareem 1445H</p>
        </div>

        <Card className="mb-8 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Identitas Pembaca</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Masukkan nama Anda" value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-white/70 dark:bg-emerald-800/70" />
              {!userName && <p className="text-sm text-amber-600 dark:text-amber-400">ℹ️ Silakan masukkan nama Anda untuk mulai menandai bacaan</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Progress Hari Ini</h2>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400">
                Juz {startJuz} - {startJuz + juzPerDay - 1}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-emerald-700 dark:text-emerald-300">Progress Keseluruhan</span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {completedJuz} / {totalJuz} Juz
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white/50 backdrop-blur-sm border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Aktivitas Terbaru</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/30 dark:bg-emerald-800/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {activity.name} telah menyelesaikan Juz {activity.juz}
                  </span>
                  <span className="text-sm text-emerald-600/70 dark:text-emerald-400/70 ml-auto">{activity.timestamp}</span>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-center text-emerald-600/70 dark:text-emerald-400/70">Belum ada aktivitas terbaru</p>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(juzList).map(([juz, data]) => {
            const isCompleted = data.status === "Sudah Dibaca";

            return (
              <Card
                key={juz}
                className={`
                  backdrop-blur-sm transition-all duration-300
                  ${isCompleted ? "bg-emerald-100/50 dark:bg-emerald-800/50 border-emerald-300" : "bg-white/50 dark:bg-emerald-900/50 border-emerald-200"}
                `}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Juz {juz}</h2>
                    </div>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-gray-400" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700 dark:text-emerald-300">Dibaca oleh: {data.dibaca_oleh || "Belum ada"}</p>
                    {data.waktu_selesai && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        <span className="inline-block mr-1">⏱️</span>
                        Selesai pada: {data.waktu_selesai}
                      </p>
                    )}
                    <Button className={`w-full ${isCompleted ? "bg-emerald-500 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"}`} onClick={() => updateJuzStatus(juz, userName)} disabled={!userName}>
                      {isCompleted ? "✓ Selesai Dibaca" : "Tandai Selesai"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
