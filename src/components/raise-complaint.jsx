import React, { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const RaiseComplaint = () => {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [complaint, setComplaint] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState("");

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    setEmail(userEmail);
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_electricity_users_table`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"), 
          },
        }
      );

      if (!response.ok) {
        console.error("Fetch error:", response);
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      const trimmedEmail = email.trim().toLowerCase();
      console.log("Email entered is"+trimmedEmail);
      const matchedUser = data.result.find(
        (item) => item.u_email && item.u_email.toLowerCase() === trimmedEmail 
      );
      console.log("matched use is" + matchedUser);

      if (!matchedUser) {
        setErrorDialog("No user found with this email.");
      } else {
        setUserData({
          name: `${matchedUser.u_first_name} ${matchedUser.u_second_name}`,
          eid: matchedUser.u_eid,
          email: matchedUser.u_email,
          phone: matchedUser.u_phone_no,
          address: matchedUser.u_address,
        });
        setShowConfirmDialog(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorDialog("Failed to fetch user details. Please try again.");
    }
  };

  const handleConfirmUser = () => {
    setShowConfirmDialog(false);
    setShowComplaintDialog(true);
  };

  const handleComplaintSubmit = async () => {
    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
          },
          body: JSON.stringify({
            u_problem: complaint,
            u_email: email, 
          }),
        }
      );

      if (!response.ok) {
        console.error("Complaint submission error:", response);
        throw new Error(`Error submitting complaint: ${response.statusText}`);
      }

      alert("Complaint submitted successfully!");
      setComplaint("");
      setUserData(null);
      setShowComplaintDialog(false); 
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setErrorDialog("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Raise a Complaint</h1>
      <p>Enter your email to confirm your identity and raise a complaint.</p>

      {/* Email Input Form */}
      <form onSubmit={handleEmailSubmit} className="mt-4">
        <div className="grid gap-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Submit Email</Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Information</DialogTitle>
            <DialogDescription>
              Is this your information?
            </DialogDescription>
          </DialogHeader>
          {userData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <span className="col-span-3">{userData.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <span className="col-span-3">{userData.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">EID</Label>
                <span className="col-span-3">{userData.eid}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <span className="col-span-3">{userData.phone}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Address</Label>
                <span className="col-span-3">{userData.address}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmUser}>Yes, Confirm</Button> 
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Dialog */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Complaint</DialogTitle>
            <DialogDescription>
              Please describe your issue in detail.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label htmlFor="complaint">Complaint</Label>
            <Input
              id="complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />
            <DialogFooter>
              <Button onClick={() => setShowComplaintDialog(false)}>Cancel</Button>
              <Button onClick={handleComplaintSubmit}>Submit Complaint</Button>
            </DialogFooter>
          </div>
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

      <Button asChild className="mt-4">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
};

export default RaiseComplaint;