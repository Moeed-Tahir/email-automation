"use client";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { data } from "../lib/constant";
import { Badge } from "@/components/ui/badge";
import { ArrowDownWideNarrow, ChevronsUpDown, FunnelIcon, FileText, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";

const AdminTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [_, setShowSortMenu] = useState(false);
  const itemsPerPage = 8;
  const router = useRouter();
  const [existingSurveys, setExistingSurveys] = useState([]);

  useEffect(() => {
    setExistingSurveys(data);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-[#FFCC0029] text-[#FFCC00] p-2 px-3 font-medium">
            Pending
          </Badge>
        );
      case "Accepted":
        return (
          <Badge className="bg-[#28C76F29] text-[#28C76F] p-2 px-3 font-medium">
            Accepted
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-[#EA545529] text-[#EA5455] p-2 px-3 font-medium">
            Rejected
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

  const handleAccept = async (representativeEmail) => {
    try {
      const fromEmail = Cookies.get("userEmail");
      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      const response = await axios.post('/api/routes/Google?action=sendAcceptEmailToAdmin', {
        sendFromEmail: fromEmail,
        sendToEmail: representativeEmail,
      });

      if (response.data.message) {
        alert('Meeting request accepted successfully');
        // Update local state to reflect acceptance
        setExistingSurveys(prev => prev.map(item => 
          item.email === representativeEmail ? { ...item, status: "Accepted" } : item
        ));
      } else {
        throw new Error(response.data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleReject = async (representativeEmail) => {
    try {
      const fromEmail = Cookies.get("userEmail");
      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      const response = await axios.post('/api/routes/Google?action=sendRejectEmailToAdmin', {
        sendFromEmail: fromEmail,
        sendToEmail: representativeEmail,
      });

      if (response.data.message) {
        alert('Meeting request rejected successfully');
        // Update local state to reflect rejection
        setExistingSurveys(prev => prev.map(item => 
          item.email === representativeEmail ? { ...item, status: "Rejected" } : item
        ));
      } else {
        throw new Error(response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const filteredData =
    statusFilters.length > 0
      ? existingSurveys.filter((item) => statusFilters.includes(item.status))
      : existingSurveys;

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
    <div className="w-full h-max">
      <div className="flex items-center justify-between w-full">
        <div className="w-full md:w-auto">
          <h2 className="text-xl font-semibold mb-1">Meeting Requests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage meeting requests from sales representatives
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent">
                <FunnelIcon className="fill-[#2C514C] mr-2" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 w-48">
              <DropdownMenuLabel className="text-[#2C514C]">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Pending", "Accepted", "Rejected"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  className="p-2 hover:bg-gray-50"
                  onSelect={(e) => e.preventDefault()}
                >
                  <label className="flex items-center gap-2 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="h-4 w-4 accent-[#2C514C]"
                    />
                    <span className="text-[#2C514C]">{status}</span>
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent">
                <ArrowDownWideNarrow className="mr-2" /> Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mr-5">
              <DropdownMenuLabel className="text-[#2C514C]">
                Sort Options
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { label: "Date (Oldest First)", key: "date", dir: "asc" },
                { label: "Date (Newest First)", key: "date", dir: "desc" },
                { label: "Donation (Low - High)", key: "donation", dir: "asc" },
                { label: "Donation (High - Low)", key: "donation", dir: "desc" },
              ].map((opt) => (
                <DropdownMenuItem
                  key={opt.label}
                  className="cursor-pointer hover:bg-gray-50 text-[#2C514C]"
                  onSelect={() => handleAdvancedSort(opt.key, opt.dir)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-auto lg:overflow-hidden mb-5 h-max">
        <Table className="w-full min-w-[1000px]">
          <TableHeader className="border-t">
            <TableRow className="bg-white sticky top-0 z-10">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("name")}
              >
                <div className="flex items-center justify-between">
                  Sales Representative{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead>Executive</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("date")}
              >
                <div className="flex items-center justify-between">
                  Proposed Date{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("donation")}
              >
                <div className="flex items-center justify-between">
                  Donation ($){" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((request) => (
              <TableRow key={request._id}>
                <TableCell className="min-w-[200px]">
                  <div className="font-medium">{request.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {request.email}
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <div className="font-medium">{request.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {request.email}
                  </div>
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {new Date(request.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  ${request.donationAmount}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {getStatusBadge(request.status || "Pending")}
                </TableCell>
                <TableCell className="min-w-[250px] flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      // View receipt logic here
                      console.log(`View receipt for ${request.email}`);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Receipt
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1 bg-[#28C76F29] text-[#28C76F] hover:bg-[#28C76F29]"
                    onClick={() => handleAccept(request.email)}
                    disabled={request.status === "Accepted"}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1 bg-[#EA545529] text-[#EA5455] hover:bg-[#EA545529]"
                    onClick={() => handleReject(request.email)}
                    disabled={request.status === "Rejected"}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{" "}
          {sortedData.length} entries
        </span>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            className="border bg-gray-200"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              size="sm"
              className={
                num === currentPage
                  ? "bg-[#2C514C] text-white"
                  : "bg-gray-200 text-[#2C514C] hover:bg-[#2C514C] hover:text-white"
              }
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="border bg-gray-200"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;