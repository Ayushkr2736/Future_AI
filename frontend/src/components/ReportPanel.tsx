"use client";

import {
  Shield,
  TrendingUp,
  Flame,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Zap,
} from "lucide-react";
import type { AnalysisScores } from "@/types";

interface ReportPanelProps {
  scores: any; // Using any for flexibility during transition
}

function ScoreRing({
  value,
  label,
  icon: Icon,
  color,
  colorClass,
}: {
  value: number | null;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  colorClass: string;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset =
    value !== null ? circumference - (value / 100) * circumference : circumference;

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface-border"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={value !== null ? color : "transparent"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {value !== null ? (
            <>
              <span className="text-xl font-bold text-foreground">
                {value}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </>
          ) : (
            <span className="text-xs text-muted">—</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function RiskBadge({ level, probability }: { level: string | null; probability: number | null }) {
  const config = {
    low: {
      icon: CheckCircle,
      label: "Low Risk",
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    medium: {
      icon: AlertTriangle,
      label: "Medium Risk",
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    high: {
      icon: XCircle,
      label: "High Risk",
      color: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/20",
    },
  };

  if (!level) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-surface-border animate-fade-in flex-1">
        <Shield className="w-4 h-4 text-muted" />
        <span className="text-sm text-muted">
          Awaiting analysis...
        </span>
      </div>
    );
  }

  const lowerLevel = (level.toLowerCase() as "low" | "medium" | "high") || "low";
  const { icon: Icon, label, color, bg, border } = config[lowerLevel] || config.medium;

  return (
    <div className="flex items-stretch gap-2 animate-fade-in">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${bg} border ${border} flex-1`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className={`text-sm font-semibold ${color}`}>{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Risk Assessment
          </p>
        </div>
      </div>
      
      {probability !== null && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent-muted border border-accent/20">
          <TrendingUp className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-accent">{probability}%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Success</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPanel({ scores }: ReportPanelProps) {
  const hasData =
    scores.confidence !== null ||
    scores.motivation !== null ||
    scores.emotional_stability !== null ||
    scores.clarity !== null ||
    scores.riskLevel !== null ||
    scores.successProbability !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Live Analysis
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Real-time scoring
          </p>
        </div>
      </div>

      {/* Status */}
      {!hasData && (
        <div className="text-center py-8 animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-xl bg-surface border border-surface-border flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-muted opacity-40" />
          </div>
          <p className="text-xs text-muted-foreground">
            No data yet. Start a conversation
            <br />
            to begin analysis.
          </p>
        </div>
      )}

      {/* Score Rings Grid */}
      {hasData && (
        <div className="grid grid-cols-2 gap-4">
          <ScoreRing
            value={scores.confidence}
            label="Confidence"
            icon={Shield}
            color="#6d5df6"
            colorClass="text-accent"
          />
          <ScoreRing
            value={scores.motivation}
            label="Motivation"
            icon={Flame}
            color="#f59e0b"
            colorClass="text-warning"
          />
          <ScoreRing
            value={scores.emotional_stability}
            label="Stability"
            icon={Heart}
            color="#ef4444"
            colorClass="text-danger"
          />
          <ScoreRing
            value={scores.clarity}
            label="Clarity"
            icon={Zap}
            color="#3b82f6"
            colorClass="text-info"
          />
        </div>
      )}

      {/* Risk Level */}
      <RiskBadge level={scores.riskLevel} probability={scores.successProbability} />
    </div>
  );
}
