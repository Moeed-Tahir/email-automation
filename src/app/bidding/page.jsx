"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownWideNarrow,
  ChevronsUpDown,
  DownloadIcon,
  FunnelIcon,
} from "lucide-react";
import { data } from "../../lib/constant";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const itemsPerPage = 8;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-[#FFCC0029] text-[#FFCC00] p-2 px-3 font-medium">
            Pending
          </Badge>
        );
      case "Accept":
        return (
          <Badge className="bg-[#28C76F29] text-[#28C76F] p-2 px-3 font-medium">
            Accept
          </Badge>
        );
      case "Reject":
        return (
          <Badge className="bg-[#EA545529] text-[#EA5455] p-2 px-3 font-medium">
            Reject
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleHeaderSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleAdvancedSort = (key, direction) => {
    setSortConfig({ key, direction });
    setShowSortMenu(false);
  };

  const filteredData =
    statusFilters.length > 0
      ? data.filter((item) => statusFilters.includes(item.status))
      : data;

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Bidding Requests</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 w-full">
          <div className="flex flex-col md:flex-row w-full md:items-center justify-start gap-4 md:gap-14 border-b pb-3 md:pl-13">
            <div className="border-b-2 border-[#2C514C] ">
              <span className="text-lg font-medium text-[#2C514C]">
                All Requests
              </span>
            </div>

            <div className="">
              <p className="flex items-center gap-3 text-lg font-medium text-gray-400">
                Pending Requests
                <span className="rounded-full border bg-[#2C514C] shrink-0 text-white w-6 h-6 flex items-center justify-center">
                  2
                </span>
              </p>
            </div>
            <div className="">
              <p className="text-lg font-medium text-gray-400">
                Approved Requests
              </p>
            </div>
            <div className="">
              <p className="text-lg font-medium text-gray-400">Rejected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-end w-full ">
              <Button className="text-sm font-semibold text-white border-none bg-[#2C514C] hover:bg-[#2C514C] shadow-none cursor-pointer">
                <DownloadIcon /> Download
              </Button>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="w-40 md:w-full">
                <h2 className="text-xl font-semibold mb-1">
                  Recent Bid Requests
                </h2>
                <p className="text-sm text-muted-foreground mb-4 text-left">
                  Review and manage meeting requests from sales representatives.
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 relative">
                <div className="relative">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent cursor-pointer"
                  >
                    <FunnelIcon className="fill-[#2C514C]" /> Filters
                  </Button>
                  {showFilters && (
                    <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-10">
                      {["Pending", "Accept", "Reject"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={statusFilters.includes(status)}
                            onChange={() => toggleStatusFilter(status)}
                            className="h-4 w-4"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent cursor-pointer"
                  >
                    <ArrowDownWideNarrow />
                    Sort By
                  </Button>
                  {showSortMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-10 w-48">
                      <div className="grid gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("score", "asc")}
                          className="justify-start"
                        >
                          Score Ascending
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("score", "desc")}
                          className="justify-start"
                        >
                          Score Descending
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("bid", "asc")}
                          className="justify-start"
                        >
                          Bid Ascending
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("bid", "desc")}
                          className="justify-start"
                        >
                          Bid Descending
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("date", "asc")}
                          className="justify-start"
                        >
                          Date Ascending
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAdvancedSort("date", "desc")}
                          className="justify-start"
                        >
                          Date Descending
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:h-[calc(100vh-790px)] lg:h-[calc(100vh-470px)] overflow-auto lg:overflow-hidden mb-5">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-white">
                    <TableHead
                      className="flex items-center justify-between pr-6 cursor-pointer"
                      onClick={() => handleHeaderSort("name")}
                    >
                      Representative
                      <ChevronsUpDown className="size-4 text-gray-500" />
                    </TableHead>
                    <TableHead
                      className="table-cell cursor-pointer"
                      onClick={() => handleHeaderSort("company")}
                    >
                      <div className="flex items-center w-full justify-between pr-6">
                        Company{" "}
                        <ChevronsUpDown className="size-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="table-cell cursor-pointer"
                      onClick={() => handleHeaderSort("company")}
                    >
                      <div className="flex items-center w-full justify-between pr-6">
                        Company{" "}
                        <ChevronsUpDown className="size-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleHeaderSort("date")}
                    >
                      <div className="flex items-center w-full justify-between pr-6">
                        Proposed Date{" "}
                        <ChevronsUpDown className="size-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="table-cell cursor-pointer"
                      onClick={() => handleHeaderSort("score")}
                    >
                      <div className="flex items-center w-full justify-between pr-20">
                        Score{" "}
                        <ChevronsUpDown className="size-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead>Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow className="w-full pb-2" key={item.id}>
                      <TableCell className="w-60">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.email}
                        </div>
                      </TableCell>
                      <TableCell className="flex flex-col w-60">
                        <div className="font-medium text-black">
                          {item.company}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Company category
                        </div>
                      </TableCell>
                      <TableCell className="table-cell w-60">
                        <div className="font-medium">{item.company}</div>
                        <div className="text-sm text-muted-foreground">
                          Company category
                        </div>
                      </TableCell>
                      <TableCell className="w-44">{item.date}</TableCell>
                      <TableCell className=" w-44">{item.score}</TableCell>
                      <TableCell className=" w-44">
                        <Badge
                          variant="outline"
                          className="bg-gray-200 p-2 px-3 rounded-sm"
                        >
                          {item.bid}
                        </Badge>
                      </TableCell>
                      <TableCell className=" w-44">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="flex gap-2 w-full items-center">
                        <Button
                          size="sm"
                          className="bg-[#FF950029] text-[#FF9500] hover:bg-[#FF950029] hover:text-[#FF9500]"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          className="bg-[#28C76F29] text-[#28C76F]"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#EA545529] text-[#EA5455] hover:bg-[#EA545529] hover:text-[#EA5455]"
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
