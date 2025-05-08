"use client";

import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

const DonationTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const itemsPerPage = 8;
  const [existingSurveys, setExistingSurveys] = useState(data || []);

  // Update data when prop changes
  useEffect(() => {
    setExistingSurveys(data || []);
  }, [data]);

  const handleHeaderSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleStatusFilter = (status) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const filteredData =
    statusFilters.length > 0
      ? existingSurveys.filter((item) => statusFilters.includes(item.status))
      : existingSurveys;

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.key === "createdAt") {
      return sortConfig.direction === "asc" 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue);
    }
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const numA = parseFloat(aValue) || 0;
    const numB = parseFloat(bValue) || 0;
    return sortConfig.direction === "asc" ? numA - numB : numB - numA;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const statusOptions = [...new Set(existingSurveys.map(item => item.status))];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-[#FFCC0029] text-[#FFCC00] p-2 px-3 font-medium">
            Pending
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-[#28C76F29] text-[#28C76F] p-2 px-3 font-medium">
            Completed
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-[#EA545529] text-[#EA5455] p-2 px-3 font-medium">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 p-2 px-3 font-medium">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="w-full h-max">
      <div className="flex items-center justify-between w-full">
        <div className="w-full md:w-auto">
          <h2 className="text-xl font-semibold mb-1">Donation Records</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review all donation transactions
          </p>
        </div>
      </div>

      {showStatusFilter && (
        <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          {statusOptions.map(status => (
            <Button
              key={status}
              variant={statusFilters.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status)}
              className={
                statusFilters.includes(status) 
                  ? "bg-[#2C514C] text-white hover:bg-[#2C514C] hover:text-white"
                  : "hover:bg-[#2C514C] hover:text-white"
              }
            >
              {status}
            </Button>
          ))}
          {statusFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilters([]);
                setShowStatusFilter(false);
              }}
              className="text-red-500 hover:text-red-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <div className="overflow-auto lg:overflow-hidden mb-5 h-max">
        <Table className="w-full min-w-[1000px]">
          <TableHeader className="border-t">
            <TableRow className="bg-white sticky top-0 z-10">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("salesRepresentiveName")}
              >
                <div className="flex items-center justify-between">
                  Representative{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("executiveName")}
              >
                <div className="flex items-center justify-between">
                  Executive{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("createdAt")}
              >
                <div className="flex items-center justify-between">
                  Date{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("donation")}
              >
                <div className="flex items-center justify-between">
                  Amount{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("status")}
              >
                <div className="flex items-center justify-between">
                  Status{" "}
                  <ChevronsUpDown className="size-4 text-gray-500" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="min-w-[200px]">
                    <div className="font-medium">{request.salesRepresentiveName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.salesRepresentiveEmail}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="font-medium">{request.executiveName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.executiveEmail}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="min-w-[120px] font-medium">
                    ${parseFloat(request.donation || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {getStatusBadge(request.status)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {statusFilters.length > 0 
                    ? "No donations match the selected filters" 
                    : "No donation records available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - only show if needed */}
      {totalPages > 1 && (
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
      {sortedData.length === 1 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing the only donation record available
        </div>
      )}
    </div>
  );
};

export default DonationTable;