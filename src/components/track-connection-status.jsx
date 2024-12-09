import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TrackConnectionStatus = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(true);
  const [connectionData, setConnectionData] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_new_connection_requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
            // Add authentication header if required
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      const trimmedEmail = email.trim().toLowerCase();
      console.log(trimmedEmail);
      console.log(data);

      // Filter the fetched records by matching email and map to the desired format
      const filteredData = data.result.filter((item) => 
        item.u_email_address && 
        item.u_email_address.toLowerCase() === trimmedEmail
      ).map((item) => ({
        id: item.sys_id,
        name: `${item.u_first_name} ${item.u_second_name}`,
        email: item.u_email_address,
        status: getStatusLabel(item.u_approval_action), // Get status label
        requestDate: item.sys_created_on, // Use sys_created_on for request date
      }));
      console.log(filteredData);

      if (filteredData.length === 0) {
        setErrorDialog("No new requests were made with this email.");
      } else {
        setConnectionData(filteredData);
        setShowEmailDialog(false);
      }
    } catch (error) {
      console.error("Error fetching data from ServiceNow:", error);
      setErrorDialog("Failed to fetch data. Please try again.");
    }
  };

  const handleRowClick = (connection) => {
    setSelectedConnection(connection);
    setShowDetailsDialog(true);
  };

  // Function to map status codes to labels
 // ... other code ...

// Function to map status codes to labels
const getStatusLabel = (statusCode) => {
  const statusMap = {
    "1": "Proceed",
    "2": "In Progress",
    "3": "Fixed",
    "4": "Approved",
    "5": "Rejected",
    // Add other status codes and labels as needed
  };
  // If statusCode is empty, return "Requested"
  return statusMap[statusCode] || (statusCode === "" ? "Requested" : statusCode); 
};

// ... other code ...

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Track Connection Status</h1>

      {/* Email Input Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Email</DialogTitle>
            <DialogDescription>
              Please enter the email address you used when requesting a new
              connection.
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
              <Button type="submit">Track Status</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={!!errorDialog} onOpenChange={() => setErrorDialog("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p>{errorDialog}</p>
          <DialogFooter>
            <Button onClick={() => setErrorDialog("")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connection Data Table */}
      {connectionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Requests</CardTitle>
            <CardDescription>
              Click on a row to view more details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectionData.map((connection) => (
                  <TableRow
                    key={connection.id}
                    onClick={() => handleRowClick(connection)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell>{connection.name}</TableCell>
                    <TableCell>{connection.status}</TableCell>
                    <TableCell>{connection.requestDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Connection Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection Details</DialogTitle>
          </DialogHeader>
          {selectedConnection && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <span className="col-span-3">{selectedConnection.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <span className="col-span-3">{selectedConnection.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <span className="col-span-3">{selectedConnection.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Request Date</Label>
                <span className="col-span-3">{selectedConnection.requestDate}</span>
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

export default TrackConnectionStatus;