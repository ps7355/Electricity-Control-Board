import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function getMonth() {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[new Date().getMonth()];
}

const PayBill = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/my-account");
      return;
    }

    const fetchUserAndBillingData = async () => {
      try {
        const userResponse = await fetch("https://dev281161.service-now.com/api/now/table/u_electricity_users_table", {
          headers: {
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
          },
        });
        const userDataJson = await userResponse.json();
        const userRecord = userDataJson.result.find((user) => user.u_email === userEmail);

        if (!userRecord) {
          setErrorMessage("User data not found.");
          return;
        }

        setUserData({
          eid: userRecord.u_eid,
          firstName: userRecord.u_first_name,
          secondName: userRecord.u_second_name,
          email: userRecord.u_email,
          phone: userRecord.u_phone_no,
          address: userRecord.u_address,
          phase: userRecord.u_phase,
        });

        const billingResponse = await fetch("https://dev281161.service-now.com/api/now/table/u_electricity_bill_payments", {
          headers: {
            Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
          },
        });
        const billingDataJson = await billingResponse.json();
        const billingRecord = billingDataJson.result.find((bill) => bill.u_eid === userRecord.u_eid);

        if (!billingRecord) {
          setErrorMessage("Billing data not found.");
          return;
        }

        setBillingData({
          sys_id: billingRecord.sys_id,
          paymentDue: billingRecord.u_payment_due,
          paid: billingRecord.u_paid,
          unitsUsed: billingRecord.u_units_used,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndBillingData();
  }, [navigate]);

  const handlePayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const options = {
      key: "rzp_test_zSZWEBkO6SaVoQ", // Replace with your actual Razorpay key
      amount: billingData.paymentDue * 100, // Convert to paise
      currency: "INR",
      name: "Electricity Billing",
      description: "Payment for electricity bill",
      prefill: {
        name: `${userData.firstName} ${userData.secondName}`,
        email: userData.email,
        contact: userData.phone,
      },
      theme: {
        color: "#3399cc",
      },
      handler: async function (response) {
        try {
          const updateEachMonth = await fetch(
            `https://dev281161.service-now.com/api/now/table/u_electricity_bill_payment_history`,
            {
              method: "POST", // Use POST for creating a new record
              headers: {
                Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                u_eid: userData.eid,
                u_amount_paid: billingData.paymentDue,
                u_month: getMonth(),
                u_units_used: billingData.unitsUsed,
                u_year: new Date().getFullYear().toString(),
              }),
            }
          );

          if (!updateEachMonth.ok) throw new Error("Failed to add payment history.");

          const updateResponse = await fetch(
            `https://dev281161.service-now.com/api/now/table/u_electricity_bill_payments/${billingData.sys_id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: "Basic " + btoa("admin:xCPd8r6wH-^A"),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                u_payment_due: 0,
                u_paid: Number(billingData.paid) + Number(billingData.paymentDue),
              }),
            }
          );

          if (!updateResponse.ok) throw new Error("Failed to update payment record.");

          setIsPaymentConfirmed(true);
          setShowPaymentDialog(false);
        } catch (error) {
          setErrorMessage(`Payment succeeded but record update failed: ${error.message}`);
          console.error("Update error:", error);
        } finally {
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setErrorMessage("Payment process was cancelled.");
          setIsLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!userData || !billingData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Pay Your Bill</CardTitle>
          <CardDescription>Review your bill details and make a payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="font-medium">{`${userData.firstName} ${userData.secondName}`}</p>
            </div>
            <div>
              <Label>Account ID</Label>
              <p className="font-medium">{userData.eid}</p>
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <p className="font-medium">{userData.address}</p>
            </div>
            <div>
              <Label>Units Used</Label>
              <p className="font-medium">{billingData.unitsUsed} kWh</p>
            </div>
            <div>
              <Label>Amount Due</Label>
              <p className="font-medium text-xl text-green-600">₹{billingData.paymentDue}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button onClick={handlePayment}>Pay Now</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Make a Payment</DialogTitle>
                <DialogDescription>Confirm payment to proceed.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      {isPaymentConfirmed && (
        <Card className="mt-4 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-center text-green-600 font-semibold">Payment Confirmed! Thank you for your payment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayBill;
