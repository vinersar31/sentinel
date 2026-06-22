"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ServiceStatus } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Server, Activity, ServerCrash, Clock } from "lucide-react";

const MOCK_DATA: ServiceStatus[] = [
  {
    id: "1",
    name: "Home Router",
    type: "network",
    status: "UP",
    latencyMs: 12,
    lastChecked: Date.now() - 30000,
  },
  {
    id: "2",
    name: "Pi-hole DNS",
    type: "container",
    status: "UP",
    latencyMs: 5,
    lastChecked: Date.now() - 45000,
  },
  {
    id: "3",
    name: "Plex Media Server",
    type: "container",
    status: "DOWN",
    latencyMs: 0,
    lastChecked: Date.now() - 120000,
  },
  {
    id: "4",
    name: "NAS Storage",
    type: "hardware",
    status: "UP",
    latencyMs: 25,
    lastChecked: Date.now() - 60000,
  },
];

export default function Dashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "infrastructure"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceStatus[];

        if (data.length > 0) {
          setServices(data);
        } else {
          // Fallback to mock data if empty
          setServices(MOCK_DATA);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching infrastructure data:", error);
        // Fallback to mock data on error
        setServices(MOCK_DATA);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const hasOutage = services.some((s) => s.status === "DOWN");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-blue-500" />
          <p className="text-gray-400">Initializing Sentinel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-500" />
              Sentinel
            </h1>
            <p className="text-gray-400 mt-1">Local Infrastructure Monitoring</p>
          </div>

          <div
            className={`px-6 py-3 rounded-full flex items-center gap-3 font-medium border ${
              hasOutage
                ? "bg-red-950/30 border-red-900/50 text-red-400"
                : "bg-green-950/30 border-green-900/50 text-green-400"
            }`}
          >
            {hasOutage ? (
              <>
                <ServerCrash className="w-5 h-5" />
                <span>Outage Detected</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>All Systems Operational</span>
              </>
            )}
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-gray-700 transition-colors flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-100 truncate pr-2">
                    {service.name}
                  </h2>
                  <div className="relative flex items-center justify-center shrink-0 w-4 h-4 mt-1">
                    {service.status === "UP" ? (
                      <>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-300 capitalize">{service.type}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Latency</span>
                    <span className="text-gray-300 font-mono">
                      {service.latencyMs > 0 ? `${service.latencyMs}ms` : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last checked</span>
                    </div>
                    <span>
                      {formatDistanceToNow(service.lastChecked, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
