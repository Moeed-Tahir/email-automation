"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Cookies from "js-cookie";
import axios from "axios";
import { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import ConfirmationPage from "@/components/email";
import { useRouter } from "next/navigation";

export default function Page() {
  const [profileData, setProfileData] = useState({
    linkedInProfileName: "",
    linkedInProfileEmail: "",
    companyName: "",
    jobTitle: "",
    industry: "",
    charityCompany: "",
    minimumBidDonation: "",
    calendarLink: "",
  });
  const [formData, setFormData] = useState({ ...profileData });
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = Cookies.get("UserId");
      if (!userId) {
        console.error("No userId found in cookies");
        return;
      }

      const response = await axios.post(
        `/api/routes/ProfileInfo?action=editProfileInfo&userId=${userId}`,
        {
          updates: formData,
        }
      );

      if (response.data.success) {
        setProfileData(formData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const deleteProfile = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const userId = Cookies.get("UserId");
      if (!userId) {
        console.error("No userId found in cookies");
        return;
      }

      const response = await axios.post(
        `/api/routes/ProfileInfo?action=deleteProfileInfo`,
        {
          userId: userId,
        }
      );

      if (response.data.message === "User Delete Successfully") {
        alert("User Delete Successfully");
        Cookies.remove("userEmail");
        Cookies.remove("userName");
        Cookies.remove("UserId");
        Cookies.remove("Token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col w-full mx-auto py-3 px-5 space-y-10">
        <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.linkedInProfileName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedInProfileName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.linkedInProfileEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedInProfileEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      jobTitle: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                  placeholder="Enter your industry"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Donation Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="charityCompany">Charity Company</Label>
                <Input
                  id="charityCompany"
                  value={formData.charityCompany}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      charityCompany: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumBid">Minimum Bid</Label>
                <Input
                  id="minimumBidDonation"
                  value={formData.minimumBidDonation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minimumBidDonation: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Schedule</h2>

            <div className="space-y-2">
              <Label htmlFor="calendarLink">
                Your pre-existing calendar links
              </Label>
              <div className="flex items-center px-2 gap-2 border rounded-lg w-full bg-white">
                <Link className="text-[rgba(44,81,76,1)] size-5 shrink-0" />
                <Input
                  id="calendarLink"
                  value={formData.calendarLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      calendarLink: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              type="submit"
              onClick={handleSubmit}
              className="cursor-pointer bg-[rgb(44,81,76)] hover:bg-transparent hover:font-medium hover:text-[#2C514C] border-2 border-[#2C514C] hover:border-[#2C514C] "
            >
              Save Changes
            </Button>
            <Button variant="outline" type="button" className="cursor-pointer">
              Cancel
            </Button>
          </div>

          <div className="space-y-6 pt-10 border-t">
            <h2 className="text-2xl font-semibold ">Delete Account</h2>

            <div className="rounded-md bg-[#FF9F4329] p-4 text-[#FF9F43] text-lg">
              <p className="font-medium mb-1">
                Are you sure you want to delete your account?
              </p>
              <p className="font-medium text-medium">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="confirmDelete" />
              <Label htmlFor="confirmDelete">
                I confirm my account deactivation
              </Label>
            </div>

            <Button
              onClick={deleteProfile}
              variant="destructive"
              className="cursor-pointer hover:bg-destructive/70"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
