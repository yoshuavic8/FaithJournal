"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, MenuIcon, Coffee } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  emotion: string;
  preview: string;
}

interface JournalInterfaceProps {
  todayEntries?: JournalEntry[];
  yesterdayEntries?: JournalEntry[];
  onNewEntry?: () => void;
  onViewStatistics?: () => void;
  isLoading?: boolean;
}

export default function JournalInterface({
  todayEntries = [],
  yesterdayEntries = [],
  onNewEntry = () => console.log("New entry clicked"),
  onViewStatistics = () => console.log("View statistics clicked"),
  isLoading = false,
}: JournalInterfaceProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Determine if banner should be shown randomly when component mounts
  useEffect(() => {
    // Show banner with 30% probability
    const shouldShowBanner = Math.random() < 0.3;
    setShowBanner(shouldShowBanner);

    // If banner is shown, set a timer to hide it after 10 seconds
    if (shouldShowBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 10000); // 10 seconds

      // Clean up timer on component unmount
      return () => clearTimeout(timer);
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with menu */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Journal</h1>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#1A1A1A] text-white border-[#333]">
              <div className="flex flex-col gap-4 pt-6">
                <h2 className="text-xl font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={onViewStatistics}
                >
                  Statistics & Reports
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => router.push('/account')}
                >
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => router.push('/help')}
                >
                  Help & Support
                </Button>
                {/* Support Us button - Comment this section to hide it */}
                <Button
                  variant="ghost"
                  className="justify-start text-[#FF9D66]"
                  onClick={() => router.push('/support-us')}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Buy Me a Coffee
                </Button>
                {user?.email === 'admin@faithjournal.com' && (
                  <Button
                    variant="ghost"
                    className="justify-start text-[#6C63FF]"
                    onClick={() => router.push('/admin')}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="justify-start text-red-400"
                  onClick={signOut}
                >
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Donation Banner - Shows randomly and disappears after a delay */}
        {showBanner && (
          <div className="px-4 mb-4 animate-fade-in">
            <div
              className="bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] rounded-lg p-3 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-colors"
              onClick={() => router.push('/support-us')}
            >
              <div className="flex items-center">
                <div className="bg-[#FF9D66]/20 p-2 rounded-full mr-3">
                  <Coffee className="h-5 w-5 text-[#FF9D66]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Enjoying Faith Journal?</p>
                  <p className="text-xs text-gray-400">Support the developer with a coffee</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBanner(false);
                  }}
                >
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF9D66]/30 bg-[#FF9D66] text-black font-medium hover:bg-[#FF9D66]/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/support-us');
                  }}
                >
                  Support
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Journal entries */}
        <div className="space-y-6 mb-24">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
            </div>
          ) : todayEntries.length === 0 && yesterdayEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                No journal entries yet. Create your first entry!
              </p>
            </div>
          ) : (
            <>
              {/* Today's entries */}
              {todayEntries.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Today</h2>
                  {todayEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="bg-[#1A1A1A] border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/journal/${entry.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{entry.emotion}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-1">
                              {formatDate(entry.date)}
                            </p>
                            <p className="text-white">{entry.preview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Yesterday's entries */}
              {yesterdayEntries.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Yesterday</h2>
                  {yesterdayEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="bg-[#1A1A1A] border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/journal/${entry.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{entry.emotion}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-1">
                              {formatDate(entry.date)}
                            </p>
                            <p className="text-white">{entry.preview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-[70px] left-1/2 transform -translate-x-1/2">
          <Button
            onClick={onNewEntry}
            className="h-14 w-14 rounded-full bg-[#6C63FF] hover:bg-[#5A52D5] shadow-lg"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
