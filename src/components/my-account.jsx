import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, FileText, LogOut, Download } from "lucide-react";

const MyAccount = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userData, setUserData] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [email, setEmail] = useState("");
  const [Uid, setUid] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchUserData(storedEmail);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "billing" && userData && userData.u_eid) {
      fetchUserBillingHistory();
    }
  }, [activeTab, userData]);


  const downloadBill = async (billingRecord) => {
  try {
    // Prepare the data payload
    const payload = {
      data: {
      "currency": "USD",
  
    "items": [
        {
            "description": billingRecord.u_year,
            "quantity": billingRecord.u_month,
            "unit_price": billingRecord.u_units_used,
            "total": billingRecord.u_amount_paid
        },
    ],
    "gross_total": billingRecord.u_amount_paid
      },
      template_id: "6a877b23ba0aeb6e",
      "output_file": "output.pdf",
    };

    // Make the API request
    const response = await fetch("https://api.craftmypdf.com/v1/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": `6366MTU1MzA6MTU2MDY6WmoxTjdmbWZITXZNdm8zag=`, // Replace with actual token or remove if not required
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }

    // Handle the API response
    const result = await response.json();
    if (result.status === "success" && result.file) {
      
      window.open(result.file, "_blank");
      const link = document.createElement("a");
      link.href = result.file;
      link.download = "output.pdf"; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("PDF generation succeeded, but no file URL was returned.");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

  const fetchUserData = async (userEmail) => {
    try {
      const response = await fetch(
       `https://dev281161.service-now.com/api/now/table/u_electricity_users_table?sysparm_query=u_email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        setUserData(data.result[0]);
        setUid(data.result[0].u_eid);
      } else {
        alert("No user exists with this email.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchUserBillingHistory = async () => {
    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_electricity_bill_payment_history?sysparm_query=u_eid=${encodeURIComponent(userData.u_eid)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
          },
        }
      );

      if (!response.ok) throw new Error("Error fetching billing history");

      const data = await response.json();
      setBillingHistory(data.result || []);
    } catch (error) {
      console.error("Error in fetching billing history:", error);
    }
  };

  const handleLogin = () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    localStorage.setItem("userEmail", email);
    fetchUserData(email);
    setIsDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserData(null);
    setBillingHistory([]);
    setShowLogoutDialog(false);
    navigate("/");
  };

  const TabButton = ({ value, icon: Icon, children }) => (
    <Button
      variant={activeTab === value ? "default" : "ghost"}
      className="w-full justify-start"
      onClick={() => setActiveTab(value)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <Button variant="outline" className="mb-4" onClick={() => navigate("/")}>
        Back
      </Button>
      {userData ? (
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-64 flex-shrink-0">
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-1">
                <TabButton value="details" icon={User}>
                  My Details
                </TabButton>
                <TabButton value="billing" icon={FileText}>
                  Billing History
                </TabButton>
                <TabButton value="logout" icon={LogOut}>
                  Logout
                </TabButton>
              </nav>
            </CardContent>
          </Card>
          <div className="flex-1">
            {activeTab === "details" && (
              <Card>
                <CardHeader>
                  <CardTitle>My Details</CardTitle>
                  <CardDescription>View and manage your account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt={userData.u_first_name} />
                      <AvatarFallback>
                        {userData.u_first_name[0]}
                        {userData.u_second_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {userData.u_first_name} {userData.u_second_name}
                      </h2>
                      <p className="text-gray-500">Customer ID: {userData.u_eid}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <p>
                      <strong>Email:</strong> {userData.u_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {userData.u_phone_no}
                    </p>
                    <p>
                      <strong>Address:</strong> {userData.u_address}
                    </p>
                    <p>
                      <strong>Phase:</strong> {userData.u_phase}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Edit Details</Button>
                </CardFooter>
              </Card>
            )}
            {activeTab === "billing" && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View your recent billing history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Units Used</TableHead>
                        <TableHead>Amount Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.length > 0 ? (
                        billingHistory.map((value, index) => (
                          <TableRow key={index}>
                            <TableCell>{value.u_month}</TableCell>
                            <TableCell>{value.u_year}</TableCell>
                            <TableCell>{value.u_units_used}</TableCell>
                            <TableCell>₹{value.u_amount_paid}</TableCell>
                            <Button onClick={()=>downloadBill(value)} variant="secondary" size="icon">
                            <Download></Download>
                            </Button>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No billing history available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            {activeTab === "logout" && (
              <Card>
                <CardHeader>
                  <CardTitle>Logout</CardTitle>
                  <CardDescription>Are you sure you want to logout?</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Logout</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure you want to logout?</DialogTitle>
                        <DialogDescription>This action will end your current session.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                          Logout
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Please enter your email address to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded"
            />
            {error && <p className="text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </div>
);
}

export default MyAccount;
