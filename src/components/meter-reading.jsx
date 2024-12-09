import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MeterReading = () => {
  const navigate = useNavigate();
  const [electricityId, setElectricityId] = useState("");
  const [unitsUsed, setUnitsUsed] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!electricityId || !unitsUsed) {
      setError("Please fill in all fields");
      return;
    }

    if (isNaN(unitsUsed) || parseFloat(unitsUsed) <= 0) {
      setError("Please enter a valid number of units");
      return;
    }

    try {
      const response = await fetch(
        `https://dev281161.service-now.com/api/now/table/u_electricity_bill_payments?sysparm_query=u_eid=${electricityId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"), // replace with your auth token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        const record = data.result[0];
        const existingUnits = parseFloat(record.u_units_used) || 0;
        const updatedUnits = existingUnits + parseFloat(unitsUsed);

        const updateResponse = await fetch(
          `https://dev281161.service-now.com/api/now/table/u_electricity_bill_payments/${record.sys_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"), // replace with your auth token
            },
            body: JSON.stringify({ u_units_used: updatedUnits.toString() }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update the record");
        }

        setSuccess(true);
        setElectricityId("");
        setUnitsUsed("");
      } else {
        setError("No record found with the given Electricity ID");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to submit meter reading. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Meter Reading Submission</CardTitle>
          <CardDescription>Enter the electricity ID and units used</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="electricityId">Electricity ID</Label>
                <Input
                  id="electricityId"
                  placeholder="Enter Electricity ID"
                  value={electricityId}
                  onChange={(e) => setElectricityId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitsUsed">Units Used</Label>
                <Input
                  id="unitsUsed"
                  type="number"
                  placeholder="Enter Units Used"
                  value={unitsUsed}
                  onChange={(e) => setUnitsUsed(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button onClick={handleSubmit} className="w-full">Submit Reading</Button>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Meter reading submitted successfully!</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeterReading;
