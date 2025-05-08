"use client";

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
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = Cookies.get("UserId");
        if (!userId) return console.error("No userId found in cookies");

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
      if (!userId) return console.error("No userId found in cookies");

      const response = await axios.post(
        `/api/routes/ProfileInfo?action=editProfileInfo&userId=${userId}`,
        { updates: formData }
      );

      if (response.data.success) {
        setProfileData(formData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }finally{
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const deleteProfile = async () => {
    setIsDeleting(true);
    try {
      const userId = Cookies.get("UserId");
      if (!userId) return console.error("No userId found in cookies");

      const response = await axios.post(
        `/api/routes/ProfileInfo?action=deleteProfileInfo`,
        { userId }
      );

      if (response.data.message === "User Delete Successfully") {
        Cookies.remove("userEmail");
        Cookies.remove("userName");
        Cookies.remove("UserId");
        Cookies.remove("Token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col w-full mx-auto py-3 px-5 space-y-10">
        <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: "fullName", label: "Full Name", key: "linkedInProfileName", placeholder: "Enter your full name" },
                { id: "email", label: "Email", key: "linkedInProfileEmail", placeholder: "Enter your email", type: "email" },
                { id: "companyName", label: "Company Name", key: "companyName", placeholder: "Enter your company name" },
                { id: "jobTitle", label: "Job Title", key: "jobTitle", placeholder: "Enter your job title" },
                { id: "industry", label: "Industry", key: "industry", placeholder: "Enter your industry" }
              ].map(({ id, label, key, placeholder, type = "text" }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={formData[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Donation Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Donation Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: "charityCompany", label: "Charity Company", key: "charityCompany", placeholder: "Enter charity name" },
                { id: "minimumBidDonation", label: "Minimum Bid", key: "minimumBidDonation", placeholder: "Enter minimum bid" }
              ].map(({ id, label, key, placeholder }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    value={formData[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Schedule</h2>
            <div className="space-y-2">
              <Label htmlFor="calendarLink">Your pre-existing calendar link</Label>
              <div className="flex items-center px-2 gap-2 border rounded-lg w-full bg-white">
                <Link className="text-[rgba(44,81,76,1)] size-5 shrink-0" />
                <Input
                  id="calendarLink"
                  value={formData.calendarLink}
                  placeholder="Enter calendar link"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, calendarLink: e.target.value }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Edit/Save/Cancel Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="cursor-pointer bg-[#2C514C] hover:bg-[#24403C]"
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="cursor-pointer bg-[#2C514C] hover:bg-transparent hover:font-medium hover:text-[#2C514C] border-2 border-[#2C514C] hover:border-[#2C514C]"
                >
                  Save Changes
                </Button>
                <Button variant="outline" type="button" onClick={handleCancel} className="cursor-pointer">
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* Delete Account */}
          <div className="space-y-6 pt-10 border-t">
            <h2 className="text-2xl font-semibold">Delete Account</h2>
            <div className="rounded-md bg-[#FF9F4329] p-4 text-[#FF9F43] text-lg">
              <p className="font-medium mb-1">
                Are you sure you want to delete your account?
              </p>
              <p className="text-[15px]">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="hover:bg-destructive/70 cursor-pointer">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="gap-1">
                <h3 className="text-[24px] font-semibold">Confirm Deletion</h3>
                <p>Are you absolutely sure you want to delete your account?</p>
                <DialogFooter className="flex gap-4 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteProfile}
                    disabled={isDeleting}
                    className="cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
