'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', placements: 4, interviews: 12, applications: 25 },
  { month: 'Feb', placements: 6, interviews: 18, applications: 32 },
  { month: 'Mar', placements: 8, interviews: 24, applications: 48 },
  { month: 'Apr', placements: 5, interviews: 15, applications: 30 },
  { month: 'May', placements: 7, interviews: 21, applications: 42 },
  { month: 'Jun', placements: 9, interviews: 27, applications: 54 },
];

export const ActivityChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="applications" fill="#8884d8" name="Applications" />
          <Bar dataKey="interviews" fill="#82ca9d" name="Interviews" />
          <Bar dataKey="placements" fill="#ffc658" name="Placements" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
