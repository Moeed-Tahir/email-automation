"use client";

import * as React from "react";
import {
  LayoutDashboardIcon,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import logo from "../../public/Logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const userId = Cookies.get("UserId");
const data = {
  dashboard: [
    {
      title: "Dashboard",
      url: `/${userId}/dashboard`,
      icon: LayoutDashboardIcon,
    },
    // {
    //   title: "Bidding Requests",
    //   url: `/${userId}/bidding-requests`,
    //   icon: HandCoins,
    // },
    // {
    //   title: "Donations",
    //   url: `/${userId}/donation`,
    //   icon: HeartHandshake,
    // },
  ],
  settings: [
    {
      title: "Settings",
      url: `/${userId}/profile`,
      icon: Settings,
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ isAdmin = false, ...props }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear all user cookies
    Cookies.remove("userEmail");
    Cookies.remove("userName");
    Cookies.remove("UserId");
    Cookies.remove("Token");
    router.push("/login");
  };

  const handleAdminLogout = () => {
    // Clear admin-specific cookies
    Cookies.remove("adminToken");
    Cookies.remove("adminId");
    Cookies.remove("adminAccessible");
    router.push("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" {...props} className="z-30">
      <SidebarHeader className="bg-[#2C514C] py-6 px-4">
        <Image src={logo} alt="Logo" width={130} height={130} />
      </SidebarHeader>
      <SidebarContent className="bg-[#2C514C]">
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel className="capitalize text-white">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/admin/dashboard"
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors ${
                        pathname === "/admin/dashboard"
                          ? "bg-white text-[#2C514C]"
                          : "text-white hover:bg-white hover:text-[#2C514C]"
                      }`}
                    >
                      <LayoutDashboardIcon className="size-4 shrink-0" />
                      <span className="font-medium text-[16px]">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleAdminLogout}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors text-white hover:bg-white hover:text-[#2C514C]"
                  >
                    <LogOut className="size-4 shrink-0" />
                    <span className="font-medium text-[16px]">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          Object.keys(data).map((item, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className="capitalize text-white gap-[10px] w-full px-[16px] py-[12px] rounded-[6px]">
                {item}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data[item].map((t, i) => {
                    const isActive = pathname === t.url;
                    if (t.title === "Logout") {
                      return (
                        <SidebarMenuItem key={i}>
                          <SidebarMenuButton
                            onClick={handleLogout}
                            className={`flex items-center gap-[10px] w-full px-[16px] py-[20px] rounded-[6px] transition-colors cursor-pointer ${
                              isActive
                                ? "bg-white text-[#2C514C]"
                                : "text-white hover:bg-white hover:text-[#2C514C]"
                            }`}
                          >
                            <t.icon className="size-4 shrink-0" />
                            <span className="font-medium text-[16px]">
                              {t.title}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    return (
                      <SidebarMenuItem key={i} className={"w-full py-[2px]"}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={t.url}
                            className={`flex items-center gap-[10px] w-full px-[16px] py-[20px] rounded-[6px] transition-colors ${
                              isActive
                                ? "bg-white text-[#2C514C]"
                                : "text-white hover:bg-white hover:text-[#2C514C]"
                            }`}
                          >
                            <t.icon className="size-4 shrink-0" />
                            <span className="font-medium text-[16px] leading-[24px]">
                              {t.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
    </Sidebar>
  );
}
