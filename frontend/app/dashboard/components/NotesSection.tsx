"use client";

import { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  company: string;
  date: string;
  time?: string;
  notes?: string;
}

interface NotesSectionProps {
  events: CalendarEvent[]; // Passes your fetched calendar events down
  onAddCalendarEvent?: (event: { title: string; date: string; company: string; time: string; notes: string }) => Promise<void>;
}

export default function NotesSection({ events = [], onAddCalendarEvent }: NotesSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out normal job records to isolate only custom preparation notes
  const noteEvents = events.filter(e => e.company === "Interview Notes Note");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !message) {
      alert("Please fill out all fields before logging your note.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (onAddCalendarEvent) {
        await onAddCalendarEvent({
          title: title.startsWith("Prep:") ? title : `Prep: ${title}`,
          date: date,
          company: "Interview Notes Note",
          time: "All Day",
          notes: message // Maps safely to your newly updated Pydantic schema
        });
      }

      // Reset and collapse form view back to list layout view
      setTitle("");
      setDate("");
      setMessage("");
      setIsCreating(false);
    } catch (error) {
      console.error("Could not save interview note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 space-y-4">
      {/* SECTION HEADER BLOCK */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            📝 Interview Preparation Notes
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Draft your structural responses to behavioral questions or tech stacks here.
          </p>
        </div>

        {/* TOP LEVEL ACTION TOGGLE BUTTON */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-mono uppercase text-[10px] font-bold rounded transition-colors tracking-wider"
          >
            + Create Note
          </button>
        )}
      </div>

      {/* VIEW A: DYNAMIC INITIALIZATION INPUT FORM */}
      {isCreating ? (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 flex flex-col space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Topic / Title</label>
              <input
                type="text"
                placeholder="e.g., Amazon Leadership Principles, System Design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-black text-gray-800"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-black text-gray-800"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Preparation Log Message</label>
            <textarea
              rows={4}
              placeholder="Structure your STAR responses or stack architectures here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-3 text-xs border border-gray-200 rounded focus:outline-none focus:border-black text-gray-800 resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono uppercase text-[11px] font-bold rounded transition-all tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-mono uppercase text-[11px] font-bold rounded transition-all tracking-wider disabled:bg-gray-400"
            >
              {isSubmitting ? "Syncing..." : "💾 Save & Pin Note"}
            </button>
          </div>
        </form>
      ) : (
        /* VIEW B: ALREADY CREATED ARCHIVE LOG ENTRIES LIST */
        <div className="space-y-3">
          {noteEvents.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-100">
              No preparation notebooks logged yet. Click "+ Create Note" above to write one.
            </p>
          ) : (
            noteEvents.map((note) => (
              <div key={note.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-gray-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-xs uppercase font-mono tracking-wide">
                    {note.title.replace("Prep: ", "")}
                  </h4>
                  <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                    📅 {note.date}
                  </span>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {note.notes || "No extra summary logging detailed inside this file card."}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}