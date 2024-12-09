import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(true);
  const [complaintData, setComplaintData] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState("");


  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    setEmail(userEmail);
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_complaints`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"), 
            // Add authentication headers if required
          },
        }
      );

      if (!response.ok) {
        console.error("Fetch error:", response);
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      const trimmedEmail = email.trim().toLowerCase();
      console.log(data);
      const filteredData = data.result
        .filter((item) => item.u_email && item.u_email.toLowerCase() === trimmedEmail)
        .map((item) => ({
          id: item.sys_id,
          eid: item.u_eid,
          name: `${item.u_first_name} ${item.u_second_name}`,
          status: getStatusLabel(item.u_status),
          u_phase: item.u_phase,
          u_first_name: item.u_first_name,
          u_email: item.u_email,
          u_phone_no: item.u_phone_no,
          u_second_name: item.u_second_name,
          u_assigned_group: item.u_assigned_group,
          u_assigned_person: item.u_assigned_person,
          u_problem: item.u_problem,
        }));

      if (filteredData.length === 0) {
        setErrorDialog("No complaints found for this email.");
      } else {
        setComplaintData(filteredData);
        setShowEmailDialog(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorDialog("Failed to fetch complaint details. Please try again.");
    }
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      "1": "Problem has been Escalated",
      "2": "Work On Progress",
      "3": "Problem Solved",
    };
    return statusMap[statusCode] || (statusCode === "" ? "Ticket Raised - Please wait" : statusCode);
  };

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsDialog(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Track Complaint</h1>

      {/* Email Input Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Email</DialogTitle>
            <DialogDescription>
              Please enter the email address you used to raise the complaint.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Track Complaint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={!!errorDialog} onOpenChange={() => setErrorDialog("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Something went wrong. Please try again.
            </DialogDescription>
          </DialogHeader>
          <p>{errorDialog}</p>
          <DialogFooter>
            <Button onClick={() => setErrorDialog("")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Data Table */}
      {complaintData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Complaints</CardTitle>
            <CardDescription>Click on a row to view more details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaintData.map((complaint) => (
                  <TableRow
                    key={complaint.id}
                    onClick={() => handleRowClick(complaint)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell>{complaint.eid}</TableCell>
                    <TableCell>{complaint.name}</TableCell>
                    <TableCell>{complaint.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Complaint Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phase</Label>
                <span className="col-span-3">{selectedComplaint.u_phase}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">First Name</Label>
                <span className="col-span-3">{selectedComplaint.u_first_name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <span className="col-span-3">{selectedComplaint.u_email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone No</Label>
                <span className="col-span-3">{selectedComplaint.u_phone_no}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">EID</Label>
                <span className="col-span-3">{selectedComplaint.eid}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Second Name</Label>
                <span className="col-span-3">{selectedComplaint.u_second_name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assigned Group</Label>
                <span className="col-span-3">
                  {selectedComplaint.u_assigned_group ? (
                    <a href={selectedComplaint.u_assigned_group.link} target="_blank" rel="noopener noreferrer">
                      {selectedComplaint.u_assigned_group.display_value || "Assigned Group"}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assigned Person</Label>
                <span className="col-span-3">
                  {selectedComplaint.u_assigned_person ? (
                    <a href={selectedComplaint.u_assigned_person.link} target="_blank" rel="noopener noreferrer">
                      {selectedComplaint.u_assigned_person.display_value || "Assigned Person"}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Problem</Label>
                <span className="col-span-3">{selectedComplaint.u_problem}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button onClick={() => navigate("/")} className="mt-4">
        Back to Home
      </Button>
    </div>
  );
};

export default TrackComplaint;
