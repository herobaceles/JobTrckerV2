export type JobStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

<<<<<<< HEAD
export interface Job {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
  appliedDate: string;
  notes?: string;
  url?: string;
=======

export interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
  date: string; // Original applied date
  nextStep?: string;
  salary?: string;
  statusChangeDate?: string; // 🛠️ Make sure this is added here
>>>>>>> ea4caaf (Initial commit)
}