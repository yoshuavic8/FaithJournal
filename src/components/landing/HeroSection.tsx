"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import heroBackground from "@/assets/heroBackgroundLanscape.png";

interface HeroSectionProps {
  title?: string;
  description?: string;
}

export default function HeroSection({
  title = "Faith Journal",
  description = "Record your spiritual journey, track emotions, and receive contextual Bible verses to guide and inspire you daily.",
}: HeroSectionProps) {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src={heroBackground}
          alt="Hero Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-20">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
              className="relative w-full max-w-[500px]"
            >
              <JournalPreview />
            </motion.div>
          </div>

          <div className="flex flex-col justify-center space-y-4 text-left lg:text-right order-1 lg:order-2">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed lg:ml-auto">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] hover:opacity-90"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-[#6C63FF] hover:bg-[#5A52D5]"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JournalPreview() {
  return (
    <div className="relative">
      {/* Floating animation for the journal */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        {/* Journal mockup */}
        <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-[#6C63FF]" />
                <h3 className="font-semibold text-white">My Journal</h3>
              </div>
              <div className="text-sm text-gray-400">Today</div>
            </div>

            <div className="space-y-4">
              {/* Journal entry preview */}
              <div className="bg-gray-800 p-4 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🙏</span>
                  <span className="text-sm font-medium text-gray-300">
                    Peaceful
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Today I felt a sense of peace during my morning prayer. I've
                  been worried about...
                </p>
              </div>

              {/* Bible verse preview */}
              <div className="bg-gray-800 p-4 rounded-md border-l-4 border-[#9C64FF]">
                <p className="text-gray-300 italic text-sm">
                  "Do not be anxious about anything, but in every situation, by
                  prayer and petition, with thanksgiving, present your requests
                  to God."
                </p>
                <p className="text-[#9C64FF] text-xs mt-2">Philippians 4:6-7</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-[#6C63FF]/30 to-[#9C64FF]/30 rounded-full blur-xl z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-[#9C64FF]/20 to-[#6C63FF]/20 rounded-full blur-xl z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </div>
  );
}
