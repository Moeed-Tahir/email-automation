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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowDownWideNarrow, ChevronsUpDown, FunnelIcon, FileText, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";

const AdminTable = ({ tableData, fetchAdminData }) => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const itemsPerPage = 8;
  const router = useRouter();
  const [existingSurveys, setExistingSurveys] = useState([]);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    request: null,
    actionType: null,
  });

  useEffect(() => {
    if (tableData) {
      setExistingSurveys(tableData);
    }
  }, [tableData]);

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

  const showConfirmationDialog = (request, actionType) => {
    setConfirmationDialog({
      open: true,
      request,
      actionType
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      open: false,
      request: null,
      actionType: null
    });
  };

  const handleConfirmAction = async () => {
    const { request, actionType } = confirmationDialog;
    console.log("request",request);
    if (!request) return;

    try {
      setActionLoading({ id: request._id, type: actionType });
      
      if (actionType === 'accept') {
        const emailResponse = await axios.post('/api/routes/Admin?action=sendAcceptEmailFromAdmin', {
          executiveEmail: request.executiveEmail,
          executiveName: request.executiveName,
          salesRepresentiveEmail: request.salesRepresentiveEmail,
          salesRepresentiveName: request.salesRepresentiveName,
          objectId: request._id,
          donation: request.donation,
          userId: request.userId,
          calendarLink: request.calendarLink
        });

        if (!emailResponse.data.message) {
          throw new Error(emailResponse.data.message || 'Failed to send acceptance email');
        }
      } else if (actionType === 'reject') {
        const emailResponse = await axios.post('/api/routes/Admin?action=sendRejectEmailFromAdmin', {
          executiveEmail: request.executiveEmail,
          executiveName: request.executiveName,
          salesRepresentiveEmail: request.salesRepresentiveEmail,
          salesRepresentiveName: request.salesRepresentiveName,
          objectId: request._id,
        });

        if (!emailResponse.data.message) {
          throw new Error(emailResponse.data.message || 'Failed to send rejection email');
        }
      }

      await fetchAdminData();
    } catch (error) {
      console.error(`Error in ${actionType} action:`, error);
    } finally {
      setActionLoading({ id: null, type: null });
      closeConfirmationDialog();
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

    const numA = parseFloat(aValue);
    const numB = parseFloat(bValue);
    return sortConfig.direction === "asc" ? numA - numB : numB - numA;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  console.log("currentData",currentData);

  return (
    <div className="w-full h-max">
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmationDialog.open} onOpenChange={closeConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.actionType === 'accept' 
                ? 'Confirm Acceptance' 
                : 'Confirm Rejection'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.actionType === 'accept'
                ? `Are you sure you want to accept the meeting request from ${confirmationDialog.request?.salesRepresentiveName}?`
                : `Are you sure you want to reject the meeting request from ${confirmationDialog.request?.salesRepresentiveName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={
                confirmationDialog.actionType === 'accept'
                  ? "bg-[#28C76F] hover:bg-[#28C76F]/90"
                  : "bg-[#EA5455] hover:bg-[#EA5455]/90"
              }
            >
              {confirmationDialog.actionType === 'accept' ? 'Accept' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                { label: "Date (Oldest First)", key: "createdAt", dir: "asc" },
                { label: "Date (Newest First)", key: "createdAt", dir: "desc" },
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
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((request) => (
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
                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  ${request.donation}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  {getStatusBadge(request.status || "Pending")}
                </TableCell>
                <TableCell className="min-w-[250px] flex flex-wrap gap-2">
                  {request.receiptFormLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 cursor-pointer bg-[#2C514C29] text-[#2C514C] hover:bg-[#2C514C29]"
                      onClick={() => {
                        window.open(request.receiptFormLink, '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Receipt
                    </Button>
                  )}
                  {request.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-[#28C76F29] text-[#28C76F] cursor-pointer hover:bg-[#28C76F] hover:text-white"
                        onClick={() => showConfirmationDialog(request, 'accept')}
                        disabled={request.status === "Accepted" || (actionLoading.id === request._id && actionLoading.type === "accept")}
                      >
                        <Check className="h-4 w-4" />
                        {(actionLoading.id === request._id && actionLoading.type === "accept") ? "Loading" : "Accept"}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 bg-[#EA545529] text-[#EA5455] hover:bg-[#EA5455] hover:text-white cursor-pointer"
                        onClick={() => showConfirmationDialog(request, 'reject')}
                        disabled={request.status === "Rejected" || (actionLoading.id === request._id && actionLoading.type === "reject")}
                      >
                        <X className="h-4 w-4" />
                        {(actionLoading.id === request._id && actionLoading.type === "reject") ? "Loading" : "Reject"}
                      </Button>
                    </>
                  )}
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