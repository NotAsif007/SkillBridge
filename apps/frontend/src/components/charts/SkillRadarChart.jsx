import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function SkillRadarChart({ breakdown }) {
  const defaultData = {
    technicalSkills: 0,
    assessmentPerformance: 0,
    projects: 0,
    resume: 0,
    interviewPerformance: 0,
    roadmapProgress: 0,
  };
  
  const data = breakdown || defaultData;
  
  const chartData = [
    { subject: 'Technical Skills', A: data.technicalSkills || 0 },
    { subject: 'Assessments', A: data.assessmentPerformance || 0 },
    { subject: 'Projects', A: data.projects || 0 },
    { subject: 'Resume', A: data.resume || 0 },
    { subject: 'Interviews', A: data.interviewPerformance || 0 },
    { subject: 'Roadmap', A: data.roadmapProgress || 0 },
  ];

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#E5E5EA" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#6E6E73', fontSize: 12 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Readiness"
            dataKey="A"
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.2}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
