import GridShape from "@/shared/components/common/GridShape";
import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-[#32385f] dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-md">
              <p className="text-center text-gray-200 text-title-md py-6">
                Phần mềm quản lý nhân sự
              </p>
              <p className="text-center text-gray-200 text-title-sm">
                AIS-HRM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
