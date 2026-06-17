"use client";

import { useState } from "react";
import { CalendarEvent } from "../page";

interface MixedCalendarMarker {
  id: string;
  title: string;
  company: string;
  date: string;
  time?: string;
  markerType: "applied" | "interview" | "offer" | "general_event";
}

interface CalendarSectionProps {
  events: CalendarEvent[];
  jobs?: any[];
}

export default function CalendarSection({ events, jobs = [] }: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // ⚡ NEW: Tracks the selected date string (YYYY-MM-DD) for interactive clicks/taps
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDateStr(null); // Clear view filter on month change
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDateStr(null); // Clear view filter on month change
  };

  const allMarkers: MixedCalendarMarker[] = [
    // 1. Map general events
    ...events.map(e => {
      const isPrepNote = e.company === "Interview Notes Note";
      return {
        id: e.id,
        title: isPrepNote ? `📝 Prep: ${e.title.replace("Prep: ", "")}` : e.title,
        company: isPrepNote ? "Interview Preparation" : e.company,
        date: e.date,
        time: e.time || "All Day",
        markerType: (isPrepNote ? "interview" : "general_event") as "interview" | "general_event"
      };
    }),

    // 2. Generate markers from job pipeline
    ...jobs.reduce<MixedCalendarMarker[]>((acc, j) => {
      if (j.date) {
        acc.push({
          id: `${j.id || j._id}-applied`,
          title: `Logged Application (${j.role})`,
          company: j.company,
          date: j.date, 
          time: "All Day",
          markerType: "applied"
        });
      }

      const lowerStatus = j.status?.toLowerCase();
      if (["interview", "offer"].includes(lowerStatus) && j.statusChangeDate) {
        const displayTitle = lowerStatus === "offer"
          ? `🎉 Job Offer Received / Deadline (${j.role})`
          : `💥 Interview Stage Scheduled (${j.role})`;

        acc.push({
          id: `${j.id || j._id}-${lowerStatus}`,
          title: displayTitle,
          company: j.company,
          date: j.statusChangeDate, 
          time: "All Day",
          markerType: (lowerStatus === "offer" ? "offer" : "interview") as "offer" | "interview"
        });
      }

      return acc;
    }, [])
  ];

  // Helper to convert calendar day index into standard YYYY-MM-DD string
  const getDateString = (dayNum: number) => {
    const formattedDay = String(dayNum).padStart(2, "0");
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    return `${currentYear}-${formattedMonth}-${formattedDay}`;
  };

  const getDayMarkers = (dayNum: number) => {
    const targetDateString = getDateString(dayNum);
    return allMarkers.filter(m => m.date === targetDateString);
  };

  // ⚡ INTERACTIVE FILTERING LOGIC
  // If a user clicked/hovered a date, show ONLY that date's markers. Otherwise show all upcoming items.
  const displayedMarkers = selectedDateStr 
    ? allMarkers.filter(m => m.date === selectedDateStr)
    : allMarkers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-white p-6 space-y-6">
      
      {/* HEADER CONTROL SHELF */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          📅 {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="px-3 py-1 text-xs font-bold bg-gray-50 hover:bg-gray-100 transition rounded text-gray-600">←</button>
          <button onClick={handleNextMonth} className="px-3 py-1 text-xs font-bold bg-gray-50 hover:bg-gray-100 transition rounded text-gray-600">→</button>
        </div>
      </div>

      {/* WEEKDAY LABEL HEADERS */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold font-mono uppercase text-gray-400 pb-2">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      {/* DAY CALENDAR GRID BLOCKS */}
      <div className="grid grid-cols-7 gap-y-3 text-center text-xs font-medium">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const dayMarkers = getDayMarkers(dayNumber);
          const targetStr = getDateString(dayNumber);
          
          const hasInterviewsOrEvents = dayMarkers.some(m => m.markerType === "interview" || m.markerType === "offer" || m.markerType === "general_event");
          const hasApplicationsSent = dayMarkers.some(m => m.markerType === "applied");
          const isCurrentlySelected = selectedDateStr === targetStr;

          return (
            <button
              key={`day-${dayNumber}`}
              // ⚡ INTERACTIVE TRIGGER EVENTS: Touch, click, and desktop hover ready
              onClick={() => setSelectedDateStr(isCurrentlySelected ? null : targetStr)}
              onMouseEnter={() => setSelectedDateStr(targetStr)}
              className="relative py-1.5 flex flex-col items-center justify-center group select-none outline-none cursor-pointer"
            >
              {/* Day Number bubble badge style highlights */}
              <span className={`w-7 h-7 flex items-center justify-center text-[11px] rounded-full transition-all ${
                isCurrentlySelected 
                  ? "bg-black text-white font-black scale-105" 
                  : dayMarkers.length > 0 
                  ? "bg-gray-100 text-gray-900 font-bold group-hover:bg-gray-200" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                {dayNumber}
              </span>

              {/* MULTI-STATUS COLOR INDICATOR DOTS */}
              {dayMarkers.length > 0 && (
                <div className="-bottom-px absolute flex justify-center gap-0.5">
                  {hasInterviewsOrEvents && (
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                  )}
                  {hasApplicationsSent && (
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER INTERACTIVE AGENDA FEED LIST */}
      <div className="pt-4 space-y-3" onMouseLeave={() => setSelectedDateStr(null)}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
            {selectedDateStr ? `📅 Agenda for ${selectedDateStr}` : "Upcoming Agenda & Tracking Milestones"}
          </span>
          
          {/* ⚡ RESET CONTEXT FILTER CONSOLE */}
          {selectedDateStr && (
            <button 
              onClick={() => setSelectedDateStr(null)}
              className="text-[10px] text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              View All Milestones
            </button>
          )}
        </div>

        {displayedMarkers.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">
            {selectedDateStr 
              ? "No events logged for this specific day." 
              : "No scheduled activities or logs pinned across your data profile."}
          </p>
        ) : (
          displayedMarkers.map((marker) => (
            <div 
              key={marker.id} 
              className={`p-3 text-xs rounded-lg transition-all transform duration-150 ${
                marker.markerType === "offer"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-100"
                  : marker.markerType === "interview"
                  ? "bg-amber-50/70 text-amber-900"
                  : marker.markerType === "applied"
                  ? "bg-blue-50/60 text-blue-900"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{marker.company}</p>
                  <p className="text-gray-500 font-medium text-[11px] mt-0.5">{marker.title}</p>
                </div>
                <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap ml-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                  {marker.time || "All Day"}
                </span>
              </div>
              <p className="text-gray-400 mt-1.5 font-mono text-[10px]">{marker.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}