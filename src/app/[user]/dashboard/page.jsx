"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import DashboardTable from "@/components/dashboard-table";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import { DollarSign } from "lucide-react";

export default function Page() {
  const userId = Cookies.get("UserId");
  const userName = Cookies.get("userName");
  const [stats, setStats] = useState({
    totalBids: 0,
    pendingBids: 0,
    highestBid: 0,
    averageBid: 0,
    totalDonations: 0,
    timePeriod: {
      start: new Date(),
      end: new Date(),
    },
  });
  const [filter, setFilter] = useState("weekly"); // default filter

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.post(
          "/api/routes/SurvayForm?action=getDashboardStatsOfUser",
          {
            userId,
            filter,
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    if (userId) {
      fetchDashboardStats();
    }
  }, [userId, filter]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      {/* Filter and Top Section */}
      <div className="flex flex-col gap-6">
        {/* Filter Selector */}
        <div className="flex justify-end">
          <div className="relative w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#2C514C] focus:outline-none focus:ring-2 focus:ring-[#2C514C]/50 focus:border-[#2C514C] appearance-none transition-all duration-200 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last Week</option>
              <option value="monthly">Last Month</option>
              <option value="yearly">Last Year</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 6 Stats Boxes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Congratulations Card */}
          {/* <div className="bg-white rounded-xl shadow-md border-b-2 border-[#2C514C] p-6 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-medium">{`Congratulations ${
                  userName || "User"
                } 🎉`}</h2>
                <p className="text-sm text-gray-500">
                  {filter === "today"
                    ? "Today"
                    : filter === "daily"
                    ? "Last 24 Hours"
                    : filter === "weekly"
                    ? "Last Week"
                    : filter === "monthly"
                    ? "Last Month"
                    : "Last Year"}{" "}
                  summary
                </p>
              </div>
              <div className="text-2xl font-semibold">
                ${stats.averageBid * stats.totalBids}
              </div>
              <Button className="w-fit text-sm font-semibold bg-[#2C514C] hover:bg-[#2C514C]/90">
                <Link href={`/${userId}/bidding-requests`}>View Bids</Link>
              </Button>
            </div>
          </div> */}

          {/* Total Bids Card */}
          <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border-b-2 border-[#2C514C] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#2C514C]/20 rounded-lg">
                <Image
                  src="/icons8_get_cash 1.svg"
                  alt="Bids"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className="text-2xl font-medium">{stats.totalBids}</h3>
            </div>
            <div>
              <p className="font-medium">Total Bids Received</p>
              <p className="text-sm text-gray-500">
                {new Date(stats.timePeriod.start).toLocaleDateString()} -{" "}
                {new Date(stats.timePeriod.end).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Highest Bid Card */}
          <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border-b-2 border-[#EA5455] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#EA5455]/20 rounded-lg">
                <Image
                  src="/icons8_stocks_growth 1.svg"
                  alt="Highest"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className="text-2xl font-medium">${stats.highestBid}</h3>
            </div>
            <div>
              <p className="font-medium">Highest Bid</p>
              <p className="text-sm text-gray-500">
                In{" "}
                {filter === "today"
                  ? "today"
                  : filter === "daily"
                  ? "24 hours"
                  : filter === "weekly"
                  ? "week"
                  : filter === "monthly"
                  ? "month"
                  : "year"}
              </p>
            </div>
          </div>

          {/* Average Bid Card */}
          <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border-b-2 border-[#00CFE8] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#00CFE8]/20 rounded-lg">
                <Image
                  src="/icons8_Average_Price_1 1.svg"
                  alt="Average"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className="text-2xl font-medium">${stats.averageBid}</h3>
            </div>
            <div>
              <p className="font-medium">Average Bid</p>
              <p className="text-sm text-gray-500">
                {stats.totalBids} bids considered
              </p>
            </div>
          </div>

          {/* Pending Bids Card */}
          <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border-b-2 border-[#FF9F43] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#FF9F43]/20 rounded-lg">
                <Image
                  src="/icons8_hourglass_2 1.svg"
                  alt="Pending"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className="text-2xl font-medium">{stats.pendingBids}</h3>
            </div>
            <div>
              <p className="font-medium text-[#FF9F43]">Pending Bids</p>
              <p className="text-sm text-gray-500">
                {stats.pendingBids === 0
                  ? "No pending bids"
                  : "Needs your attention"}
              </p>
            </div>
          </div>

          {/* Total Donations Card */}
          <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border-b-2 border-[#7367F0] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#7367F0]/20 rounded-lg">
                {/* <Image
                  src="/icons8_donation_1.svg"
                  alt="Donations"
                  width={30}
                  height={30}
                /> */}
                <DollarSign className="w-6 h-6 text-[#7367F0]" />
              </div>
              <h3 className="text-2xl font-medium">{stats.totalDonations}</h3>
            </div>
            <div>
              <p className="font-medium text-[#7367F0]">Total Donations</p>
              <p className="text-sm text-gray-500">
                {stats.totalDonations === 0
                  ? "No donations yet"
                  : "Thank you for your support"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        {/* <div className="flex justify-end items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Bidding Activity</h2>
          <Button
            variant="ghost"
            className="text-[#2C514C] hover:bg-[#2C514C]/10"
          >
            <Link href={`/${userId}/bidding-requests`}>View All</Link>
          </Button>
        </div> */}
        <DashboardTable userId={userId} />
      </div>
    </div>
  );
}
