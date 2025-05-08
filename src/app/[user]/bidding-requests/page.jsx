"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import DashboardTable from "@/components/dashboard-table";
import Cookies from "js-cookie";

export default function Page() {
  const userId = Cookies.get("UserId");
  const downloadPdf = () => {
    
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <div className="bg-white rounded-xl p-4 border">
        <div className="flex items-center justify-end w-full ">
          <Button className="text-sm font-semibold text-white border-none bg-[#2C514C] hover:bg-[#2C514C] shadow-none cursor-pointer">
            <DownloadIcon /> Download Pdf
          </Button>
        </div>

        <div className="md:h-[calc(100vh-250px)] lg:h-[calc(100vh-250px)] overflow-auto lg:overflow-hidden mb-5">
          <DashboardTable userId={userId} />
        </div>
      </div>
    </div>
  );
}
