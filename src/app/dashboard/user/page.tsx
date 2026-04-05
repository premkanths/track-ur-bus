"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, LogOut, Map as MapIcon, ArrowDownUp, Crosshair, Loader2, MapPinned, WifiOff, Clock3 } from 'lucide-react';
import { LocationSearchInput } from '@/components/LocationSearchInput';
import { GeocodingResult } from '@/lib/geocoding';
import { MatchingRoute, useRoutes } from '@/context/RouteContext';

interface BusData {
  id: string;
  driverId: string;
  driverName: string;
  routeId?: string;
  location: { lat: number; lng: number };
  updatedAt: string;
  status: string;
}

type GpsStatus = 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

const STALE_BUS_MS = 60_000;
const DynamicMap = dynamic(() => import("@/components/Map"), { ssr: false });

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatDistance(km: number) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function getFreshnessText(updatedAt: string, now: number) {
  const ageSeconds = Math.max(0, Math.round((now - new Date(updatedAt).getTime()) / 1000));
  if (ageSeconds < 5) return 'updated just now';
  if (ageSeconds < 60) return `updated ${ageSeconds}s ago`;
  const ageMinutes = Math.round(ageSeconds / 60);
  return `updated ${ageMinutes}m ago`;
}

export default function UserDashboard() {
  const { signOut } = useAuth();
  const { findMatchingRoutes, loading: routesLoading } = useRoutes();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [source, setSource] = useState<GeocodingResult | null>(null);
  const [dest, setDest] = useState<GeocodingResult | null>(null);
  const [matchingRoutes, setMatchingRoutes] = useState<MatchingRoute[]>([]);
  const [selectedRouteMeta, setSelectedRouteMeta] = useState<MatchingRoute | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.10, lng: 77.59 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('locating');
  const [focusKey, setFocusKey] = useState(0);
  const [hasAutoCentered, setHasAutoCentered] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'buses'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busList: BusData[] = [];
      snapshot.forEach((doc) => {
        busList.push({ id: doc.id, ...doc.data() } as BusData);
      });
      setBuses(busList);
      setBusesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('locating');
    setIsLocating(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setGpsStatus('ready');
        setIsLocating(false);

        setHasAutoCentered((prev) => {
          if (!prev) {
            setMapCenter(loc);
            setFocusKey((current) => current + 1);
            return true;
          }
          return prev;
        });
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation watch update missed:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          // Hardware/OS blocked. Try standard accuracy for background too.
          setGpsStatus('error');
        }
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const freshBuses = useMemo(
    () => buses.filter((bus) => now - new Date(bus.updatedAt).getTime() <= STALE_BUS_MS),
    [buses, now]
  );

  const locateUser = (isRetry = false) => {
    if (userLocation && !isRetry) {
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
      setFocusKey((current) => current + 1);
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported');
      return;
    }

    setIsLocating(true);
    setGpsStatus('locating');

    // On Windows PCs, High Accuracy often fails if no GPS chip exists.
    // Standard accuracy uses IP/WiFi and is much more reliable.
    const options = { 
      enableHighAccuracy: false, 
      timeout: 15000, 
      maximumAge: 0 
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        setHasAutoCentered(true);
        setFocusKey((current) => current + 1);
        setIsLocating(false);
        setGpsStatus('ready');
      },
      (error) => {
        console.warn("Geolocation manual fetch failed:", error.message);
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          setGpsStatus('error');
        }
      },
      options
    );
  };

  const handleSearch = () => {
    if (!source || !dest) return;
    const matches = findMatchingRoutes(source.lat, source.lng, dest.lat, dest.lng, 8);
    setMatchingRoutes(matches);
    setSelectedRouteMeta(null);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(dest);
    setDest(temp);
  };

  const handleRouteSelect = (routeMeta: MatchingRoute) => {
    setSelectedRouteMeta(routeMeta);
  };

  const getRouteInsights = (routeMeta: MatchingRoute) => {
    const routeBuses = freshBuses.filter((bus) => bus.routeId === routeMeta.route.id);
    const boardingReference = userLocation || source;
    const boardingDistanceKm = boardingReference
      ? getDistanceFromLatLonInKm(
          boardingReference.lat,
          boardingReference.lng,
          routeMeta.sourceStop.lat,
          routeMeta.sourceStop.lng
        )
      : 0;

    const nearestBus = routeBuses
      .map((bus) => ({
        bus,
        distanceKm: getDistanceFromLatLonInKm(
          bus.location.lat,
          bus.location.lng,
          routeMeta.sourceStop.lat,
          routeMeta.sourceStop.lng
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0] || null;

    return {
      routeBuses,
      boardingDistanceKm,
      nearestBus,
    };
  };

  const displayedBuses = selectedRouteMeta
    ? freshBuses.filter((bus) => bus.routeId === selectedRouteMeta.route.id)
    : freshBuses;

  const gpsMessage = {
    locating: 'Trying to locate you...',
    ready: userLocation ? 'Your live location is visible on the map.' : 'Location found.',
    denied: 'Location access denied. Please enable GPS in your browser.',
    unsupported: 'Geolocation is not supported in this browser.',
    error: 'Location unavailable. Please check your Windows Privacy settings.',
  }[gpsStatus];

  return (
    <div className="h-[100dvh] flex md:flex-row flex-col bg-background overflow-hidden relative">
      <div className="w-full md:w-[430px] h-[55dvh] md:h-full bg-white z-40 md:border-r shadow-2xl flex flex-col relative flex-shrink-0">
        <div className="p-4 bg-primary text-secondary flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Bus className="w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight">LiveBus</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-primary-foreground hover:bg-primary/80">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 bg-zinc-900 text-white shadow-md z-10 relative">
          <div className="flex bg-zinc-800 rounded-lg p-3 pt-4 pb-4">
            <div className="w-12 flex flex-col items-center justify-center gap-1 relative">
              <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
              <div className="w-[1px] h-8 bg-zinc-600 border-dashed border-l border-zinc-500"></div>
              <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500"></div>
            </div>

            <div className="flex-1 flex flex-col gap-3 mr-2">
              <LocationSearchInput
                placeholder="Enter Source..."
                onLocationSelect={setSource}
              />
              <hr className="border-t border-zinc-700" />
              <LocationSearchInput
                placeholder="Enter Destination..."
                onLocationSelect={setDest}
              />
            </div>

            <div className="w-10 flex items-center justify-center">
              <Button variant="ghost" size="icon" className="hover:bg-zinc-700 hover:text-white rounded-full bg-zinc-800 text-zinc-300" onClick={handleSwap}>
                <ArrowDownUp className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            gpsStatus === 'ready'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
              : gpsStatus === 'locating'
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-100'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-100'
          }`}>
            {gpsMessage}
          </div>

          <Button
            className="w-full mt-4 bg-green-600 hover:bg-green-700 font-bold text-md h-12 rounded-lg text-white"
            onClick={handleSearch}
            disabled={!source || !dest}
          >
            Find Buses
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 p-4">
          {(routesLoading || busesLoading) && (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {!routesLoading && !busesLoading && matchingRoutes.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {matchingRoutes.length} Route(s) Found
              </div>
              <div className="text-xs rounded-full bg-white border px-3 py-1 text-zinc-600">
                {freshBuses.length} live bus{freshBuses.length === 1 ? '' : 'es'}
              </div>
            </div>
          )}

          {!routesLoading && !busesLoading && matchingRoutes.length === 0 && source && dest && (
            <div className="text-center text-muted-foreground p-8 mt-10 bg-white border rounded-2xl">
              <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-zinc-700">No direct buses found</p>
              <p className="mt-1 text-sm">Try different nearby stops or use a wider route combination later.</p>
            </div>
          )}

          {!routesLoading && !busesLoading && (
            <div className="flex flex-col gap-3">
              {matchingRoutes.map((meta) => {
                const isActive = selectedRouteMeta?.route.id === meta.route.id;
                const insights = getRouteInsights(meta);

                return (
                  <Card
                    key={meta.route.id}
                    className={"p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md " + (isActive ? 'border-primary ring-1 ring-primary' : '')}
                    onClick={() => handleRouteSelect(meta)}
                  >
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div className="flex gap-2 items-center flex-wrap">
                        <div
                          className="font-bold px-2.5 py-1 rounded-md text-sm border text-white"
                          style={{ backgroundColor: meta.route.color || '#3b82f6', borderColor: meta.route.color || '#3b82f6' }}
                        >
                          EXP-{meta.route.id}
                        </div>
                        <div className="text-xs text-muted-foreground bg-zinc-100 px-2 py-1 rounded border">
                          Runs Daily
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{meta.estimatedDurationMins} min</div>
                        <div className="text-[10px] text-muted-foreground">Estimated</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm font-medium gap-2 text-foreground/80 my-3">
                      <div className="flex flex-col">
                        <span>{meta.sourceStop.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">Boarding Stop</span>
                      </div>
                      <span className="text-muted-foreground mx-1 flex-1 flex items-center">
                        <span className="h-[1px] w-full bg-zinc-300 mx-1"></span>
                        <span className="text-xs">→</span>
                      </span>
                      <div className="flex flex-col text-right">
                        <span>{meta.destStop.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">Drop Stop</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div className="rounded-lg bg-zinc-50 border p-3">
                        <div className="text-zinc-500 mb-1">Walk to boarding stop</div>
                        <div className="font-semibold text-zinc-800">
                          {formatDistance(insights.boardingDistanceKm)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-zinc-50 border p-3">
                        <div className="text-zinc-500 mb-1">Next nearest bus</div>
                        <div className="font-semibold text-zinc-800">
                          {insights.nearestBus ? formatDistance(insights.nearestBus.distanceKm) : 'No live bus'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-3 flex items-center justify-between border-t pt-3 gap-3">
                      <span className="flex items-center gap-1">
                        <Bus className="w-3 h-3" />
                        Active Buses: {insights.routeBuses.length}
                      </span>
                      <span className="text-blue-600 font-medium">
                        {insights.nearestBus ? getFreshnessText(insights.nearestBus.bus.updatedAt, now) : 'View Route →'}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {!routesLoading && !busesLoading && !source && !dest && (
            <div className="flex flex-col items-center justify-center p-8 mt-10">
              <div className="rounded-3xl bg-white border shadow-sm px-8 py-10 text-center max-w-sm">
                <MapIcon className="w-16 h-16 mb-4 text-muted-foreground mx-auto opacity-60" />
                <p className="text-center font-semibold text-zinc-800">Search for a route to get started.</p>
                <p className="text-sm text-muted-foreground mt-2">Add your source and destination to see direct buses, live route activity, and the nearest bus to your boarding stop.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden bg-muted/20 h-[45dvh] md:h-full">
        <div className="w-full h-full absolute inset-0 z-0">
          <DynamicMap
            buses={displayedBuses}
            center={mapCenter}
            route={selectedRouteMeta?.route || null}
            userLocation={userLocation}
            focusKey={focusKey}
          />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <Button
            variant="secondary"
            size="icon"
            className={`shadow-xl bg-white hover:bg-zinc-100 rounded-full w-12 h-12 border border-zinc-200 text-zinc-700 ${isLocating ? 'animate-pulse' : ''}`}
            onClick={() => locateUser()}
            title="Find My Location"
          >
            {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          </Button>
        </div>

        <div className="absolute top-6 left-6 z-20 hidden md:block">
          <div className="rounded-xl bg-white/95 shadow-xl border px-4 py-3 min-w-[230px]">
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Live Status</div>
            <div className="mt-2 text-sm font-medium text-zinc-800">{gpsMessage}</div>
            <div className="mt-2 text-xs text-zinc-500">
              Showing {displayedBuses.length} fresh bus{displayedBuses.length === 1 ? '' : 'es'} on the map
            </div>
          </div>
        </div>

        {selectedRouteMeta && (
          <div className="hidden md:block absolute bottom-6 right-6 z-20 w-[350px] pointer-events-none">
            <Card className="p-4 bg-zinc-900 text-white shadow-2xl border-none pointer-events-auto">
              <h3 className="font-bold text-sm mb-4 opacity-80 uppercase tracking-widest text-xs">Route Timeline</h3>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-zinc-700"></div>

                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-zinc-600 rounded-full z-10 flex-shrink-0 mt-1"></div>
                  <div>
                    <p className="text-sm font-medium">Walk to {selectedRouteMeta.sourceStop.name}</p>
                    <p className="text-xs text-zinc-400">
                      approx. {formatDistance(getRouteInsights(selectedRouteMeta).boardingDistanceKm)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-2">
                  <div className="w-4 h-4 rounded-full z-10 flex-shrink-0 mt-1 ring-4 ring-zinc-900" style={{ backgroundColor: selectedRouteMeta.route.color || '#3b82f6' }}></div>
                  <div>
                    <div
                      className="inline-flex px-2 py-0.5 rounded text-xs mb-1 font-bold text-white"
                      style={{ backgroundColor: selectedRouteMeta.route.color || '#3b82f6' }}
                    >
                      Board EXP-{selectedRouteMeta.route.id}
                    </div>
                    <p className="text-sm font-medium">Ride {selectedRouteMeta.stopsToTravel} stops</p>
                    <p className="text-xs text-zinc-400">{selectedRouteMeta.estimatedDurationMins} mins duration</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-zinc-600 rounded-full z-10 flex-shrink-0 mt-1"></div>
                  <div>
                    <p className="text-sm font-medium">Get down at {selectedRouteMeta.destStop.name}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
