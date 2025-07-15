"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import DashboardTable from "@/components/dashboard-table";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import axios from "axios";

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
      end: new Date()
    }
  });
  const [filter, setFilter] = useState('weekly'); // default filter

  const formatChange = (value) => {
    const num = parseFloat(value);
    const prefix = num > 0 ? "+" : "";
    return `${prefix}${num.toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.post("/api/routes/SurvayForm?action=getDashboardStatsOfUser", { 
          userId,
          filter 
        });
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
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      {/* Enhanced Filter Selector */}
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
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Congratulations Card - Image Removed */}
        <div className="bg-white col-span-2 rounded-md shadow-md border-b-2 px-6 py-4">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
              <span className="text-lg font-medium w-full">
                {`Congratulations ${userName || "User"} 🎉`}
              </span>
              <span className="text-[15px] font-[400] text-gray-400">
                {filter === 'today' ? 'Today' : 
                 filter === 'daily' ? 'Last 24 Hours' :
                 filter === 'weekly' ? 'Last Week' :
                 filter === 'monthly' ? 'Last Month' : 'Last Year'} summary
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[20px] font-medium">${stats.averageBid * stats.totalBids}</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button className="text-sm font-semibold bg-[#2C514C] border-2 hover:text-[#2C514C] border-[#2C514C] hover:bg-transparent cursor-pointer">
                <Link href={`/${userId}/bidding-requests`}>View Bids</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Total Bids Card */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-start justify-center gap-5 border-b-2 hover:border-b-3 border-[#2C514C] shadow-[0_8px_30px_rgb(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#2C514C]/20 rounded-lg">
              <Image
                src="/icons8_get_cash 1.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </span>
            <h2 className="text-[22px] font-medium text-[#4B465C]">{stats.totalBids}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Total Bids Received</p>
            <p className="text-[15px] font-semibold text-gray-400">
              {new Date(stats.timePeriod.start).toLocaleDateString()} - {new Date(stats.timePeriod.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Highest Bid Card */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-start justify-center gap-5 border-b-2 hover:border-b-3 border-[#EA5455]/50 shadow-[0_8px_30px_rgb(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#EA545529]/80 rounded-lg">
              <Image
                src="/icons8_stocks_growth 1.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </span>
            <h2 className="text-[22px] font-medium text-[#4B465C]">${stats.highestBid}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Highest Bid</p>
            <p className="text-[15px] font-semibold text-gray-400">
              In {filter === 'today' ? 'today' : 
                 filter === 'daily' ? '24 hours' :
                 filter === 'weekly' ? 'week' :
                 filter === 'monthly' ? 'month' : 'year'}
            </p>
          </div>
        </div>

        {/* Average Bid Card */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-start justify-center gap-5 border-b-2 hover:border-b-3 border-[#00CFE8] shadow-[0_8px_30px_rgb(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#00CFE829] rounded-lg">
              <Image
                src="/icons8_Average_Price_1 1.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </span>
            <h2 className="text-[22px] font-medium text-[#4B465C]">${stats.averageBid}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Average Bid</p>
            <p className="text-[15px] font-semibold text-gray-400">
              {stats.totalBids} bids considered
            </p>
          </div>
        </div>

        {/* Pending Bids Card */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-start justify-center gap-5 border-b-2 hover:border-b-3 border-[#FF9F43] shadow-[0_8px_30px_rgb(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#FF9F4329] rounded-lg">
              <Image
                src="/icons8_hourglass_2 1.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </span>
            <h2 className="text-[22px] font-medium text-[#4B465C]">{stats.pendingBids}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold text-[#FF9F43]">
              Pending Bids
            </p>
            <p className="text-[15px] font-semibold text-gray-400">
              {stats.pendingBids === 0 ? 'No pending bids' : 'Needs your attention'}
            </p>
          </div>
        </div>

        {/* New Total Donations Card */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-start justify-center gap-5 border-b-2 hover:border-b-3 border-[#7367F0] shadow-[0_8px_30px_rgb(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#7367F029] rounded-lg">
              <Image
                src="/icons8_donation_1.svg"  // You'll need to add this icon
                alt="Donation"
                width={30}
                height={30}
              />
            </span>
            <h2 className="text-[22px] font-medium text-[#4B465C]">{stats.totalDonations}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold text-[#7367F0]">
              Total Donations
            </p>
            <p className="text-[15px] font-semibold text-gray-400">
              {stats.totalDonations === 0 ? 'No donations yet' : 'Thank you for your support'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full bg-white rounded-xl p-4 border">
        <div className="flex items-center justify-end w-full">
          <Button className="text-sm font-semibold text-[#2C514C] border-none bg-transparent hover:bg-transparent shadow-none cursor-pointer">
            <Link href={`/${userId}/bidding-requests`}>View All</Link>
          </Button>
        </div>
        <DashboardTable userId={userId} />
      </div>
    </div>
  );
}