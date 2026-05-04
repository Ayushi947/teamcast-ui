'use client';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import {
  Timer,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Filter,
  Info,
} from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { useRouter } from 'next/navigation';
import { formatEnumValue } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface AssessmentHistoryData {
  _id: string;
  candidateId: string;
  userName: string;
  userEmail: string;
  status: string;
  duration: number;
  _creationTime: number;
  assessmentType: string;
  completedAt?: number;
}

// Chart data interfaces
interface AssessmentTypeData {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

interface DailyAssessmentData {
  date: string;
  assessments: number;
  completed: number;
  failed: number;
}

interface DurationDistributionData {
  range: string;
  count: number;
}

interface StatusTrendData {
  date: string;
  completed: number;
  failed: number;
  inProgress: number;
}

export function HistoryAssessmentsTab() {
  const router = useRouter();
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(20);
  const [historyTimeRange, setHistoryTimeRange] = useState('30d');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');

  // History data query using real Convex API (for table)
  const historyQueryResult = useQuery(
    api.services.live_assessments.live_assessment_analytics
      .getAssessmentHistory,
    {
      page: historyPage,
      pageSize: historyPageSize,
      status: historyStatusFilter === 'all' ? undefined : historyStatusFilter,
      assessmentType:
        historyTypeFilter === 'all' ? undefined : historyTypeFilter,
      timeRange: historyTimeRange,
    }
  );

  // Chart data query (no pagination for accurate charts)
  const chartDataQueryResult = useQuery(
    api.services.live_assessments.live_assessment_analytics
      .getAssessmentHistoryForCharts,
    {
      status: historyStatusFilter === 'all' ? undefined : historyStatusFilter,
      assessmentType:
        historyTypeFilter === 'all' ? undefined : historyTypeFilter,
      timeRange: historyTimeRange,
    }
  );

  const historyData =
    historyQueryResult?.data.filter((a) => a.userEmail !== 'Unknown') || [];
  const historyLoading = !historyQueryResult;
  const pagination = historyQueryResult?.pagination;

  // Use chart data for statistics and charts (all data, not just paginated)
  const chartData = chartDataQueryResult || [];

  // Calculate history stats using chart data (all data)
  const totalHistoryAssessments = chartData.length;
  const completedAssessments = chartData.filter(
    (a) => a.status === 'CANDIDATE_ASSESSMENT_COMPLETED'
  ).length;
  const failedAssessments = chartData.filter(
    (a) => a.status === 'CANDIDATE_ASSESSMENT_FAILED'
  ).length;
  const averageDuration =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, a) => sum + a.duration, 0) /
            chartData.length /
            60
        )
      : 0;

  // Prepare chart data using all data (not just paginated)
  const assessmentTypeData: AssessmentTypeData[] = [
    {
      name: 'Onboarding',
      value: chartData.filter(
        (a) => a.assessmentType === 'ONBOARDING_ASSESSMENT'
      ).length,
      color: '#3b82f6',
    },
    {
      name: 'Job AI',
      value: chartData.filter((a) => a.assessmentType === 'JOB_AI_ASSESSMENT')
        .length,
      color: '#10b981',
    },
  ];

  const dailyAssessmentData: DailyAssessmentData[] = Array.from(
    { length: 7 },
    (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dayAssessments = chartData.filter(
        (a) => new Date(a._creationTime).toDateString() === date.toDateString()
      );
      return {
        date: dateStr,
        assessments: dayAssessments.length,
        completed: dayAssessments.filter(
          (a) => a.status === 'CANDIDATE_ASSESSMENT_COMPLETED'
        ).length,
        failed: dayAssessments.filter(
          (a) => a.status === 'CANDIDATE_ASSESSMENT_FAILED'
        ).length,
      };
    }
  ).reverse();

  const durationDistributionData: DurationDistributionData[] = [
    {
      range: '0-30 min',
      count: chartData.filter((a) => a.duration <= 1800).length,
    },
    {
      range: '30-60 min',
      count: chartData.filter((a) => a.duration > 1800 && a.duration <= 3600)
        .length,
    },
    {
      range: '60-90 min',
      count: chartData.filter((a) => a.duration > 3600 && a.duration <= 5400)
        .length,
    },
    {
      range: '90+ min',
      count: chartData.filter((a) => a.duration > 5400).length,
    },
  ];

  const statusTrendData: StatusTrendData[] = Array.from(
    { length: 7 },
    (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dayAssessments = chartData.filter(
        (a) => new Date(a._creationTime).toDateString() === date.toDateString()
      );
      return {
        date: dateStr,
        completed: dayAssessments.filter(
          (a) => a.status === 'CANDIDATE_ASSESSMENT_COMPLETED'
        ).length,
        failed: dayAssessments.filter(
          (a) => a.status === 'CANDIDATE_ASSESSMENT_FAILED'
        ).length,
        inProgress: dayAssessments.filter(
          (a) => a.status === 'CANDIDATE_ASSESSMENT_IN_PROGRESS'
        ).length,
      };
    }
  ).reverse();

  const historyStats = [
    {
      title: 'Total Assessments',
      value: totalHistoryAssessments,
      icon: <BarChart3 className="h-5 w-5" />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: null,
    },
    {
      title: 'Completed',
      value: completedAssessments,
      icon: <CheckCircle className="h-5 w-5" />,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      change:
        totalHistoryAssessments > 0
          ? `${Math.round((completedAssessments / totalHistoryAssessments) * 100)}% success rate`
          : null,
    },
    {
      title: 'Failed',
      value: failedAssessments,
      icon: <XCircle className="h-5 w-5" />,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      change: null,
    },
    {
      title: 'Avg Duration',
      value: `${averageDuration} min`,
      icon: <Timer className="h-5 w-5" />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: null,
    },
  ];

  // Table columns for history data
  const historyColumns: SaasTableColumn<AssessmentHistoryData>[] = [
    {
      key: 'userName',
      label: 'Candidate',
      sortable: true,
      render: (row: AssessmentHistoryData) => (
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
      render: (row: AssessmentHistoryData) => (
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-100">
            <Timer className="h-4 w-4 text-gray-600" />
          </div>
          <span className="font-mono text-sm font-medium text-gray-900">
            {formatTime(row.duration)}
          </span>
        </div>
      ),
    },
    {
      key: 'assessmentType',
      label: 'Type',
      sortable: true,
      render: (row: AssessmentHistoryData) => (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {formatEnumValue(row.assessmentType)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: AssessmentHistoryData) => {
        const isCompleted = row.status === 'CANDIDATE_ASSESSMENT_COMPLETED';
        const isFailed = row.status === 'CANDIDATE_ASSESSMENT_FAILED';

        return (
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-green-700">
                  Completed
                </span>
              </>
            ) : isFailed ? (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-red-700">Failed</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs font-medium text-yellow-700">
                  In Progress
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      key: '_creationTime',
      label: 'Started',
      sortable: true,
      render: (row: AssessmentHistoryData) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
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
  ];

  // Table actions
  const actions: SaasTableAction<AssessmentHistoryData>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: AssessmentHistoryData) => {
        router.push(`/app/support/candidates/${row.candidateId}`);
      },
    },
  ];

  const handlePageSizeChange = (pageSize: number) => {
    setHistoryPageSize(pageSize);
    setHistoryPage(1);
  };

  // Pagination configuration for history
  const historyPagination: SaasPaginationInfo = {
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.totalItems || 0,
    pageSize: pagination?.pageSize || 10,
    onPageChange: setHistoryPage,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions: [10, 20, 50, 100],
    sortBy: '_creationTime',
    sortOrder: 'desc',
    onSortChange: () => {},
  };

  return (
    <div className="space-y-6">
      {/* History Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <Select value={historyTimeRange} onValueChange={setHistoryTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={historyStatusFilter}
          onValueChange={setHistoryStatusFilter}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="CANDIDATE_ASSESSMENT_COMPLETED">
              Completed
            </SelectItem>
            <SelectItem value="CANDIDATE_ASSESSMENT_FAILED">Failed</SelectItem>
            <SelectItem value="CANDIDATE_ASSESSMENT_IN_PROGRESS">
              In Progress
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ONBOARDING_ASSESSMENT">Onboarding</SelectItem>
            <SelectItem value="JOB_AI_ASSESSMENT">Job AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {historyStats.map((stat) => (
          <Card
            key={stat.title}
            className="border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
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
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Types Distribution */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Assessment Types
                </h3>
                <p className="text-sm text-gray-600">Distribution by type</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assessmentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent as number) * 100).toFixed(0)}%`
                    }
                  >
                    {assessmentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Assessment Trends */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Daily Trends
                </h3>
                <p className="text-sm text-gray-600">
                  Assessment activity over time
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyAssessmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="assessments"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Duration Distribution */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Duration Distribution
                </h3>
                <p className="text-sm text-gray-600">
                  Time spent on assessments
                </p>
              </div>
              <Timer className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Trends */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Status Trends
                </h3>
                <p className="text-sm text-gray-600">
                  Assessment completion rates
                </p>
              </div>
              <Activity className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-start gap-2">
          <Info className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Unknown Users are not displayed in the table so results in each page
            may vary.
          </span>
        </div>
        {/* History Data Table */}
        <SaasDataTable<AssessmentHistoryData>
          columns={historyColumns}
          data={historyData}
          actions={actions}
          isLoading={historyLoading}
          searchable={true}
          pagination={historyPagination}
          searchPlaceholder="Search assessment history..."
          emptyState={{
            title: 'No assessment history',
            description:
              'Assessment history will appear here once candidates complete assessments',
          }}
          getRowKey={(row) => row._id}
          error={null}
          showToolbar={false}
        />
      </div>
    </div>
  );
}
