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
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

const DonationTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
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

  return (
    <div className="w-full h-max">
      <div className="flex items-center justify-between w-full">
        <div className="w-full md:w-auto">
          <h2 className="text-xl font-semibold mb-1">Donations Data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review Donation Data
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusOptions.map(status => (
          <Button
            key={status}
            variant={statusFilters.includes(status) ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
        {statusFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilters([])}
            className="text-red-500"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="overflow-auto lg:overflow-hidden mb-5 h-max">
        <Table className="w-full min-w-[1000px]">
          <TableHeader className="border-t">
            <TableRow className="bg-white sticky top-0 z-10">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleHeaderSort("salesRepresentiveName")}
              >
                <div className="flex items-center justify-between">
                  Sales Representative{" "}
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
                  Request Date{" "}
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
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(request.donation || 0).toFixed(2)}
                  </TableCell>
                  
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No donation records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
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
      )}
    </div>
  );
};

export default DonationTable;