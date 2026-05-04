'use client';

import React, { useState } from 'react';
import { KpisFilters } from './kpis-filters';
import { KpisOverview } from './kpis-overview';
import { KpisDetailedStats } from './kpis-detailed-stats';

export const KpisDashboard = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endDate: new Date().toISOString(),
    filterBy: 'all',
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      <KpisFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <KpisOverview filters={filters} />
      <KpisDetailedStats filters={filters} />
    </div>
  );
};
