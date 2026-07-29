"use client";

import * as React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-control border border-border bg-popover p-2.5 text-xs shadow-dropdown">
        <p className="font-semibold text-popover-foreground">{data.name}</p>
        <p className="text-muted-foreground">
          Amount: <span className="font-bold text-foreground">₹{Number(data.value).toLocaleString('en-IN')}</span>
        </p>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">
        No expense data recorded in this timeframe
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary)'} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
