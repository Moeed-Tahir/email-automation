"use client";

import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import axios from "axios";
import { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CloseEndedQuestionsPage from "@/components/close-ended-question";

export default function Page() {
  const [profileData, setProfileData] = useState({
    userName: "",
    userProfileEmail: "",
    companyName: "",
    jobTitle: "",
    industry: "",
    charityCompany: "",
    minimumBidDonation: "",
    calendarLink: "",
    howHeard: "",
    questionSolution: "",
    linkedInProfile: "",
    location: "",
    aboutMe: "",
    department: "",
    focus: ""
  });
  const [formData, setFormData] = useState({ ...profileData });
  const [activeTab, setActiveTab] = useState("profile");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
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

  const handleProfileSubmit = async (e) => {
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
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleQuestionsSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = Cookies.get("UserId");
      if (!userId) return console.error("No userId found in cookies");

      const response = await axios.post(
        `/api/routes/ProfileInfo?action=editProfileInfo&userId=${userId}`,
        { 
          updates: {
            howHeard: formData.howHeard,
            questionSolution: formData.questionSolution
          }
        }
      );

      if (response.data.success) {
        setProfileData(formData);
        setIsEditingQuestions(false);
      }
    } catch (error) {
      console.error("Error updating questions:", error);
    } finally {
      setIsEditingQuestions(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditingProfile(false);
    setIsEditingQuestions(false);
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
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>
              Profile
            </TabsTrigger>
            <TabsTrigger value="open-ended" onClick={() => setActiveTab("open-ended")}>
              Open-Ended Questions
            </TabsTrigger>
            <TabsTrigger value="close-ended" onClick={() => setActiveTab("close-ended")}>
              Close-Ended Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Personal Information</h2>
                {!isEditingProfile ? (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="cursor-pointer bg-[#2C514C] hover:bg-[#24403C]"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      onClick={handleProfileSubmit}
                      className="cursor-pointer bg-[#2C514C] hover:bg-transparent hover:font-medium hover:text-[#2C514C] border-2 border-[#2C514C] hover:border-[#2C514C]"
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" type="button" onClick={handleCancel} className="cursor-pointer">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "userName", label: "Full Name", key: "userName", placeholder: "Enter your full name" },
                    { id: "email", label: "Email", key: "userProfileEmail", placeholder: "Enter your email", type: "email" },
                    { id: "location", label: "Location", key: "location", placeholder: "Enter your location" },
                    { id: "linkedInProfile", label: "LinkedIn Profile", key: "linkedInProfile", placeholder: "Enter your LinkedIn profile URL", type: "url" },
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
                        disabled={!isEditingProfile}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMe">About Me</Label>
                  <textarea
                    id="aboutMe"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.aboutMe}
                    placeholder="Tell us about yourself"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, aboutMe: e.target.value }))
                    }
                    disabled={!isEditingProfile}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Company Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "companyName", label: "Company Name", key: "companyName", placeholder: "Enter your company name" },
                    { id: "jobTitle", label: "Job Title", key: "jobTitle", placeholder: "Enter your job title" },
                    { id: "department", label: "Department", key: "department", placeholder: "Enter your department" },
                    { id: "industry", label: "Industry", key: "industry", placeholder: "Enter your industry" },
                    { id: "focus", label: "Focus", key: "focus", placeholder: "Enter your focus area" },
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
                        disabled={!isEditingProfile}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Donation Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      id: "minimumBidDonation",
                      label: "Minimum Bid",
                      key: "minimumBidDonation",
                      placeholder: "Enter minimum bid",
                    },
                  ].map(({ id, label, key, placeholder }) => (
                    <div key={id} className="space-y-2 w-full col-span-2">
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        className="w-full"
                        value={formData[key]}
                        placeholder={placeholder}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        disabled={!isEditingProfile}
                      />
                    </div>
                  ))}
                </div>
              </div>

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
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>
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
          </TabsContent>

          <TabsContent value="open-ended">
            <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Open-Ended Questions</h2>
                {!isEditingQuestions ? (
                  <Button
                    onClick={() => setIsEditingQuestions(true)}
                    className="cursor-pointer bg-[#2C514C] hover:bg-[#24403C]"
                  >
                    Edit Questions
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      onClick={handleQuestionsSubmit}
                      className="cursor-pointer bg-[#2C514C] hover:bg-transparent hover:font-medium hover:text-[#2C514C] border-2 border-[#2C514C] hover:border-[#2C514C]"
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" type="button" onClick={handleCancel} className="cursor-pointer">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    id="howHeard"
                    value={formData.howHeard}
                    placeholder="Enter Question"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, howHeard: e.target.value }))
                    }
                    disabled={!isEditingQuestions}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    id="questionSolution"
                    value={formData.questionSolution}
                    placeholder="Enter Question"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, questionSolution: e.target.value }))
                    }
                    disabled={!isEditingQuestions}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="close-ended">
            <CloseEndedQuestionsPage />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}