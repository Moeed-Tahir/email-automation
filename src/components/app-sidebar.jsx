"use client";

import * as React from "react";
import {
  CircleHelp,
  HandCoins,
  HeartHandshake,
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
    {
      title: "Bidding Requests",
      url: `/${userId}/bidding-requests`,
      icon: HandCoins,
    },
    {
      title: "Donations",
      url: `/${userId}/donation`,
      icon: HeartHandshake,
    },
  ],
  settings: [
    {
      title: "Settings",
      url: `/${userId}/profile`,
      icon: Settings,
    },
    {
      title: "FAQs",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("userEmail");
    Cookies.remove("userName");
    Cookies.remove("UserId");
    Cookies.remove("Token");
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" {...props} className="z-20">
      <SidebarHeader className="bg-[#2C514C] py-6 px-4">
        <Image src={logo} alt="Logo" width={130} height={130} />
      </SidebarHeader>
      <SidebarContent className="bg-[#2C514C]">
        {props.isAdmin ? (
          <SidebarMenuItem className="px-3">
            <SidebarMenuButton asChild>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors bg-white text-[#2C514C]"
              >
                <LayoutDashboardIcon className="size-4 shrink-0" />
                <span className="font-medium text-[16px]">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          Object.keys(data).map((item, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className="capitalize text-white">
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
                            className={`flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors ${isActive
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
                      <SidebarMenuItem key={i}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={t.url}
                            className={`flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors ${isActive
                                ? "bg-white text-[#2C514C]"
                                : "text-white hover:bg-white hover:text-[#2C514C]"
                              }`}
                          >
                            <t.icon className="size-4 shrink-0" />
                            <span className="font-medium text-[16px]">
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