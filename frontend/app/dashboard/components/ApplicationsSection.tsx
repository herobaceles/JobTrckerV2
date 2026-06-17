"use client";

import { useState } from "react";
import { Job } from "../page";

// Extended interface properties to track salary and contextual milestones
export interface ExtendedJob extends Job {
  salary?: string;
  statusChangeDate?: string; 
}

interface ApplicationsProps {
  jobs: ExtendedJob[];
  isPreview?: boolean;
  onAddJob?: (newJobData: Omit<ExtendedJob, "id">) => Promise<void>;
  onUpdateJob?: (id: string, updatedFields: Partial<ExtendedJob>) => Promise<void>;
  onDeleteJob?: (id: string) => Promise<void>;
  onViewAll?: () => void;
}

export default function ApplicationsSection({ 
  jobs, 
  isPreview = false, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onViewAll
}: ApplicationsProps) {
  const [showForm, setShowForm] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [activeDeleteTarget, setActiveDeleteTarget] = useState<{ job: ExtendedJob; idx: number } | null>(null);
  
  // Inline row edit state tracking structures
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNextStep, setEditNextStep] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editStatusChangeDate, setEditStatusChangeDate] = useState("");

  // Form Field States
  const [company, setCompany] = useState("");
  const [role, setRole] = useState(""); 
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [salary, setSalary] = useState("");
  const [statusChangeDate, setStatusChangeDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return alert("Company and Position are required fields.");

    if (onAddJob) {
      await onAddJob({
        company,
        role,
        location,
        status,
        date: appliedDate || new Date().toISOString().split("T")[0],
        nextStep,
        salary,
        statusChangeDate: ["interview", "offer"].includes(status.toLowerCase()) ? statusChangeDate : ""
      });
    }

    setCompany("");
    setRole("");
    setLocation("");
    setStatus("Applied");
    setAppliedDate("");
    setNextStep("");
    setSalary("");
    setStatusChangeDate("");
    setShowForm(false);
  };

  const startEditing = (job: ExtendedJob) => {
    const currentId = job.id || (job as any)._id;
    setEditingId(currentId);
    setEditCompany(job.company);
    setEditRole(job.role);
    setEditLocation(job.location || "");
    setEditStatus(job.status);
    setEditDate(job.date || "");
    setEditNextStep(job.nextStep || "");
    setEditSalary(job.salary || "");
    setEditStatusChangeDate(job.statusChangeDate || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveUpdate = async (id: string) => {
    if (!editCompany || !editRole) return alert("Company and Position cannot be blank.");
    if (!onUpdateJob) return setEditingId(null);

    try {
      setIsUpdatingId(id);
      await onUpdateJob(id, {
        company: editCompany,
        role: editRole,
        location: editLocation,
        status: editStatus,
        date: editDate,
        nextStep: editNextStep,
        salary: editSalary,
        statusChangeDate: ["interview", "offer"].includes(editStatus.toLowerCase()) ? editStatusChangeDate : ""
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const openConfirmationModal = (job: ExtendedJob, idx: number) => {
    setActiveDeleteTarget({ job, idx });
  };

  const handleExecuteDelete = async () => {
    if (!activeDeleteTarget || !onDeleteJob) return;
    const targetId = activeDeleteTarget.job.id || (activeDeleteTarget.job as any)._id;

    if (!targetId) {
      setActiveDeleteTarget(null);
      return;
    }

    try {
      setIsDeletingId(targetId);
      setActiveDeleteTarget(null);
      await onDeleteJob(targetId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 space-y-6 relative border border-white text-black">
      
      {/* SECTION HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider">💼 Recent Applications</h3>
          <p className="text-xs text-black/60 mt-0.5">Track active recruitment pipelines</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isPreview && jobs.length > 0 && !showForm && (
  <button
    type="button"
    onClick={onViewAll} // This triggers the state change to the applications view!
    className="text-xs font-bold cursor-pointer underline hover:text-black uppercase bg-transparent border-none p-0"
  >
    View all
  </button>
)}
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 text-xs font-bold bg-black text-white hover:bg-white hover:text-black border border-white transition uppercase tracking-wide rounded-none"
          >
            {showForm ? "Cancel Entry" : "+ Add Application"}
          </button>
        </div>
      </div>

      {/* EXPANDABLE ENTRY FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-white p-4 space-y-4 rounded-none bg-white">
          <span className="text-[10px] font-bold tracking-wider uppercase block pb-1 border-b border-white">
            Log New Pipeline Record
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full text-xs p-2 bg-white text-black border border-white placeholder-black/40 focus:outline-none rounded-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Position *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full text-xs p-2 bg-white text-black border border-white placeholder-black/40 focus:outline-none rounded-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Salary / Compensation</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $140,000"
                className="w-full text-xs p-2 bg-white text-black border border-white placeholder-black/40 focus:outline-none rounded-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / New York, NY"
                className="w-full text-xs p-2 bg-white text-black border border-white placeholder-black/40 focus:outline-none rounded-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Date Applied</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full text-xs p-2 bg-white text-black border border-white focus:outline-none h-[34px] rounded-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Next Step</label>
              <input
                type="text"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="Prep for Tech Screen"
                className="w-full text-xs p-2 bg-white text-black border border-white placeholder-black/40 focus:outline-none rounded-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs p-2 bg-white text-black border border-white focus:outline-none h-[34px] rounded-none font-bold"
              >
                <option value="Applied">Applied</option>
                <option value="In Progress">In Progress</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* DYNAMICALLY CONDITIONAL MILESTONE DATE PICKER */}
            {["interview", "offer"].includes(status.toLowerCase()) && (
              <div className="animate-none">
                <label className="block text-[10px] font-bold uppercase tracking-wide mb-1 text-black">
                  {status.toLowerCase() === "interview" ? "Interview Target Date *" : "Offer Expiration Date *"}
                </label>
                <input
                  type="date"
                  value={statusChangeDate}
                  onChange={(e) => setStatusChangeDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white text-black border border-white focus:outline-none h-[34px] rounded-none font-semibold"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-black text-white hover:bg-white hover:text-black border border-white transition uppercase tracking-wider rounded-none"
            >
              Save Application
            </button>
          </div>
        </form>
      )}

      {/* APPLICATIONS TABLE / CONTAINER RESPONSIVE NODE */}
      {jobs.length === 0 ? (
        <div className="py-12 text-center border border-white border-dashed">
          <p className="text-sm font-medium">No job applications logged yet.</p>
          <p className="text-xs text-black/60 mt-1">Click "+ Add Application" above to sync your data profile.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          {/* Desktop Table View Layout Grid (Hidden on Mobile view sizes below SM break) */}
          <table className="w-full text-left text-xs text-black table-fixed border-collapse hidden sm:table">
            <thead className="text-[10px] uppercase font-bold bg-black text-white">
              <tr>
                <th className="p-2.5 w-[14%] border border-white">Company</th>
                <th className="p-2.5 w-[14%] border border-white">Position</th>
                <th className="p-2.5 w-[10%] border border-white">Salary</th>
                <th className="p-2.5 w-[12%] border border-white">Location</th>
                <th className="p-2.5 w-[10%] border border-white">Applied</th>
                <th className="p-2.5 w-[15%] border border-white">Next Step / Dates</th>
                <th className="p-2.5 w-[12%] border border-white">Status</th>
                <th className="p-2.5 w-[8%] text-right border border-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {jobs.slice(0, isPreview ? 4 : jobs.length).map((job, idx) => {
                const currentId = job.id || (job as any)._id;
                const isEditingThisRow = editingId === currentId;

                return (
                  <tr key={currentId || idx} className="hover:bg-black/5 text-xs transition-colors">
                    {isEditingThisRow ? (
                      <>
                        <td className="p-1 border border-white">
                          <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                        </td>
                        <td className="p-1 border border-white">
                          <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                        </td>
                        <td className="p-1 border border-white">
                          <input type="text" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                        </td>
                        <td className="p-1 border border-white">
                          <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                        </td>
                        <td className="p-1 border border-white">
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                        </td>
                        <td className="p-1 border border-white space-y-1">
                          <input type="text" value={editNextStep} onChange={(e) => setEditNextStep(e.target.value)} placeholder="Next milestone" className="w-full p-1 border border-white text-black bg-white text-xs focus:outline-none rounded-none" />
                          {["interview", "offer"].includes(editStatus.toLowerCase()) && (
                            <input type="date" value={editStatusChangeDate} onChange={(e) => setEditStatusChangeDate(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-[10px] focus:outline-none rounded-none font-bold" required />
                          )}
                        </td>
                        <td className="p-1 border border-white">
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-1 border border-white text-black bg-white text-xs font-bold focus:outline-none h-[28px] rounded-none">
                            <option value="Applied">Applied</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-1 border border-white text-center">
                          <div className="flex gap-2 justify-center">
                            <button type="button" onClick={() => handleSaveUpdate(currentId)} disabled={isUpdatingId === currentId} className="text-black font-black hover:underline">{isUpdatingId === currentId ? "..." : "✓"}</button>
                            <button type="button" onClick={cancelEditing} className="text-black hover:underline">✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2.5 font-bold truncate border border-white">{job.company}</td>
                        <td className="p-2.5 truncate border border-white">{job.role}</td>
                        <td className="p-2.5 truncate border border-white font-mono">{job.salary || "—"}</td>
                        <td className="p-2.5 truncate border border-white">{job.location || "—"}</td>
                        <td className="p-2.5 font-mono truncate border border-white">{job.date || "—"}</td>
                        <td className="p-2.5 border border-white truncate">
                          <div className="font-medium">{job.nextStep || "—"}</div>
                          {job.statusChangeDate && ["interview", "offer"].includes(job.status.toLowerCase()) && (
                            <div className="text-[10px] font-bold font-mono uppercase bg-black text-white p-0.5 mt-0.5 truncate">
                              {job.status.toLowerCase() === "interview" ? "📅 Slot: " : "⏰ Exp: "}{job.statusChangeDate}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 border border-white">
                          <span className="block text-center border border-white bg-white text-black font-mono font-bold uppercase text-[9px] px-1 py-0.5 rounded-none">
                            {job.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border border-white">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={() => startEditing(job)} className="text-black hover:bg-black hover:text-white p-1 border border-white" title="Edit row">
                              E
                            </button>
                            <button type="button" disabled={isDeletingId === currentId && !!currentId} onClick={() => openConfirmationModal(job, idx)} className="text-black hover:bg-black hover:text-white p-1 border border-white disabled:opacity-30" title="Delete row">
                              X
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* MOBILE RESPONSIVE BLOCK STACK DISPLAY (Visible only on Small/Mobile screens) */}
          <div className="block sm:hidden space-y-4">
            {jobs.slice(0, isPreview ? 4 : jobs.length).map((job, idx) => {
              const currentId = job.id || (job as any)._id;
              const isEditingThisRow = editingId === currentId;

              return (
                <div key={currentId || idx} className="border border-white p-4 space-y-3 bg-white">
                  {isEditingThisRow ? (
                    <div className="space-y-2">
                      <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} placeholder="Company" className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} placeholder="Role" className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      <input type="text" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} placeholder="Salary" className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Location" className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      <input type="text" value={editNextStep} onChange={(e) => setEditNextStep(e.target.value)} placeholder="Next Step" className="w-full p-2 border border-white text-xs rounded-none bg-white text-black" />
                      
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2 border border-white text-xs font-bold rounded-none bg-white text-black">
                        <option value="Applied">Applied</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      {["interview", "offer"].includes(editStatus.toLowerCase()) && (
                        <input type="date" value={editStatusChangeDate} onChange={(e) => setEditStatusChangeDate(e.target.value)} className="w-full p-2 border border-white text-xs font-bold rounded-none bg-white text-black" required />
                      )}

                      <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={() => handleSaveUpdate(currentId)} className="px-3 py-1 bg-black text-white border border-white text-xs font-bold rounded-none">Save</button>
                        <button type="button" onClick={cancelEditing} className="px-3 py-1 bg-white text-black border border-white text-xs font-bold rounded-none">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-start border-b border-white pb-1">
                        <div>
                          <p className="font-black text-sm uppercase">{job.company}</p>
                          <p className="font-semibold text-black/80">{job.role}</p>
                        </div>
                        <span className="border border-white bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-none uppercase">
                          {job.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1 gap-x-2 pt-2 text-[11px]">
                        <div><span className="font-bold uppercase text-[9px] text-black/50 block">Salary:</span> {job.salary || "—"}</div>
                        <div><span className="font-bold uppercase text-[9px] text-black/50 block">Location:</span> {job.location || "—"}</div>
                        <div><span className="font-bold uppercase text-[9px] text-black/50 block">Applied Date:</span> {job.date || "—"}</div>
                        <div><span className="font-bold uppercase text-[9px] text-black/50 block">Next Step:</span> {job.nextStep || "—"}</div>
                      </div>

                      {job.statusChangeDate && ["interview", "offer"].includes(job.status.toLowerCase()) && (
                        <div className="bg-black text-white font-mono text-[10px] p-2 font-bold uppercase mt-2">
                          {job.status.toLowerCase() === "interview" ? "📅 Interview Target Date: " : "⏰ Offer Expiration: "}
                          {job.statusChangeDate}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-white border-dashed mt-2">
                        <button type="button" onClick={() => startEditing(job)} className="px-2 py-1 text-[10px] font-bold border border-white uppercase rounded-none">Edit</button>
                        <button type="button" onClick={() => openConfirmationModal(job, idx)} className="px-2 py-1 text-[10px] font-bold bg-black text-white border border-white uppercase rounded-none">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFIRMATION OVERLAY MODAL */}
      {activeDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-white p-6 max-w-sm w-full mx-4 space-y-4 rounded-none text-black">
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-wider">Confirm Record Deletion</h4>
              <p className="text-xs leading-relaxed text-black/80">
                Are you absolutely sure you want to remove your tracking entry for <strong>{activeDeleteTarget.job.company}</strong>? This action is permanent.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveDeleteTarget(null)}
                className="px-3 py-1.5 text-xs font-bold border border-white hover:bg-black hover:text-white transition uppercase rounded-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-1.5 text-xs font-bold bg-black text-white hover:bg-white hover:text-black border border-white transition uppercase rounded-none"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}