import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function ReadinessGauge({ score = 0, size = 180, label }) {
  const safeScore = Math.min(100, Math.max(0, score));
  
  // Color coding
  let color = '#DC2626'; // red
  if (safeScore >= 80) color = '#059669'; // emerald
  else if (safeScore >= 60) color = '#14B8A6'; // teal
  else if (safeScore >= 40) color = '#D97706'; // amber

  const data = [{ name: 'Readiness', value: safeScore, fill: color }];

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx={size / 2}
        cy={size / 2}
        innerRadius="75%"
        outerRadius="100%"
        barSize={size * 0.1}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        {/* Background track */}
        <RadialBar
          minAngle={15}
          background={{ fill: '#E5E5EA' }}
          clockWise
          dataKey="value"
          cornerRadius={size * 0.05}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-[#1D1D1F]">{safeScore}%</span>
        {label && <span className="text-sm font-medium text-[#6E6E73] mt-1">{label}</span>}
      </div>
    </div>
  );
}
