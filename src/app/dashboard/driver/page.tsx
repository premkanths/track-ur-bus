"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, MapPin, Play, Square, LogOut, Clock, Wifi, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRoutes } from '@/context/RouteContext';
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/Map"), { ssr: false });
type GpsStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

export default function DriverDashboard() {
  const { profile, signOut } = useAuth();
  const { routes } = useRoutes();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const selectedRouteRef = useRef<string>('');
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) || null;

  useEffect(() => {
    selectedRouteRef.current = selectedRouteId;
  }, [selectedRouteId]);

  const updateLocation = async () => {
    if (!profile) return;
    const currentRoute = selectedRouteRef.current;
    if (!currentRoute) return;

    if ("geolocation" in navigator) {
      setGpsStatus('locating');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setGpsStatus('ready');

          try {
            const busRef = doc(db, 'buses', profile.uid);
            await setDoc(busRef, {
              driverId: profile.uid,
              driverName: profile.displayName || profile.email || 'Unnamed Driver',
              routeId: currentRoute,
              location: { lat: latitude, lng: longitude },
              updatedAt: new Date().toISOString(),
              status: 'active'
            }, { merge: true });
            
            setLastUpdate(new Date());
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setGpsStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
          toast({
            title: "GPS Error",
            description: "Could not retrieve your current location. Please check permissions.",
            variant: "destructive"
          });
          stopTracking();
        },
        { enableHighAccuracy: true }
      );
    } else {
      setGpsStatus('unsupported');
      toast({
        title: "Unsupported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      stopTracking();
    }
  };

  const startTracking = () => {
    if (!selectedRouteId) {
      toast({
        title: "Route Required",
        description: "Please select the route you are driving before starting.",
        variant: "destructive"
      });
      return;
    }
    setIsTracking(true);
    updateLocation();
    intervalRef.current = setInterval(updateLocation, 4000);
    toast({
      title: "Tracking Started",
      description: "Sharing live location on route: " + selectedRouteId,
    });
  };

  const stopTracking = async () => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (profile) {
      try {
        const busRef = doc(db, 'buses', profile.uid);
        await updateDoc(busRef, {
          status: 'inactive',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error stopping tracking:", error);
      }
    }
    
    toast({
      title: "Tracking Stopped",
      description: "Passengers can no longer see your live location.",
    });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const gpsMessage = {
    idle: 'GPS is idle until tracking starts.',
    locating: 'Trying to get your current GPS position...',
    ready: 'GPS connected and ready to share location.',
    denied: 'Location access denied. Allow GPS permission before starting tracking.',
    unsupported: 'Geolocation is not supported in this browser.',
    error: 'Could not retrieve your location. Try again in a better signal area.',
  }[gpsStatus];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bus className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LiveBus Driver</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        <Card className="shadow-lg border-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Driver Console</CardTitle>
                <CardDescription>Manage your bus trip visibility</CardDescription>
              </div>
              <Badge variant={isTracking ? "default" : "secondary"} className={isTracking ? "bg-green-600 hover:bg-green-600 text-white py-1 px-3" : "py-1 px-3"}>
                {isTracking ? "Tracking Active" : "Tracking Stopped"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
               <label className="text-sm font-semibold tracking-wide text-muted-foreground">SELECT SERVICING ROUTE</label>
               <Select onValueChange={setSelectedRouteId} value={selectedRouteId} disabled={isTracking}>
                 <SelectTrigger className="w-full h-12 text-lg">
                   <SelectValue placeholder="Choose your route..." />
                 </SelectTrigger>
                 <SelectContent>
                   {routes.map((route) => (
                     <SelectItem key={route.id} value={route.id}>
                       EXP-{route.id} ({route.name})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {selectedRoute && (
                 <div className="flex items-center gap-2 rounded-full border bg-zinc-50 px-3 py-2 w-fit">
                   <span className="h-3 w-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: selectedRoute.color || '#3b82f6' }} />
                   <span className="text-sm font-medium text-zinc-700">
                     EXP-{selectedRoute.id} | {selectedRoute.name}
                   </span>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Update
                </span>
                <p className="text-lg font-medium">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Connection
                </span>
                <p className="text-lg font-medium text-green-600">
                  {gpsStatus === 'ready' ? 'Reliable' : 'Waiting'}
                </p>
              </div>
            </div>

            <div className={`rounded-xl border px-4 py-3 text-sm ${
              gpsStatus === 'ready'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : gpsStatus === 'locating'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {gpsMessage}
            </div>

            {location && (
              <div className="bg-primary/5 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Coordinates</p>
                    <p className="font-mono text-sm font-semibold">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="h-[250px] w-full rounded-lg overflow-hidden border shadow-inner relative z-0">
                  <DynamicMap center={location} userLocation={location} />
                </div>
              </div>
            )}

            <div className="pt-4">
              {!isTracking ? (
                <Button 
                  onClick={startTracking} 
                  disabled={!selectedRouteId}
                  className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg disabled:opacity-50"
                >
                  <Play className="w-6 h-6 mr-3 fill-current" />
                  START TRACKING
                </Button>
              ) : (
                <Button 
                  onClick={stopTracking} 
                  variant="destructive"
                  className="w-full h-16 text-lg font-bold shadow-lg"
                >
                  <Square className="w-6 h-6 mr-3 fill-current" />
                  STOP TRACKING
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-accent/10 p-6 rounded-2xl border border-accent/20">
          <h3 className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Driver Guidelines
          </h3>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
            <li>Select the correct route before starting your trip.</li>
            <li>Ensure GPS is enabled on your device for accurate tracking.</li>
            <li>Stop tracking only when your shift is officially completed.</li>
            <li>Your location updates every 4 seconds for passenger reliability.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
