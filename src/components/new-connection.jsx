import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const NewConnection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    phases: "",
    firstConnection: false,
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(""); 
  const [adharCard, setAdharCard] = useState(null); // State for file upload

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Capture the selected file
    if (file) {
      setAdharCard(file); // Set the file in state
    }
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.imgbb.com/1/upload?key=a369578da236e59ff7fa4aa3ee29fd03", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url; // Return the URL of the uploaded image
    } else {
      throw new Error("ImgBB upload failed");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // First, upload the Aadhar card to ImgBB
      const imageUrl = await uploadToImgBB(adharCard);

      // Now create the new connection request in ServiceNow
      const serviceNowFormData = {
        u_first_name: formData.firstName,
        u_second_name: formData.lastName,
        u_phone_no: formData.phone,
        u_email_address: formData.email,
        u_address: formData.address,
        u_phase: formData.phases,
        u_first_connection: formData.firstConnection,
        u_adhar_card_url: imageUrl, // Add the ImgBB URL
      };

      const response = await fetch("https://dev281161.service-now.com/api/now/table/u_new_connection_requests", {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa("admin:xCPd8r6wH-^A"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceNowFormData),
      });

      if (response.ok) {
        setDialogMessage("Request made successfully and Aadhar card uploaded!");
      } else {
        setDialogMessage(`Error: ${response.statusText}`);
      }
    } catch (error) {
      setDialogMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setDialogOpen(true);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">New Connection Request</CardTitle>
          <CardDescription>Please fill out the form below to request a new electricity connection.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="123-456-7890" value={formData.phone} onChange={handleChange} required />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} required />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, City, State, ZIP" value={formData.address} onChange={handleChange} required />
            </div>

            {/* Phases Select */}
            <div className="space-y-2">
              <Label htmlFor="phases">Number of Phases Required</Label>
              <Select required value={formData.phases} onValueChange={(value) => setFormData((prevData) => ({ ...prevData, phases: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Connection Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="firstConnection" checked={formData.firstConnection} onCheckedChange={(checked) => setFormData((prevData) => ({ ...prevData, firstConnection: checked }))} />
              <Label htmlFor="firstConnection">This is my first connection</Label>
            </div>

            {/* Aadhar Card File Upload */}
            <div className="space-y-2">
              <Label htmlFor="adharCard">Upload Your Aadhar Card (Image Only)</Label>
              <Input 
                id="adharCard" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                required 
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog for Success/Failure */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>{dialogMessage}</DialogTitle>
          <Button onClick={() => navigate("/")}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewConnection;
