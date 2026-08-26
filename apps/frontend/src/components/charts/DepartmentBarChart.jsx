import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DepartmentBarChart({ departments = [] }) {
  const chartHeight = Math.max(200, departments.length * 48);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={departments}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA" />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tick={{ fill: '#6E6E73', fontSize: 12 }}
            axisLine={{ stroke: '#E5E5EA' }}
            tickLine={false}
          />
          <YAxis 
            dataKey="department" 
            type="category" 
            tick={{ fill: '#6E6E73', fontSize: 12 }}
            axisLine={{ stroke: '#E5E5EA' }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F5F5F7' }}
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E5E5EA',
              borderRadius: '8px',
              color: '#1D1D1F'
            }}
            formatter={(value, name, props) => {
              if (name === 'avgReadiness') return [`${value}%`, 'Avg Readiness'];
              return [value, name];
            }}
          />
          <Bar 
            dataKey="avgReadiness" 
            fill="#059669" 
            radius={[0, 4, 4, 0]} 
            barSize={24} 
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
