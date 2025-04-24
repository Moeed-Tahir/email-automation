"use client";

import * as React from "react";
import {
  AudioWaveform,
  CircleHelp,
  Command,
  GalleryVerticalEnd,
  HandCoins,
  HeartHandshake,
  LayoutDashboardIcon,
  ScrollText,
  Settings,
} from "lucide-react";

import Image from "next/image";

import logo from "../../public/Logo.svg";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "DashBoard",
      url: "#",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Bidding Requests",
      url: "#",
      icon: HandCoins,
    },
    {
      title: "Donations",
      url: "#",
      icon: HeartHandshake,
    },
    {
      title: "History",
      url: "#",
      icon: ScrollText,
    },
  ],
  projects: [
    {
      name: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      name: "FAQs",
      url: "#",
      icon: CircleHelp,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#2C514C] pt-6 pl-4">
        <Image src={logo} alt="Logo" width={130} height={130} />
      </SidebarHeader>
      <SidebarContent className="bg-[#2C514C]">
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="bg-[#2C514C]">
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
