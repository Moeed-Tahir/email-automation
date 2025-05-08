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

import { Badge } from "@/components/ui/badge";
import { ArrowDownWideNarrow, ChevronsUpDown, FunnelIcon } from "lucide-react";
import { data } from "../lib/constant";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";

const DashboardTable = ({ userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [_, setShowSortMenu] = useState(false);
  const itemsPerPage = 8;
  const router = useRouter();
  const [existingSurveys, setExistingSurveys] = useState([]);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [loading, setLoading] = useState(true);

  const fetchExistingSurveys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/routes/SurvayForm`, {
        params: {
          action: "fetchSurvayData",
          userId: userId,
        },
      });

      if (response.data.success) {
        setExistingSurveys(response.data.data || []);
      } else {
        console.error("API returned unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching existing surveys:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchExistingSurveys();
    }
  }, [userId]);

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

  const handleAccept = async (survey) => {
    setActionLoading({ id: survey._id, type: 'accept' });
    try {
      const fromEmail = Cookies.get("userEmail");
      const userName = Cookies.get("userName");
      const mainUserId = Cookies.get("UserId");
      const charityCompany = Cookies.get("charityCompany");

      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      const response = await axios.post(
        "/api/routes/Google?action=sendAcceptEmailToAdmin",
        {
          sendFromEmail: fromEmail,
          sendToEmail: survey.email,
          dashboardUserId: survey.userId,
          mainUserId: mainUserId,
          objectId: survey._id,
          bidAmount: survey.bidAmount,
          name: survey.name,
          surveyId: survey._id,
          userName: userName,
          charityCompany:charityCompany
        }
      );

      if (response.data.message) {
        fetchExistingSurveys();
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleReject = async (survey) => {
    setActionLoading({ id: survey._id, type: 'reject' });
    try {
      const fromEmail = Cookies.get("userEmail");
      const userName = Cookies.get("userName");

      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      const response = await axios.post(
        "/api/routes/Google?action=sendRejectEmailToAdmin",
        {
          sendFromEmail: fromEmail,
          sendToEmail: survey.email,
          objectId: survey._id,
          userName:userName
        }
      );

      if (response.data.message) {
        fetchExistingSurveys();
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }finally{
      setActionLoading({ id: null, type: null });
    }
  };

  // Filter and sort data
  const filteredData = existingSurveys.filter(item => 
    statusFilters.length === 0 || statusFilters.includes(item.status)
  );

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

  // Pagination logic
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = sortedData.slice(startIndex, endIndex);

  // Reset to first page if current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="w-full h-max">
      <div className="flex items-center justify-between w-full">
        <div className="w-full md:w-auto">
          <h2 className="text-xl font-semibold mb-1">Recent Bid Requests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage meeting requests from sales representatives.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent cursor-pointer">
                <FunnelIcon className="fill-[#2C514C] mr-2" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 w-48">
              <DropdownMenuLabel className="text-[#2C514C]">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Pending", "Accept", "Reject"].map((status) => (
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
              <Button className="text-sm font-medium text-[#2C514C] border bg-transparent hover:bg-transparent cursor-pointer">
                <ArrowDownWideNarrow className="mr-2" /> Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mr-5">
              <DropdownMenuLabel className="text-[#2C514C]">
                Sort Options
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { label: "Score (Low - High)", key: "totalScore", dir: "asc" },
                { label: "Score (High - Low)", key: "totalScore", dir: "desc" },
                { label: "Bid (Low - High)", key: "bidAmount", dir: "asc" },
                { label: "Bid (High - Low)", key: "bidAmount", dir: "desc" },
                { label: "Date (Oldest)", key: "createdAt", dir: "asc" },
                { label: "Date (Newest)", key: "createdAt", dir: "desc" },
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
                  Representative{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("createdAt")}
              >
                <div className="flex items-center justify-between">
                  Proposed Date{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("totalScore")}
              >
                <div className="flex items-center justify-between">
                  Score <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("bidAmount")}
              >
                <div className="flex items-center justify-between">
                  Bid <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading bids...
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {statusFilters.length > 0
                    ? "No bids match the selected filters"
                    : "No bids available yet"}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((survey) => (
                <TableRow key={survey._id}>
                  <TableCell className="min-w-[200px]">
                    <div className="font-medium">{survey.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {survey.email}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {survey.totalScore || "-"}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <Badge
                      variant="outline"
                      className="bg-gray-200 p-2 px-3 rounded-sm"
                    >
                      {survey.bidAmount}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {getStatusBadge(survey.status)}
                  </TableCell>
                  <TableCell className="min-w-[300px] lg:min-w-[250px] flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/${survey.userId}/bid-details?surveyId=${survey._id}`
                        )
                      }
                      className="bg-[#FF950029] text-[#FF9500] hover:bg-[#FF9500] hover:text-white cursor-pointer"
                    >
                      View Details
                    </Button>
                    {survey.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(survey)}
                          disabled={survey.status === "Accepted" || (actionLoading.id === survey._id && actionLoading.type === "accept")}
                          className="bg-[#28C76F29] text-[#28C76F] cursor-pointer hover:bg-[#28C76F] hover:text-white transition-all duration-200"
                        >
                          {(actionLoading.id === survey._id && actionLoading.type === "accept") ? "Loading" : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(survey)}
                          disabled={survey.status === "Rejected" || (actionLoading.id === survey._id && actionLoading.type === "reject")}
                          className="bg-[#EA545529] text-[#EA5455] hover:bg-[#EA5455] hover:text-white cursor-pointer"
                        >
                          {(actionLoading.id === survey._id && actionLoading.type === "reject") ? "Loading" : "Reject"}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls - only show if more than one page exists */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              className="border bg-gray-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              First
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="border bg-gray-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            
            {/* Show limited page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  className={
                    pageNum === currentPage
                      ? "bg-[#2C514C] text-white"
                      : "bg-gray-200 text-[#2C514C] hover:bg-[#2C514C] hover:text-white"
                  }
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 py-1">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <Button
                size="sm"
                className={
                  totalPages === currentPage
                    ? "bg-[#2C514C] text-white"
                    : "bg-gray-200 text-[#2C514C] hover:bg-[#2C514C] hover:text-white"
                }
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="border bg-gray-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="border bg-gray-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Show message when only one entry exists */}
      {!loading && totalItems === 1 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing the only bid available
        </div>
      )}
    </div>
  );
};

export default DashboardTable;