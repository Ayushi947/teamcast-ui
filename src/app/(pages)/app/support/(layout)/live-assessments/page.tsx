'use client';
import { useState } from 'react';
import { Activity } from 'lucide-react';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { LiveAssessmentsTab } from './components/live-assessments-tab';
import { HistoryAssessmentsTab } from './components/history-assessments-tab';

export default function LiveAssessmentsAnalytics() {
  const [activeTab, setActiveTab] = useState('live');

  const tabs = [
    {
      key: 'live',
      label: 'Live Assessments',
    },
    {
      key: 'history',
      label: 'Assessment History',
    },
  ];

  return (
    <div className="min-h-screen pb-10">
      <div className="bg-card mx-auto space-y-8 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow-sm">
              <Activity className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-primary text-2xl font-bold tracking-tight">
                Assessment Analytics
              </h1>
              <p className="text-sm text-gray-600">
                Monitor candidate assessments in real-time and view historical
                data
              </p>
            </div>
          </div>

          {activeTab === 'live' && (
            <div className="flex items-center space-x-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-gray-700">Live</span>
            </div>
          )}
        </div>

        {/* Custom Tabs */}
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-full"
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'live' && <LiveAssessmentsTab />}
          {activeTab === 'history' && <HistoryAssessmentsTab />}
        </div>
      </div>
    </div>
  );
}
