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
  const [bidInfo, setBidInfo] = useState({
    totalBidAmount: "0",
    highestBidAmount: "0",
    averageBidAmount: "0",
    pendingBidsCount: 0,
    totalBidsCount: 0,
    validBidsCount: 0
  });

  useEffect(() => {
    const fetchBidInfo = async () => {
      try {
        const response = await axios.post("/api/routes/SurvayForm?action=getBidInfo",{userId});
        setBidInfo(response.data);
      } catch(error) {
        console.error("Error occurred", error);
      }
    };

    fetchBidInfo();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white col-span-2 flex items-center justify-between rounded-md shadow-md border-b-2 px-2">
          <div className="flex flex-col gap-2 w-full p-2">
            <div className="flex flex-col">
              <span className="text-lg font-medium w-full">
                {`Congratulations ${userName || "User"} 🎉`}
              </span>
              <span className="text-[15px] font-[400] text-gray-400">
                This month you earned
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-medium">${bidInfo.totalBidAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button className="text-sm font-semibold bg-[#2C514C] border-2 hover:text-[#2C514C] border-[#2C514C] hover:bg-transparent cursor-pointer">
                <Link href={`/${userId}/bidding-requests`}>View Bids </Link>
              </Button>
            </div>
          </div>
          <div className="">
            <Image
              src="/dashboard-boy.svg"
              alt="Logo"
              width={150}
              height={100}
            />
          </div>
        </div>

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
            <h2 className="text-[22px] font-medium text-[#4B465C]">{bidInfo.totalBidsCount}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Total Bids Received</p>
            <p className="text-[15px] font-semibold">
              +18.2%
              <span className="text-gray-400 text[13px] font-[400] pl-2">
                than last week
              </span>
            </p>
          </div>
        </div>
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
            <h2 className="text-[22px] font-medium text-[#4B465C]">${bidInfo.highestBidAmount}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Highest Bid</p>
            <p className="text-[15px] font-semibold">
              -8.7%
              <span className="text-gray-400 text[13px] font-[400] pl-2">
                than last week
              </span>
            </p>
          </div>
        </div>
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
            <h2 className="text-[22px] font-medium text-[#4B465C]">${bidInfo.averageBidAmount}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold">Average Bid</p>
            <p className="text-[15px] font-semibold">
              +4.3%
              <span className="text-gray-400 text[13px] font-[400] pl-2">
                than last week
              </span>
            </p>
          </div>
        </div>
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
            <h2 className="text-[22px] font-medium text-[#4B465C]">{bidInfo.pendingBidsCount}</h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] font-semibold text-[#FF9F43]">
              Pending Bids
            </p>
            <p className="text-[15px] font-semibold text-[#FF9F43]">
              -2.5%
              <span className="text-gray-400 text[13px] font-[400] pl-2">
                than last week
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full bg-white rounded-xl p-4 border">
        <div className="flex items-center justify-end w-full ">
          <Button className="text-sm font-semibold text-[#2C514C] border-none bg-transparent hover:bg-transparent shadow-none cursor-pointer">
            <Link href={`/${userId}/bidding-requests`}> View All </Link>
          </Button>
        </div>
        <DashboardTable userId={userId} />
      </div>
    </div>
  );
}