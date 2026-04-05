"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const routesData = [
  {
    id: "285M",
    name: "Rajanukunte to Majestic",
    color: "#eab308",
    stops: [
      { name: "Rajanukunte", lat: 13.1686, lng: 77.5601, timeFromStart: 0 },
      { name: "Yelahanka", lat: 13.1007, lng: 77.5963, timeFromStart: 10 },
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 20 },
      { name: "Mekhri Circle", lat: 13.0215, lng: 77.5946, timeFromStart: 25 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 35 }
    ]
  },
  {
    id: "356K",
    name: "Yelahanka to Majestic",
    color: "#3b82f6",
    stops: [
      { name: "Yelahanka", lat: 13.1007, lng: 77.5963, timeFromStart: 0 },
      { name: "Jakkur", lat: 13.0722, lng: 77.6013, timeFromStart: 8 },
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 15 },
      { name: "Shivajinagar", lat: 12.9833, lng: 77.6033, timeFromStart: 25 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 35 }
    ]
  },
  {
    id: "500D",
    name: "Hebbal to Electronic City",
    color: "#ef4444",
    stops: [
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 0 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 15 },
      { name: "Silk Board", lat: 12.9177, lng: 77.6220, timeFromStart: 30 },
      { name: "Electronic City", lat: 12.8399, lng: 77.6770, timeFromStart: 45 }
    ]
  },
  {
    id: "201R",
    name: "Whitefield to Majestic",
    color: "#8b5cf6",
    stops: [
      { name: "Whitefield", lat: 12.9698, lng: 77.7500, timeFromStart: 0 },
      { name: "ITPL", lat: 12.9784, lng: 77.7276, timeFromStart: 5 },
      { name: "Marathahalli", lat: 12.9591, lng: 77.6974, timeFromStart: 15 },
      { name: "KR Puram", lat: 13.0077, lng: 77.6950, timeFromStart: 25 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 45 }
    ]
  },
  {
    id: "378A",
    name: "Kengeri to Majestic",
    color: "#22c55e",
    stops: [
      { name: "Kengeri", lat: 12.9141, lng: 77.4842, timeFromStart: 0 },
      { name: "RR Nagar", lat: 12.9274, lng: 77.5155, timeFromStart: 10 },
      { name: "Nayandahalli", lat: 12.9400, lng: 77.5250, timeFromStart: 15 },
      { name: "Satellite Bus Stand", lat: 12.9500, lng: 77.5500, timeFromStart: 20 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 30 }
    ]
  },
  {
    id: "401K",
    name: "Banashankari to Hebbal",
    color: "#f97316",
    stops: [
      { name: "Banashankari", lat: 12.9250, lng: 77.5468, timeFromStart: 0 },
      { name: "Jayanagar", lat: 12.9250, lng: 77.5938, timeFromStart: 10 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 20 },
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 35 }
    ]
  },
  {
    id: "600F",
    name: "Silk Board to KR Puram",
    color: "#06b6d4",
    stops: [
      { name: "Silk Board", lat: 12.9177, lng: 77.6220, timeFromStart: 0 },
      { name: "BTM Layout", lat: 12.9166, lng: 77.6101, timeFromStart: 5 },
      { name: "Domlur", lat: 12.9611, lng: 77.6387, timeFromStart: 15 },
      { name: "KR Puram", lat: 13.0077, lng: 77.6950, timeFromStart: 30 }
    ]
  },
  {
    id: "777E",
    name: "Airport to Majestic",
    color: "#eab308",
    stops: [
      { name: "Kempegowda Airport", lat: 13.1986, lng: 77.7066, timeFromStart: 0 },
      { name: "Yelahanka", lat: 13.1007, lng: 77.5963, timeFromStart: 20 },
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 30 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 45 }
    ]
  },
  {
    id: "150C",
    name: "BTM to Majestic",
    color: "#14b8a6",
    stops: [
      { name: "BTM Layout", lat: 12.9166, lng: 77.6101, timeFromStart: 0 },
      { name: "Silk Board", lat: 12.9177, lng: 77.6220, timeFromStart: 5 },
      { name: "Dairy Circle", lat: 12.9352, lng: 77.6050, timeFromStart: 15 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 30 }
    ]
  },
  {
    id: "88A",
    name: "Indiranagar to Majestic",
    color: "#db2777",
    stops: [
      { name: "Indiranagar", lat: 12.9719, lng: 77.6412, timeFromStart: 0 },
      { name: "Domlur", lat: 12.9611, lng: 77.6387, timeFromStart: 5 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 15 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 25 }
    ]
  },
  {
    id: "42B",
    name: "Peenya to Majestic",
    color: "#4f46e5",
    stops: [
      { name: "Peenya", lat: 13.0329, lng: 77.5273, timeFromStart: 0 },
      { name: "Yeshwanthpur", lat: 13.0280, lng: 77.5540, timeFromStart: 10 },
      { name: "Malleshwaram", lat: 13.0050, lng: 77.5690, timeFromStart: 20 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 30 }
    ]
  },
  {
    id: "90D",
    name: "KR Puram to Electronic City",
    color: "#f43f5e",
    stops: [
      { name: "KR Puram", lat: 13.0077, lng: 77.6950, timeFromStart: 0 },
      { name: "Marathahalli", lat: 12.9591, lng: 77.6974, timeFromStart: 10 },
      { name: "Silk Board", lat: 12.9177, lng: 77.6220, timeFromStart: 25 },
      { name: "Electronic City", lat: 12.8399, lng: 77.6770, timeFromStart: 40 }
    ]
  },
  {
    id: "333K",
    name: "Jayanagar to Whitefield",
    color: "#78716c",
    stops: [
      { name: "Jayanagar", lat: 12.9250, lng: 77.5938, timeFromStart: 0 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 15 },
      { name: "Indiranagar", lat: 12.9719, lng: 77.6412, timeFromStart: 20 },
      { name: "Whitefield", lat: 12.9698, lng: 77.7500, timeFromStart: 40 }
    ]
  },
  {
    id: "700A",
    name: "Airport to Electronic City",
    color: "#0891b2",
    stops: [
      { name: "Kempegowda Airport", lat: 13.1986, lng: 77.7066, timeFromStart: 0 },
      { name: "Hebbal", lat: 13.0352, lng: 77.5970, timeFromStart: 25 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 35 },
      { name: "Electronic City", lat: 12.8399, lng: 77.6770, timeFromStart: 55 }
    ]
  },
  {
    id: "555M",
    name: "Majestic Circular",
    color: "#65a30d",
    stops: [
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 0 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 10 },
      { name: "Indiranagar", lat: 12.9719, lng: 77.6412, timeFromStart: 20 },
      { name: "Shivajinagar", lat: 12.9833, lng: 77.6033, timeFromStart: 30 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 40 }
    ]
  }
];

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [complete, setComplete] = useState(false);

  const seedDB = async () => {
    setSeeding(true);
    try {
      const promises = routesData.map(route => setDoc(doc(db, "routes", route.id), route));
      await Promise.all(promises);
      setComplete(true);
    } catch (e: any) {
      alert("Error seeding: " + e.message);
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 flex-col">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🚀 Firebase Seeder</h1>
        <p className="text-zinc-600 mb-8">Click the button below to instantly populate your Firestore database with 15 pre-built real Bangalore bus routes.</p>
        
        {complete ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg font-bold">
            ✅ Successfully pushed 15 routes to Firestore! 
            <p className="font-normal text-sm mt-2 text-green-700">Check your passenger or driver dashboards.</p>
          </div>
        ) : (
          <Button onClick={seedDB} disabled={seeding} className="w-full h-14 text-lg font-bold">
            {seeding ? "Pushing to Firebase..." : "SEED DATABASE"}
          </Button>
        )}
      </div>
    </div>
  );
}
