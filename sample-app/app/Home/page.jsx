"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@netpulse/dashboard"), { ssr: false });

export default function Home() {
  return <Dashboard />;
}
