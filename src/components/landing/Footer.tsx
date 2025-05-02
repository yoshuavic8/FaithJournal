"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface FooterProps {
  verse?: {
    text: string;
    reference: string;
  };
}

const Footer = ({
  verse = {
    text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11",
  },
}: FooterProps) => {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full py-12 px-4 md:px-8 bg-black text-white border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <Card className="w-full max-w-3xl bg-gray-900 border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-lg md:text-xl italic text-gray-300 mb-4">
                "{verse.text}"
              </p>
              <p className="text-sm md:text-base text-gray-400 font-medium">
                {verse.reference}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div className="mb-4 md:mb-0">
            <p>© {currentYear} Faith Journal. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/support-us" className="hover:text-[#6C63FF] transition-colors">
              Support Us
            </Link>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
