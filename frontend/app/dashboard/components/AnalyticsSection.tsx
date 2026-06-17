"use client";

import { Job } from "../page";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon, TrendingUp, Award, Layers } from "lucide-react";

export default function AnalyticsSection({ jobs }: { jobs: Job[] }) {
  // 1. Calculate Core Pipeline Analytics Metrics
  const total = jobs.length;
  const interviews = jobs.filter(j => j.status.toLowerCase() === "interview").length;
  const offers = jobs.filter(j => j.status.toLowerCase() === "offer").length;
  const inProgress = jobs.filter(j => j.status.toLowerCase() === "in progress").length;
  const applied = jobs.filter(j => j.status.toLowerCase() === "applied").length;
  const rejected = jobs.filter(j => j.status.toLowerCase() === "rejected").length;

  const conversionRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : "0.0";
  const offerRate = total > 0 ? ((offers / total) * 100).toFixed(1) : "0.0";

  // 2. Filter out stages with 0 entries so the Pie Chart doesn't render invisible segments
  const chartData = [
    { name: "Applied", count: applied, color: "#3b82f6" },
    { name: "In Progress", count: inProgress, color: "#60a5fa" },
    { name: "Interview", count: interviews, color: "#d97706" },
    { name: "Offer", count: offers, color: "#10b981" },
    { name: "Rejected", count: rejected, color: "#ef4444" },
  ].filter(item => item.count > 0);

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-sm space-y-6">
      
      {/* CARD COMPONENT HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-black" /> Data Analytics Insights
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Visual structural breakdown of your pipeline distribution</p>
        </div>
      </div>

      {/* METRIC CARD INSIGHT SUB-GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 border border-gray-100 rounded-none flex items-center gap-3">
          <div className="p-2 bg-black text-white text-xs font-bold">∑</div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Logs</span>
            <span className="text-lg font-black text-gray-900">{total}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border border-gray-100 rounded-none flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700"><TrendingUp className="w-4 h-4" /></div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Interview Rate</span>
            <span className="text-lg font-black text-gray-900">{conversionRate}%</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-100 rounded-none flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700"><Award className="w-4 h-4" /></div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Offer Success</span>
            <span className="text-lg font-black text-gray-900">{offerRate}%</span>
          </div>
        </div>
      </div>

      {/* PIE CHART AND LEGEND CONTAINER SPLIT */}
      {total === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center border border-dashed border-gray-200 bg-gray-50/50 text-center p-4">
          <Layers className="w-6 h-6 text-gray-300 mb-2 stroke-[1.5]" />
          <p className="text-xs text-gray-400 font-medium">No system metrics profile data found.</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Add job entry tracking elements above to render chart scales.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-2">
          
          {/* RECHARTS PIE CANVAS */}
          <div className="w-48 h-48 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}  // 💡 Makes it a sleek Donut style. Set to 0 if you want a solid Pie.
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Minimalist central ratio layout display inside donut hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-gray-900">{total}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tracks</span>
            </div>
          </div>

          {/* DYNAMIC SIDE LEGEND LIST PANEL */}
          <div className="flex-1 w-full space-y-2 max-w-[240px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 font-mono">
              Status Allocation
            </span>
            {[
              { name: "Applied", count: applied, color: "bg-blue-500" },
              { name: "In Progress", count: inProgress, color: "bg-blue-400" },
              { name: "Interview", count: interviews, color: "bg-amber-600" },
              { name: "Offer", count: offers, color: "bg-emerald-500" },
              { name: "Rejected", count: rejected, color: "bg-red-500" },
            ].map((item) => {
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
              return (
                <div 
                  key={item.name} 
                  className={`flex items-center justify-between text-xs font-mono p-1.5 transition-colors ${
                    item.count > 0 ? "text-gray-700" : "text-gray-300 line-through opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 shrink-0 ${item.color}`} />
                    <span className="truncate font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-2 shrink-0">
                    <span className="font-bold text-gray-900">{item.count}</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}