"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BellIcon, Link } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Page() {
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
              <h1 className="text-2xl font-semibold">Profile</h1>
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

        <div className="flex flex-1 flex-col w-full mx-auto py-3 px-5 space-y-10">
          <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Charity Abc" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" placeholder="Jr. Abc" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="industry">Industry</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m@example.com">
                        m@example.com
                      </SelectItem>
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">
                        m@support.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Donation Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Donation Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="charityCompany">Charity Company</Label>
                  <Input id="charityCompany" placeholder="Abc Company" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumBid">Minimum Bid</Label>
                  <Input id="minimumBid" placeholder="25$" />
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Schedule</h2>

              <div className="space-y-2">
                <Label htmlFor="calendarLink">
                  Your pre-existing calendar links
                </Label>
                <div className="flex items-center px-2 gap-2 border rounded-lg w-full bg-white">
                  <Link className="text-[rgba(44,81,76,1)] size-5 shrink-0" />
                  <Input
                    type="link"
                    placeholder="Calendar Link"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg "
                  />
                </div>
              </div>
            </div>

            {/* Save Changes Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="submit"
                className="cursor-pointer bg-[#2C514C] hover:bg-transparent hover:font-medium hover:text-[#2C514C] border-2 border-[#2C514C] hover:border-[#2C514C] "
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>

            {/* Delete Account Section */}
            <div className="space-y-6 pt-10 border-t">
              <h2 className="text-2xl font-semibold ">Delete Account</h2>

              <div className="rounded-md bg-[#FF9F4329] p-4 text-[#FF9F43] text-lg">
                <p className="font-medium mb-1">
                  Are you sure you want to delete your account?
                </p>
                <p className="font-medium text-medium">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="confirmDelete" />
                <Label htmlFor="confirmDelete">
                  I confirm my account deactivation
                </Label>
              </div>

              <Button
                variant="destructive"
                className="cursor-pointer hover:bg-destructive/70"
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
