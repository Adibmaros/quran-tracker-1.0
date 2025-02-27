"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import QuranTracker from "@/components/QuranTracker";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex h-16 items-center justify-between py-4">
            <h1 className="text-2xl font-bold tracking-tight">Al-Quran Tracker</h1>
            {!session ? (
              <div className="hidden md:block w-[320px]">
                <AuthForm />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
                <Button variant="destructive" onClick={() => supabase.auth.signOut()}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {session ? (
            <QuranTracker />
          ) : (
            <Card className="max-w-[640px] mx-auto mt-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Selamat Datang di Al-Quran Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground text-lg mb-8">Silakan login untuk mulai melacak bacaan Al-Quran Anda</p>
                <div className="md:hidden">
                  <AuthForm />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t bg-muted mt-auto">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex h-16 items-center justify-center">
            <p className="text-sm text-muted-foreground">Al-Quran Tracker &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
