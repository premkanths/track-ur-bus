export interface Stop {
  name: string;
  lat: number;
  lng: number;
  timeFromStart?: number; // rough estimate in minutes from first stop
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  color: string;
}

export const routes: Route[] = [
  {
    id: "285M",
    name: "Rajanukunte to Majestic",
    color: "#3b82f6",
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
    color: "#10b981",
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
    color: "#f59e0b",
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
    color: "#ef4444",
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
    color: "#ec4899",
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
    color: "#3b82f6",
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
    color: "#10b981",
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
    color: "#f59e0b",
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
    color: "#8b5cf6",
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
    color: "#ef4444",
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
    color: "#ec4899",
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
    color: "#06b6d4",
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
    color: "#3b82f6",
    stops: [
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 0 },
      { name: "MG Road", lat: 12.9756, lng: 77.6050, timeFromStart: 10 },
      { name: "Indiranagar", lat: 12.9719, lng: 77.6412, timeFromStart: 20 },
      { name: "Shivajinagar", lat: 12.9833, lng: 77.6033, timeFromStart: 30 },
      { name: "Majestic", lat: 12.9763, lng: 77.5712, timeFromStart: 40 }
    ]
  }
];

// Helper to calculate distance in km using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Find routes that have a stop near 'source' and a stop near 'dest' in the correct order.
export function findMatchingRoutes(sourceLat: number, sourceLng: number, destLat: number, destLng: number, maxDistanceKm = 5) {
  const matchingRoutes = [];

  for (const route of routes) {
    let sourceStopIndex = -1;
    let destStopIndex = -1;

    // Find closest stop to source
    let minSourceDist = maxDistanceKm;
    for (let i = 0; i < route.stops.length; i++) {
        const dist = getDistanceFromLatLonInKm(sourceLat, sourceLng, route.stops[i].lat, route.stops[i].lng);
        if (dist < minSourceDist) {
            minSourceDist = dist;
            sourceStopIndex = i;
        }
    }

    // Find closest stop to dest
    let minDestDist = maxDistanceKm;
    for (let i = 0; i < route.stops.length; i++) {
        const dist = getDistanceFromLatLonInKm(destLat, destLng, route.stops[i].lat, route.stops[i].lng);
        if (dist < minDestDist) {
            minDestDist = dist;
            destStopIndex = i;
        }
    }

    // A valid matching route must have both source and dest within range, 
    // AND the destination must come AFTER the source stop in the route direction.
    if (sourceStopIndex !== -1 && destStopIndex !== -1 && sourceStopIndex < destStopIndex) {
      matchingRoutes.push({
          route,
          sourceStop: route.stops[sourceStopIndex],
          destStop: route.stops[destStopIndex],
          stopsToTravel: destStopIndex - sourceStopIndex,
          estimatedDurationMins: (route.stops[destStopIndex].timeFromStart || 0) - (route.stops[sourceStopIndex].timeFromStart || 0)
      });
    }
  }

  return matchingRoutes;
}
