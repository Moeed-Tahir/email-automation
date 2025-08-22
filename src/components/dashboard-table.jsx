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
import { ArrowDownWideNarrow, ChevronsUpDown, FunnelIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DashboardTable = forwardRef(({ userId }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusFilters, setStatusFilters] = useState([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const itemsPerPage = 8;
  const router = useRouter();
  const [existingSurveys, setExistingSurveys] = useState([]);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [loading, setLoading] = useState(true);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    survey: null,
    actionType: null,
  });
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const downloadPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Bid Requests Report", 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = existingSurveys.map(survey => [
      survey.name,
      new Date(survey.createdAt).toLocaleDateString(),
      survey.totalScore || '-',
      `$${survey.bidAmount}`,
      survey.status
    ]);

    autoTable(doc, {
      head: [['Representative', 'Proposed Date', 'Score', 'Bid', 'Status']],
      body: tableData,
      startY: 40,
      styles: {
        cellPadding: 2,
        fontSize: 9,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [44, 81, 76],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 }
      },
      margin: { top: 40 }
    });

    doc.save('bid-requests-report.pdf');
  };

  useImperativeHandle(ref, () => ({
    downloadPdf
  }));

  useEffect(() => {
    if (userId) {
      fetchExistingSurveys();
    }
  }, [userId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-[#FFF5E6] text-[#FF9500] p-2 px-3 font-medium border border-[#FFE4B2]">
            Pending
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-[#E6F7EE] text-[#28C76F] p-2 px-3 font-medium border border-[#B2F0D5]">
            Completed
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-[#FFEEEE] text-[#EA5455] p-2 px-3 font-medium border border-[#FFC7C7]">
            Failed
          </Badge>
        );
      case "Processing":
        return (
          <Badge className="bg-[#E6F2FF] text-[#4285F4] p-2 px-3 font-medium border border-[#B2D3FF]">
            Processing
          </Badge>
        );
      case "Refunded":
        return (
          <Badge className="bg-[#F3E6FF] text-[#9C27B0] p-2 px-3 font-medium border border-[#E0B2FF]">
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 p-2 px-3 font-medium border border-gray-200">
            {status}
          </Badge>
        );
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

  const showConfirmationDialog = (survey, actionType) => {
    setConfirmationDialog({
      open: true,
      survey,
      actionType
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      open: false,
      survey: null,
      actionType: null
    });
  };

  const handleConfirmAction = async () => {
    const { survey, actionType } = confirmationDialog;
    // console.log("survey", survey);
    if (!survey) return;

    setActionLoading({ id: survey._id, type: actionType });
    try {
      const fromEmail = Cookies.get("userEmail");
      const userName = Cookies.get("userName");
      const mainUserId = Cookies.get("UserId");
      const charityCompany = Cookies.get("charityCompany");

      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      if (actionType === 'accept') {
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
            charityCompany: charityCompany,
            location: survey.location,
            jobTitle: survey.jobTitle,
            industry: survey.industry,
            companyName: survey.companyName,
          }
        );

        if (!response.data.message) {
          throw new Error(response.data.message || "Failed to send acceptance email");
        }
      } else if (actionType === 'reject') {
        const response = await axios.post(
          "/api/routes/Google?action=sendRejectEmailToAdmin",
          {
            sendFromEmail: fromEmail,
            sendToEmail: survey.email,
            objectId: survey._id,
            userName: userName
          }
        );

        if (!response.data.message) {
          throw new Error(response.data.message || "Failed to send rejection email");
        }
      }

      await fetchExistingSurveys();
    } catch (error) {
      console.error(`Error in ${actionType} action:`, error);
    } finally {
      setActionLoading({ id: null, type: null });
      closeConfirmationDialog();
    }
  };

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

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="w-full h-max">
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
                ? `Are you sure you want to accept the bid from ${confirmationDialog.survey?.name}? This action will notify the representative.`
                : `Are you sure you want to reject the bid from ${confirmationDialog.survey?.name}? This action cannot be undone.`}
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
                  Submission Date{" "}
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
              <TableHead>Donation Status</TableHead>
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
                    <div
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setShowDetailsModal(true);
                      }}
                    >
                      {survey.name}
                    </div>
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

                    {`$${survey.bidAmount}`}
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {getStatusBadge(survey.donationStatus)}
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
                          onClick={() => showConfirmationDialog(survey, 'accept')}
                          disabled={survey.status === "Accepted" || (actionLoading.id === survey._id && actionLoading.type === "accept")}
                          className="bg-[#28C76F29] text-[#28C76F] cursor-pointer hover:bg-[#28C76F] hover:text-white transition-all duration-200"
                        >
                          {(actionLoading.id === survey._id && actionLoading.type === "accept") ? "Loading" : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => showConfirmationDialog(survey, 'reject')}
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

      {!loading && totalItems === 1 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing the only bid available
        </div>
      )}

      <AlertDialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Representative Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedSurvey && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedSurvey.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedSurvey.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p>{selectedSurvey.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Title</p>
                  <p>{selectedSurvey.jobTitle || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p>{selectedSurvey.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">State</p>
                  <p>{selectedSurvey.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p>{selectedSurvey.country || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
});

DashboardTable.displayName = "DashboardTable";

export default DashboardTable;