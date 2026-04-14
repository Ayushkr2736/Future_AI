"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { fetchDashboardData } from "@/lib/api";
import type { Session } from "@/types";

function RiskDot({ level }: { level: "low" | "medium" | "high" }) {
  const colors = {
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-danger",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[level]}`} />;
}

function SessionCard({ session, index }: { session: Session; index: number }) {
  return (
    <div
      className="glass rounded-xl p-4 hover:bg-surface-hover transition-all duration-200 animate-slide-up cursor-default"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{session.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RiskDot level={session.riskLevel} />
          <span className="text-[11px] text-muted-foreground capitalize">
            {session.riskLevel}
          </span>
        </div>
      </div>
      <p className="text-sm text-foreground mb-3 line-clamp-2">
        {session.summary}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted" />
          <span className="text-xs text-muted-foreground">
            {session.duration}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-accent" />
          <span className="text-xs text-accent">
            {session.successProbability}%
          </span>
        </div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-accent">
        {payload[0].value}%
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartData, setChartData] = useState<
    { date: string; probability: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboardData();
        setSessions(data.sessions);
        setChartData(data.successHistory);
      } catch {
        setError("Backend not connected. No session data available.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your analysis sessions and performance over time.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      )}

      {/* Error / Empty state */}
      {!isLoading && error && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface border border-surface-border flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-muted opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">{error}</p>
          <p className="text-xs text-muted">
            Connect your backend API to view session history.
          </p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Success Probability Over Time
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5df6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6d5df6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(63,63,70,0.4)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#6d5df6"
                  strokeWidth={2}
                  fill="url(#colorProb)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#6d5df6",
                    stroke: "#18181b",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sessions */}
      {!isLoading && !error && sessions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Past Sessions
            </h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {sessions.length} total
            </span>
          </div>
          <div className="grid gap-3">
            {sessions.map((session, i) => (
              <SessionCard key={session.id} session={session} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty – no error, no data */}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface border border-surface-border flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-muted opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No sessions yet</p>
          <p className="text-xs text-muted">
            Complete an analysis session to see data here.
          </p>
        </div>
      )}
    </div>
  );
}
