'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/journal');
    }
  }, [user, isLoading, router]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1A0A1F] text-white">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Grid */}
        <section className="py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Features Designed for Your Faith Journey
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover tools that help you reflect, grow, and connect with
              scripture in meaningful ways.
            </p>
          </div>
          <FeaturesGrid />
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join thousands who have transformed their spiritual practice with
              Faith Journal.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Sarah"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah M.</h4>
                  <p className="text-sm text-gray-400">Daily User</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "This app has completely transformed my daily devotional time.
                The verse recommendations are always exactly what I need."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=James"
                    alt="James"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">James T.</h4>
                  <p className="text-sm text-gray-400">Pastor</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "I recommend Faith Journal to everyone in my congregation. It's
                helped so many of us develop a consistent journaling practice."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rebecca"
                    alt="Rebecca"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Rebecca L.</h4>
                  <p className="text-sm text-gray-400">Bible Study Leader</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The emotion tracking feature has been eye-opening. Seeing how
                scripture speaks to different emotional states has deepened my
                faith."
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Begin Your Faith Journey Today
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of believers who are deepening their faith through
              reflection and scripture.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <button className="bg-white text-[#6C63FF] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-[#6C63FF] border border-[#6C63FF] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#5A52D5] transition-colors">
                  Sign In
                </button>
              </Link>
            </div>
            <div className="mt-4">
              <Link href="/support-us" className="text-white hover:text-gray-200 underline text-sm">
                Support Our Mission
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
