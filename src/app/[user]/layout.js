"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { BellIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";


export default function Layout({ children }) {
    const userEmail = Cookies.get("userEmail");
    const userName = Cookies.get("userName");
    const userPhoto = Cookies.get("userPhoto") || "/user.svg";
    const userId = Cookies.get("UserId");

    const [profileData, setProfileData] = useState({
        userName: "",
        userProfileEmail: "",
        userProfilePhoto: "",
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const userId = Cookies.get("UserId");

                if (!userId) {
                    console.error("No userId found in cookies");
                    return;
                }

                const response = await axios.get(`/api/routes/ProfileInfo`, {
                    params: { userId, action: "getProfileInfo" },
                });

                setProfileData(response.data.user);
                setFormData(response.data.user);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchProfileData();
    }, []);


    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <nav className=" sticky top-0 z-10 bg-white flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 cursor-pointer" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold">Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-end w-full gap-2 mx-auto pl-10 p-5">
                       
                        <Link className="flex items-center gap-2 py-1 px-3 border-1 rounded-md" href={`/${userId}/profile`}>
                            <span className="hidden lg:block bg-[#2C514C]/10  rounded-full">
                                <Image
                                    src={`${userPhoto}`}
                                    alt="Logo"
                                    width={42}
                                    height={42}
                                    className="shrink-0 rounded-full"
                                />
                            </span>
                            <div className="flex-col items-start justify-start md:flex hidden">
                                <span className="text-lg font-semibold text-[#2C514C]">
                                    {userName || "User"}
                                </span>
                                <span className="text-sm font-[400] text-gray-600">
                                    {userEmail || "user@emailautomation.com"}
                                </span>
                            </div>
                        </Link>
                    </div>
                </nav>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
