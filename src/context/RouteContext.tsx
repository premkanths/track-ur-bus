"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export interface MatchingRoute {
  route: Route;
  sourceStop: Stop;
  destStop: Stop;
  stopsToTravel: number;
  estimatedDurationMins: number;
}

interface RouteContextType {
  routes: Route[];
  loading: boolean;
  findMatchingRoutes: (sourceLat: number, sourceLng: number, destLat: number, destLng: number, maxDistanceKm?: number) => MatchingRoute[];
}

const RouteContext = createContext<RouteContextType>({
  routes: [],
  loading: true,
  findMatchingRoutes: () => [],
});

// Helper algorithms
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const RouteProvider = ({ children }: { children: React.ReactNode }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync routes from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'routes'), (snapshot) => {
      const activeRoutes: Route[] = [];
      snapshot.forEach(doc => {
        activeRoutes.push({ id: doc.id, ...doc.data() } as Route);
      });
      
      // Fallback local route if database is completely empty 
      if (activeRoutes.length === 0) {
        activeRoutes.push({
          id: "285M",
          name: "Rajanukunte → Majestic",
          color: "#3b82f6",
          stops: [
            { name: "Rajanukunte", lat: 13.17, lng: 77.57, timeFromStart: 0 },
            { name: "Yelahanka", lat: 13.10, lng: 77.59, timeFromStart: 15 },
            { name: "Hebbal", lat: 13.04, lng: 77.59, timeFromStart: 30 },
            { name: "Majestic", lat: 12.97, lng: 77.57, timeFromStart: 50 }
          ]
        });
      }
      setRoutes(activeRoutes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const findMatchingRoutes = (sourceLat: number, sourceLng: number, destLat: number, destLng: number, maxDistanceKm = 5): MatchingRoute[] => {
    const matchingRoutes: MatchingRoute[] = [];

    for (const route of routes) {
      let sourceStopIndex = -1;
      let destStopIndex = -1;

      let minSourceDist = maxDistanceKm;
      for (let i = 0; i < route.stops.length; i++) {
          const dist = getDistanceFromLatLonInKm(sourceLat, sourceLng, route.stops[i].lat, route.stops[i].lng);
          if (dist < minSourceDist) {
              minSourceDist = dist;
              sourceStopIndex = i;
          }
      }

      let minDestDist = maxDistanceKm;
      for (let i = 0; i < route.stops.length; i++) {
          const dist = getDistanceFromLatLonInKm(destLat, destLng, route.stops[i].lat, route.stops[i].lng);
          if (dist < minDestDist) {
              minDestDist = dist;
              destStopIndex = i;
          }
      }

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
  };

  return (
    <RouteContext.Provider value={{ routes, loading, findMatchingRoutes }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoutes = () => useContext(RouteContext);
