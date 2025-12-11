import GridShape from "@/shared/components/common/GridShape";
import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail } from 'lucide-react';
import logoHeader from '@/assets/icons/log_ct_001.png';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Header cho trang login */}
      <header className="h-auto border-b bg-[#1a8649] backdrop-blur flex items-center justify-center px-6 relative z-20">
        <div className="flex items-center gap-3 text-primary-foreground py-4">
          <span className="flex flex-col gap-1 text-white">
            <div className="text-base sm:text-5xl font-bold text-center">
              PHẦN MỀM QUẢN LÝ NHÂN SỰ
            </div>
            <div className="text-base sm:text-xl font-bold text-center">
              CÔNG TY THAN UÔNG BÍ - TKV
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-center gap-2 sm:gap-4 text-white text-sm sm:text-xl sm:text-center font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white" />
                <span>Hotline: 02033.854491</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white" />
                <span>Email: ctythanub@gmail.com</span>
              </div>
            </div>
          </span>
        </div>
      </header>

      {/* Background Image với overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://uongbi.gov.vn/ckfinder/userfiles/images/2024/4/19/294A0768.JPG"
          alt="HR Background"
          className="object-cover w-full h-full"
        />
        
        <div className="absolute inset-0 opacity-10">
          <GridShape />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center flex-1 w-full px-6 py-8">
        {/* Card chứa form */}
        <div className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Logo/Title Section */}


          {/* Form Content */}
          {children}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 CÔNG TY THAN UÔNG BÍ - TKV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}