// components/QuranTracker.jsx
"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function QuranTracker() {
  const [juzData, setJuzData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek auth user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchReadingProgress(session.user.id);
      } else {
        // Initialize juz data for non-authenticated users
        initializeJuzData();
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const initializeJuzData = () => {
    const juzArray = [];
    for (let i = 1; i <= 30; i++) {
      juzArray.push({
        juzNumber: i,
        isCompleted: false,
        lastReadDate: null,
        notes: ''
      });
    }
    setJuzData(juzArray);
  };

  const fetchReadingProgress = async (userId) => {
    try {
      // Menggunakan Prisma untuk fetch data
      const progress = await prisma.readingProgress.findMany({
        where: { userId }
      });
      
      // Initialize juz data with existing progress
      const juzArray = [];
      for (let i = 1; i <= 30; i++) {
        const juzProgress = progress.find(p => p.juzNumber === i);
        
        juzArray.push({
          juzNumber: i,
          isCompleted: juzProgress ? juzProgress.isCompleted : false,
          lastReadDate: juzProgress ? juzProgress.lastReadDate : null,
          notes: juzProgress ? juzProgress.notes : ''
        });
      }
      
      setJuzData(juzArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      initializeJuzData();
      setLoading(false);
    }
  };

  const toggleJuzCompletion = async (juzNumber) => {
    if (!user) {
      // Update local state for non-authenticated users
      setJuzData(juzData.map(juz => {
        if (juz.juzNumber === juzNumber) {
          return {
            ...juz,
            isCompleted: !juz.isCompleted,
            lastReadDate: !juz.isCompleted ? new Date() : null
          };
        }
        return juz;
      }));
      return;
    }

    try {
      const juz = juzData.find(j => j.juzNumber === juzNumber);
      const newCompletionStatus = !juz.isCompleted;
      
      // Menggunakan Prisma untuk update data
      const updatedProgress = await prisma.readingProgress.upsert({
        where: { 
          userId_juzNumber: {
            userId: user.id,
            juzNumber: juzNumber
          }
        },
        update: {
          isCompleted: newCompletionStatus,
          lastReadDate: newCompletionStatus ? new Date() : null
        },
        create: {
          userId: user.id,
          juzNumber: juzNumber,
          isCompleted: newCompletionStatus,
          lastReadDate: newCompletionStatus ? new Date() : null
        }
      });
      
      // Update local state
      setJuzData(juzData.map(juz => {
        if (juz.juzNumber === juzNumber) {
          return {
            ...juz,
            isCompleted: newCompletionStatus,
            lastReadDate: newCompletionStatus ? updatedProgress.lastReadDate : null
          };
        }
        return juz;
      }));
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const addNote = async (juzNumber, note) => {
    if (!user) return;
    
    try {
      // Menggunakan Prisma untuk update note
      await prisma.readingProgress.upsert({
        where: { 
          userId_juzNumber: {
            userId: user.id,
            juzNumber: juzNumber
          }
        },
        update: { notes: note },
        create: {
          userId: user.id,
          juzNumber: juzNumber,
          notes: note
        }
      });
      
      // Update local state
      setJuzData(juzData.map(juz => {
        if (juz.juzNumber === juzNumber) {
          return { ...juz, notes: note };
        }
        return juz;
      }));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Fungsi handler terpisah untuk card
  const handleCardClick = (juzNumber) => {
    toggleJuzCompletion(juzNumber);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Quran Reading Tracker</h1>
      
      {!user && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Login untuk menyimpan progress secara permanen.</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {juzData.map((juz) => (
          <div 
            key={juz.juzNumber}
            className={`border rounded-lg p-4 transition-colors ${
              juz.isCompleted ? 'bg-green-100 border-green-500' : 'bg-white'
            }`}
          >
            <div 
              className="cursor-pointer"
              onClick={() => handleCardClick(juz.juzNumber)}
            >
              <h3 className="font-bold text-lg">Juz {juz.juzNumber}</h3>
              <p className="text-sm">{juz.isCompleted ? 'Sudah dibaca' : 'Belum dibaca'}</p>
              {juz.lastReadDate && (
                <p className="text-xs text-gray-600 mt-1">
                  Terakhir dibaca: {new Date(juz.lastReadDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {user && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  placeholder="Catatan..."
                  className="w-full text-sm p-1 border rounded"
                  value={juz.notes || ''}
                  onChange={(e) => addNote(juz.juzNumber, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-bold text-xl mb-2">Statistik</h2>
        <p>Juz selesai dibaca: {juzData.filter(j => j.isCompleted).length} dari 30</p>
        <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
          <div 
            className="bg-green-600 h-4 rounded-full"
            style={{ width: `${(juzData.filter(j => j.isCompleted).length / 30) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}