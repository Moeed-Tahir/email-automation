"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import DashboardTable from "@/components/dashboard-table";
import Cookies from "js-cookie";

export default function Page() {
  const userId = Cookies.get("UserId");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <div className="flex flex-col md:flex-row w-full md:items-center justify-start gap-4 md:gap-14 border-b pb-3 md:pl-13">
        <div className="border-b-2 border-[#2C514C] ">
          <span className="text-lg font-medium text-[#2C514C]">
            All Requests
          </span>
        </div>
        <div className="">
          <p className="flex items-center gap-3 text-lg font-medium text-gray-400">
            Pending Requests
            <span className="rounded-full border bg-[#2C514C] shrink-0 text-white size-6 flex items-center justify-center">
              2
            </span>
          </p>
        </div>
        <div className="">
          <p className="text-lg font-medium text-gray-400">Approved Requests</p>
        </div>
        <div className="">
          <p className="text-lg font-medium text-gray-400">Rejected</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <div className="flex items-center justify-end w-full ">
          <Button className="text-sm font-semibold text-white border-none bg-[#2C514C] hover:bg-[#2C514C] shadow-none cursor-pointer">
            <DownloadIcon /> Download Pdf
          </Button>
        </div>

        <div className="md:h-[calc(100vh-250px)] lg:h-[calc(100vh-250px)] overflow-auto lg:overflow-hidden mb-5">
          <DashboardTable />
        </div>
      </div>
    </div>
  );
}
