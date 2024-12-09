import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, CreditCard, MessageSquare, Activity, Search, User } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"

const HomePage = () => {
  const navigate = useNavigate()
  
  const[Loggedin,SetLoggedin]=useState("Login");
  const [apiResponse, setApiResponse] = useState('');
  useEffect(()=>{
    const soterdEmail = localStorage.getItem("userEmail");
    if(soterdEmail){
      SetLoggedin("Go to My Profile");
    }
  })
  const callGeminiAPI = async () => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=AIzaSyBtVDWYoFTsNsrOj6NnwaS3pWGAAnCY5vo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "contents": [
            {
              "parts": [
                {
                  "text": "https://i.ibb.co/x3kL8nD/banner.jpg is the name in the image link is equal to Adarsh Kumar, just respond yes if it matches else only respond no"
                }
              ]
            }
          ]
        }),
      });

      const data = await response.json();
      const message = data.candidates[0].content.parts[0].text; 
      console.log(message);
      setApiResponse(message);  // Format the JSON response for better readability
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setApiResponse('Error calling API');
    }
  };


  const buttons = [
    { icon: Zap, text: "New Connection Request", path: "/new-connection" },
    { icon: CreditCard, text: "Pay Current Bill", path: "/pay-bill" },
    { icon: MessageSquare, text: "Raise a Complaint", path: "/raise-complaint" },
    { icon: Activity, text: "Track Connection Status", path: "/track-connection" },
    { icon: Search, text: "Track Complaint", path: "/track-complaint" },
    { icon: User, text: "My Account", path: "/my-account" },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Login Button at the top right */}
      <div className="absolute top-4 right-4">
        <Button onClick={() => navigate("/my-account")}>{Loggedin}</Button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-5xl bg-white border-2 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Electricity Bill Management</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-300 z-10 relative overflow-hidden group"
                  onClick={() => navigate(button.path)}
                >
                  <button.icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-center px-2 relative z-10">{button.text}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
