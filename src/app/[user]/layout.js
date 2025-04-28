import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { BellIcon } from "lucide-react";
import Image from "next/image";



export default function layout({ children }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <nav className=" sticky top-0 z-10 bg-white flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4 w-full ">
                        <SidebarTrigger className="-ml-1 cursor-pointer" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <div className="flex items-center  w-full">
                            <h1 className="hidden text-2xl font-semibold w-full md:flex ">
                                View Bid Details
                            </h1>
                            <h1 className="md:hidden text-2xl font-semibold w-full flex ">
                                Bid Details
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-end w-full gap-2 mx-auto px-10 p-5">
                        <span className="p-2 bg-[#2C514C]/10 rounded-full">
                            <BellIcon className="fill-[#2C514C] size-6 text-[#2C514C]" />
                        </span>
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
                                John Doe
                            </span>
                            <span className="text-sm font-[400] text-gray-600">
                                Admin@gmail.com
                            </span>
                        </div>
                    </div>
                </nav>

                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
