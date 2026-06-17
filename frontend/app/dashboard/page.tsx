"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Bell, 
  Sparkles,
  BarChart3,
  FileText,
  User,
  Layers,
  LogOut,
  Menu,
  X
} from "lucide-react";

// Modular Component Section Imports
import ApplicationsSection from "./components/ApplicationsSection";
import CalendarSection from "./components/CalendarSection";
import NotesSection from "./components/NotesSection";
import AnalyticsSection from "./components/AnalyticsSection";

export interface Job {
  id?: string;
  company: string;
  role: string;
  status: string;
  date: string;
  location?: string;
  nextStep?: string;
  salary?: string;
  statusChangeDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  company: string;
  date: string;
  time: string;
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState<Job[]>([]);
  
  // ⚡ FIXED: Unified calendar data stream to 'events' state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const currentUserId = session?.user ? (session.user as any).id : null;

  // 1. FETCH DATA CYCLE (Twin pipeline for jobs and custom notes)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && currentUserId) {
      // Stream A: Pull Applications
      fetch(`${API_BASE_URL}/api/applications`, {
        method: "GET",
        headers: { "X-User-Id": currentUserId },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Could not pull historical database records.");
          return res.json();
        })
        .then((data) => setApplications(data))
        .catch((err) => console.error("Database connections failure:", err));

      // ⚡ FIXED: Stream B: Pull standalone calendar notes on refresh
      fetch(`${API_BASE_URL}/api/events`, {
        method: "GET",
        headers: { "X-User-Id": currentUserId },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Could not pull calendar events.");
          return res.json();
        })
        .then((data) => setEvents(data))
        .catch((err) => console.error("Calendar data stream failure:", err));
    }
  }, [status, router, currentUserId]);

  // 2. BACKEND MUTATION HANDLERS
  const handleAddJob = async (newJobData: Omit<Job, "id">) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": currentUserId || "" 
        },
        body: JSON.stringify(newJobData),
      });
      if (!response.ok) throw new Error("Failed to add job record");
      const savedJob = await response.json();
      setApplications((prev) => [savedJob, ...prev]);
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  const handleUpdateJob = async (id: string, updatedFields: Partial<Job>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": currentUserId || ""
        },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error("Failed to update job record");
      const updatedJob = await response.json();
      setApplications((prev) => prev.map((j) => ((j.id || (j as any)._id) === id ? updatedJob : j)));
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: "DELETE",
        headers: { "X-User-Id": currentUserId || "" },
      });
      if (!response.ok) throw new Error("Delete failed");
      setApplications((prev) => prev.filter((job) => job.id !== id && (job as any)._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEvent = async (newEvent: { title: string; date: string; company: string; time: string; notes: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUserId || ""
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) throw new Error("Failed to sync new event metadata.");
      const savedEvent = await response.json();
      setEvents((prev) => [...prev, savedEvent]);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const metrics = {
    total: applications.length,
    interviews: applications.filter((j) => j.status?.toLowerCase() === "interview").length,
    inProgress: applications.filter((j) => j.status?.toLowerCase() === "in progress").length,
    offers: applications.filter((j) => j.status?.toLowerCase() === "offer").length,
  };

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: <Layers className="w-4 h-4" /> },
    { id: "applications", name: "Applications", icon: <Briefcase className="w-4 h-4" /> },
    { id: "calendar", name: "Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
    { id: "notes", name: "Notes", icon: <FileText className="w-4 h-4" /> },
    { id: "analytics", name: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-bold text-black tracking-wider uppercase animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row font-sans selection:bg-black selection:text-white">
      
      {/* MOBILE NAVIGATION BAR HEADER */}
      <div className="flex items-center justify-between bg-white border-b border-black px-5 py-4 md:hidden w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black text-white rounded-none flex items-center justify-center font-black text-sm">J</div>
          <span className="font-bold text-base tracking-tight text-black">JobTracker</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-black hover:text-white transition text-black">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/10 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed top-[61px] bottom-0 left-0 z-40 w-64 bg-white text-black p-5 transition-transform transform 
        md:translate-x-0 md:static md:top-0 h-[calc(100vh-61px)] md:h-screen flex flex-col justify-between border-r border-black
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="space-y-7">
          <div className="hidden md:flex items-center gap-3 px-2 pt-2">
            <div className="w-8 h-8 bg-black text-white rounded-none flex items-center justify-center font-black text-base">J</div>
            <div>
              <h2 className="text-base font-bold text-black tracking-tight leading-none">JobTracker</h2>
              <span className="text-[10px] text-black font-medium tracking-wider uppercase mt-1 block">v2.1.0 Core</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-none transition text-left ${
                    isActive ? "bg-black text-white" : "hover:bg-black hover:text-white text-black"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-black">
          <div className="border border-white p-4 rounded-none hidden md:block">
            <div className="flex items-center gap-2 text-black text-[10px] font-bold tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3" /> Stay Organized
            </div>
            <p className="text-[11px] text-black leading-relaxed">Track metrics across loops automatically.</p>
          </div>

          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 bg-white rounded-none border border-black flex items-center justify-center text-black font-bold text-xs shrink-0">
                {session?.user?.name ? session.user.name[0] : <User className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-black truncate leading-none mb-1">{session?.user?.name || "Job Hunter"}</p>
                <p className="text-[10px] text-black truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 text-black hover:bg-black hover:text-white transition shrink-0" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN SCREEN SWITCHBOARD */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen p-5 md:p-8 space-y-8 bg-white">
        <div className="flex items-center justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">Hi!, {session?.user?.name?.split(" ")[0] || "Hunter"}! 👋</h1>
            <p className="text-xs text-black mt-0.5">Here's what's happening with your job search today.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* for future na tinatamad pako maglagay notif */}
            {/* <button className="p-2 bg-white border border-black text-black transition relative rounded-none">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-black" />
            </button> */} 
          </div>
        </div>

        {(() => {
          switch (activeTab) {
            case "dashboard":
              return (
                <div className="space-y-6">
                  {/* Cards Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Applications</span>
                        <span className="text-2xl font-black text-black block mt-1.5">{metrics.total}</span>
                      </div>
                      <div className="p-3 text-black"><Briefcase className="w-5 h-5 stroke-[2.2]" /></div>
                    </div>
                    <div className="bg-white p-5 border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Interviews</span>
                        <span className="text-2xl font-black text-black block mt-1.5">{metrics.interviews}</span>
                      </div>
                      <div className="p-3 text-black"><CheckCircle2 className="w-5 h-5 stroke-[2.2]" /></div>
                    </div>
                    <div className="bg-white p-5 border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">In Progress</span>
                        <span className="text-2xl font-black text-black block mt-1.5">{metrics.inProgress}</span>
                      </div>
                      <div className="p-3 text-black"><Clock className="w-5 h-5 stroke-[2.2]" /></div>
                    </div>
                    <div className="bg-white p-5 border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Offers Secured</span>
                        <span className="text-2xl font-black text-black block mt-1.5">{metrics.offers}</span>
                      </div>
                      <div className="p-3 text-black"><Sparkles className="w-5 h-5 stroke-[2.2]" /></div>
                    </div>
                  </div>

                  {/* Splits Grid Layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-2 space-y-6">
                      <ApplicationsSection 
                        jobs={applications} 
                        isPreview={true} 
                        onAddJob={handleAddJob} 
                        onDeleteJob={handleDeleteJob} 
                        onUpdateJob={handleUpdateJob} 
                        onViewAll={() => setActiveTab("applications")}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnalyticsSection jobs={applications} />
                        {/* ⚡ FIXED: Added correct variables mapping */}
                        <NotesSection events={events} onAddCalendarEvent={handleAddEvent} />
                      </div>
                    </div>
                    <div className="xl:col-span-1">
                      {/* ⚡ FIXED: Bound calendar directly to unified events state hook variable */}
                      <CalendarSection events={events} jobs={applications} />
                    </div>
                  </div>
                </div>
              );
              
            case "applications":
              return (
                <ApplicationsSection 
                  jobs={applications} 
                  isPreview={false} 
                  onAddJob={handleAddJob} 
                  onDeleteJob={handleDeleteJob} 
                  onUpdateJob={handleUpdateJob} 
                />
              );
              
            case "calendar":
              {/* ⚡ FIXED: Synced parameters when accessing full calendar workspace layout */}
              return <CalendarSection events={events} jobs={applications} />;
              
            case "notes":
              {/* ⚡ FIXED: Allowed users to log notes from the dedicated notebook sub-section panel */}
              return <NotesSection events={events} onAddCalendarEvent={handleAddEvent} />;
              
            case "analytics":
              return <AnalyticsSection jobs={applications} />;
              
            default:
              return null;
          }
        })()}
      </main>
    </div>
  );
}