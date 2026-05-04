'use client';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import {
  Timer,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
} from '@/components/app/common/tables/saas-data-table';
import { useRouter } from 'next/navigation';
import { formatEnumValue } from '@/lib/utils';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const isStopped = (lastUpdatedAt: number) => {
  const now = Date.now();
  const lastUpdated = lastUpdatedAt ?? 0;
  const isStale = now - lastUpdated > 6000;
  return isStale;
};

interface CandidateTimer {
  duration: number;
  lastUpdatedAt: number;
  isDisconnected: boolean;
}

interface LiveAssessmentData {
  _id: string;
  candidateId: string;
  userName: string;
  userEmail: string;
  status: string;
  duration: number;
  lastUpdatedAt?: number;
  _creationTime: number;
  assessmentType: string;
}

export function LiveAssessmentsTab() {
  const router = useRouter();
  const [timers, setTimers] = useState<Record<string, CandidateTimer>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const lastDataRef = useRef<any>(null);

  // Live data query
  const liveData = useQuery(
    api.services.live_assessments.live_assessment_analytics.getAllLiveAnalytics,
    {
      limit: 100,
      status: 'CANDIDATE_ASSESSMENT_IN_PROGRESS',
      assessmentType: 'ONBOARDING_ASSESSMENT',
    }
  );

  useEffect(() => {
    if (!liveData) return;

    const now = Date.now();
    const newTimers: Record<string, CandidateTimer> = {};

    liveData.forEach((candidate) => {
      const key = candidate.candidateId;
      const isDisconnected = isStopped(candidate.lastUpdatedAt ?? 0);

      newTimers[key] = {
        duration: candidate.duration,
        lastUpdatedAt: candidate.lastUpdatedAt ?? now,
        isDisconnected,
      };
    });

    setTimers(newTimers);
    lastDataRef.current = liveData;
  }, [liveData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated: Record<string, CandidateTimer> = {};

        for (const [candidateId, timer] of Object.entries(prev)) {
          updated[candidateId] = {
            ...timer,
            isDisconnected: isStopped(timer.lastUpdatedAt),
          };
        }

        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Object.entries(timers).forEach(([candidateId, timer]) => {
      if (timerRefs.current[candidateId]) {
        clearInterval(timerRefs.current[candidateId]);
        delete timerRefs.current[candidateId];
      }

      if (!timer.isDisconnected) {
        timerRefs.current[candidateId] = setInterval(() => {
          setTimers((prev) => {
            const current = prev[candidateId];
            if (!current || current.isDisconnected) {
              return prev;
            }

            return {
              ...prev,
              [candidateId]: {
                ...current,
                duration: current.duration - 1,
              },
            };
          });
        }, 1000);
      }
    });

    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
      timerRefs.current = {};
    };
  }, [timers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, []);

  // Get status display
  const getStatusDisplay = (candidateId: string) => {
    const timer = timers[candidateId];
    if (!timer) return 'Live';

    if (timer.isDisconnected) return 'Disconnected';
    return 'Live';
  };

  const filteredLiveData = liveData?.filter((candidate) => {
    const timer = timers[candidate.candidateId];
    return timer && !timer.isDisconnected;
  });

  // Calculate live stats
  const liveCount = filteredLiveData?.length || 0;
  const onboardingCount =
    liveData?.filter(
      (candidate) => candidate.assessmentType === 'ONBOARDING_ASSESSMENT'
    ).length || 0;
  const jobAiAssessmentsCount =
    liveData?.filter(
      (candidate) => candidate.assessmentType === 'JOB_AI_ASSESSMENT'
    ).length || 0;
  const failedCount =
    liveData?.filter(
      (candidate) => candidate.status === 'CANDIDATE_ASSESSMENT_FAILED'
    ).length || 0;
  const onboardingCountToday =
    liveData?.filter((candidate) => {
      return (
        candidate.assessmentType === 'ONBOARDING_ASSESSMENT' &&
        new Date(candidate._creationTime).toDateString() ===
          new Date().toDateString()
      );
    }).length || 0;

  const liveStats = [
    {
      title: 'Active Sessions',
      value: liveCount,
      icon: <Zap className="h-5 w-5" />,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      change: null,
    },
    {
      title: 'Job AI Assessments',
      value: jobAiAssessmentsCount,
      icon: <BarChart3 className="h-5 w-5" />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: null,
    },
    {
      title: 'Screening Assessments',
      value: onboardingCount,
      icon: <CheckCircle className="h-5 w-5" />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: `+${onboardingCountToday} today`,
    },
    {
      title: 'Failed Sessions',
      value: failedCount,
      icon: <XCircle className="h-5 w-5" />,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      change: null,
    },
  ];

  // Table columns for live data
  const liveColumns: SaasTableColumn<LiveAssessmentData>[] = [
    {
      key: 'userName',
      label: 'Candidate',
      sortable: true,
      render: (row: LiveAssessmentData) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span className="text-xs font-medium">
              {row.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {row.userName}
            </p>
            <p className="truncate text-xs text-gray-500">{row.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (row: LiveAssessmentData) => {
        const timer = timers[row.candidateId];
        const currentDuration = timer ? timer.duration : row.duration;

        return (
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-100">
              <Timer className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-mono text-sm font-medium text-gray-900">
              {formatTime(currentDuration)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'assessmentType',
      label: 'Type',
      sortable: true,
      render: (row: LiveAssessmentData) => (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {formatEnumValue(row.assessmentType)}
        </span>
      ),
    },
    {
      key: '_creationTime',
      label: 'Started',
      sortable: true,
      render: (row: LiveAssessmentData) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-600">
            {new Date(row._creationTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: LiveAssessmentData) => {
        const status = getStatusDisplay(row.candidateId);

        return (
          <div className="flex items-center space-x-2">
            {status === 'Live' ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-green-700">Live</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-red-700">
                  Disconnected
                </span>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Table actions
  const actions: SaasTableAction<LiveAssessmentData>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: LiveAssessmentData) => {
        router.push(`/app/support/candidates/${row.candidateId}`);
      },
    },
  ];

  if (!liveData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
          <p className="mt-4 text-sm text-gray-600">
            Loading live analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {liveStats.map((stat) => (
          <Card
            key={stat.title}
            className="border border-gray-200 bg-white shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-xs text-gray-600">{stat.change}</p>
                  )}
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Data Table */}
      <SaasDataTable<LiveAssessmentData>
        columns={liveColumns}
        data={filteredLiveData as LiveAssessmentData[]}
        actions={actions}
        isLoading={false}
        searchable={true}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredLiveData?.length || 0,
          pageSize: filteredLiveData?.length || 0,
          onPageChange: () => {},
          onPageSizeChange: () => {},
          pageSizeOptions: [10, 20, 50, 100],
          sortBy: '_creationTime',
          sortOrder: 'desc',
          onSortChange: () => {},
        }}
        searchPlaceholder="Search candidates..."
        emptyState={{
          title: 'No active sessions',
          description:
            'Candidates will appear here when they start assessments',
        }}
        getRowKey={(row) => row._id}
        error={null}
        showToolbar={false}
      />
    </div>
  );
}
