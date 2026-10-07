"use client";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const roundedScore = Math.min(100, Math.max(0, Math.round(score)));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (roundedScore / 100) * circumference;

  let colorClass = "stroke-rose-500 text-rose-600";
  let label = "Needs Work";
  let badgeClass = "bg-rose-50 text-rose-700 border-rose-200";

  if (roundedScore >= 80) {
    colorClass = "stroke-emerald-500 text-emerald-600";
    label = "Interview Ready";
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (roundedScore >= 65) {
    colorClass = "stroke-blue-500 text-blue-600";
    label = "Strong Match";
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (roundedScore >= 50) {
    colorClass = "stroke-amber-500 text-amber-600";
    label = "Moderate Potential";
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
          />
          {/* Active Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">
            {roundedScore}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            out of 100
          </span>
        </div>
      </div>

      <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}>
        {label}
      </div>
    </div>
  );
}
