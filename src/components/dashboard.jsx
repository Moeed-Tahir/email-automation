"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight, Filter, ListFilter } from "lucide-react"
import { Sidebar } from "./ui/sidebar"

const navItems = [
  { label: "Dashboard", href: "#", icon: <ChevronRight size={16} /> },
  { label: "Bidding Requests", href: "#" },
  { label: "Donations", href: "#" },
  { label: "History", href: "#" },
  { label: "Settings", href: "#" },
  { label: "FAQs", href: "#" },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar items={navItems} />

      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <p className="text-muted-foreground">This month you earned</p>
                <h3 className="text-xl font-bold">$48.9k</h3>
                <Button size="sm" className="mt-2">View Bids</Button>
              </div>
              <div className="w-16 h-16 bg-primary/10 rounded-full" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">Total Bids Received</p>
              <h3 className="text-xl font-bold">42</h3>
              <p className="text-xs text-green-500">+18.2% than last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">Highest Bid</p>
              <h3 className="text-xl font-bold">8</h3>
              <p className="text-xs text-red-500">-8.7% than last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">Average Bid</p>
              <h3 className="text-xl font-bold">27</h3>
              <p className="text-xs text-blue-500">+4.3% than last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">Pending Bids</p>
              <h3 className="text-xl font-bold">23</h3>
              <p className="text-xs text-orange-500">-2.5% than last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Bid Table */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Bid Requests</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filters</Button>
              <Button variant="outline" size="sm"><ListFilter className="w-4 h-4 mr-1" /> Sort By</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-2">Representative</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Proposed Date</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Bid</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Jamal Kerrod", email: "abcde@gmail.com", date: "09 May 2022", score: "08", bid: "$100", status: "Pending" },
                  { name: "Shamus Tuttle", email: "abcde@gmail.com", date: "19 Nov 2022", score: "07", bid: "$150", status: "Reject" },
                  { name: "Devonne Wallbridge", email: "abcde@gmail.com", date: "25 Sep 2022", score: "09", bid: "$200", status: "Reject" },
                  { name: "Ariella Filipuyev", email: "abcde@gmail.com", date: "15 Dec 2022", score: "04", bid: "$250", status: "Accept" },
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-muted-foreground text-xs">{row.email}</p>
                    </td>
                    <td className="p-2">Abc Company</td>
                    <td className="p-2">{row.date}</td>
                    <td className="p-2">{row.score}</td>
                    <td className="p-2">{row.bid}</td>
                    <td className="p-2">
                      <Badge variant={
                        row.status === "Accept" ? "success" :
                        row.status === "Reject" ? "destructive" :
                        "warning"
                      }>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="p-2 space-x-2">
                      <Button size="sm" variant="secondary">View Details</Button>
                      <Button size="sm" variant="success">Accept</Button>
                      <Button size="sm" variant="destructive">Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            {["1", "2", "3", "4", "5"].map(p => (
              <Button key={p} size="sm" variant={p === "1" ? "default" : "outline"}>{p}</Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
