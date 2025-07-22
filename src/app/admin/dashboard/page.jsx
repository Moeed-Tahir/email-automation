"use client";
import AdminTable from "@/components/admin-table";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import axios from "axios";
import { BellIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function page() {
  const [tableData, setTableData] = useState([]);
  console.log("tableData",tableData);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get("/api/routes/Admin?action=fetchReciptData");
      setTableData(response.data.receipts);
    } catch (error) {
      console.log("Error is occured", error);
    }
  }

  
  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={true} />
      <SidebarInset>
        <nav className=" sticky top-0 z-10 bg-white flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-nowrap">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-end w-full gap-2 mx-auto px-10 p-5">
            <span className="hidden lg:block bg-[#2C514C]/10  rounded-full">
              <Image
                src="/user.svg"
                alt="Logo"
                width={42}
                height={42}
                className="shrink-0 "
              />
            </span>
            <div className="flex flex-col items-start justify-start">
              <span className="text-lg font-semibold text-[#2C514C]">
                Admin
              </span>
              <span className="text-sm font-[400] text-gray-600">
                Admin@emailautomation.com
              </span>
            </div>
          </div>
        </nav>

        <div className="p-4">
          <AdminTable tableData={tableData} fetchAdminData={fetchAdminData} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
