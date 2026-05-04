'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  GraduationCap,
  LineChart as LineChartIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SkillData {
  name: string;
  demand: number;
  growth: string;
  salary: string;
}

interface RoleData {
  name: string;
  growth: string;
  salary: string;
}

interface SalaryData {
  role: string;
  range: string;
  trend: string;
}

interface RemoteWorkData {
  metric: string;
  change: string;
  impact: string;
}

interface TrendSection {
  name: string;
  data: SkillData[] | RoleData[];
}

interface InsightSection {
  title: string;
  data: SalaryData[] | RemoteWorkData[];
}

interface CountryData {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  avgSalary: number;
  costOfLiving: number;
  candidatePool: number;
  remoteWorkAdoption: number;
  epfRate: number;
  epsRate: number;
  taxRate: number;
  exchangeRate: number;
}

const countries: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    avgSalary: 4800000,
    costOfLiving: 30,
    candidatePool: 15000000,
    remoteWorkAdoption: 75,
    epfRate: 3.67,
    epsRate: 8.33,
    taxRate: 32.5,
    exchangeRate: 80,
  },
  {
    name: 'United States',
    code: 'US',
    currency: 'USD',
    currencySymbol: '$',
    avgSalary: 120000,
    costOfLiving: 100,
    candidatePool: 23900000,
    remoteWorkAdoption: 58,
    epfRate: 0,
    epsRate: 0,
    taxRate: 25,
    exchangeRate: 1,
  },
];

const InsightsPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    countries[0]
  );

  // Country-specific insights data
  const stats = [
    {
      name: 'Tech Candidate Pool',
      value: `${(selectedCountry.candidatePool / 1000000).toFixed(1)}M`,
      icon: Users,
      change: '+8.5%',
      changeType: 'positive',
      description: `Active tech professionals in ${selectedCountry.name}`,
    },
    {
      name: 'Remote Work Adoption',
      value: `${selectedCountry.remoteWorkAdoption}%`,
      icon: Building2,
      change: '+12%',
      changeType: 'positive',
      description: 'Companies offering remote positions',
    },
    {
      name: 'Average Time to Hire',
      value: '42 days',
      icon: TrendingUp,
      change: '-5%',
      changeType: 'positive',
      description: 'Industry standard for tech roles',
    },
    {
      name: 'Cost of Living Index',
      value: selectedCountry.costOfLiving,
      icon: GraduationCap,
      change: '-3%',
      changeType: 'positive',
      description: 'Relative to US (100)',
    },
  ];

  const industryTrends: TrendSection[] = [
    {
      name: 'Most In-Demand Skills',
      data: [
        { name: 'AI/ML', demand: 89, growth: '+45%', salary: '140K' },
        { name: 'Cloud Computing', demand: 85, growth: '+38%', salary: '130K' },
        { name: 'Cybersecurity', demand: 82, growth: '+42%', salary: '150K' },
        { name: 'DevOps', demand: 78, growth: '+35%', salary: '135K' },
        { name: 'Full Stack', demand: 75, growth: '+30%', salary: '145K' },
      ] as SkillData[],
    },
    {
      name: 'Emerging Roles',
      data: [
        { name: 'AI Engineers', growth: '+65%', salary: '140K' },
        { name: 'Data Scientists', growth: '+55%', salary: '130K' },
        { name: 'Cloud Architects', growth: '+48%', salary: '150K' },
        { name: 'Security Engineers', growth: '+42%', salary: '135K' },
        { name: 'Blockchain Developers', growth: '+38%', salary: '145K' },
      ] as RoleData[],
    },
  ];

  const marketInsights: InsightSection[] = [
    {
      title: 'Salary Trends',
      data: [
        {
          role: 'Senior Software Engineer',
          range: '120K - 180K',
          trend: '+8%',
        },
        { role: 'Product Manager', range: '130K - 190K', trend: '+10%' },
        { role: 'Data Scientist', range: '110K - 170K', trend: '+12%' },
        { role: 'DevOps Engineer', range: '125K - 175K', trend: '+9%' },
      ] as SalaryData[],
    },
    {
      title: 'Remote Work Impact',
      data: [
        { metric: 'Productivity', change: '+15%', impact: 'positive' },
        { metric: 'Cost Savings', change: '25%', impact: 'positive' },
        {
          metric: 'Global Candidate Access',
          change: '+40%',
          impact: 'positive',
        },
        { metric: 'Employee Satisfaction', change: '+20%', impact: 'positive' },
      ] as RemoteWorkData[],
    },
  ];

  // Prepare data for charts
  const skillsChartData = (industryTrends[0].data as SkillData[]).map(
    (skill) => ({
      name: skill.name,
      demand: skill.demand,
      growth: parseInt(skill.growth.replace('+', '').replace('%', '')),
    })
  );

  const rolesChartData = (industryTrends[1].data as RoleData[]).map((role) => ({
    name: role.name,
    growth: parseInt(role.growth.replace('+', '').replace('%', '')),
  }));

  const salaryChartData = (marketInsights[0].data as SalaryData[]).map(
    (salary) => ({
      name: salary.role,
      trend: parseInt(salary.trend.replace('+', '').replace('%', '')),
    })
  );

  const remoteWorkChartData = (marketInsights[1].data as RemoteWorkData[]).map(
    (metric) => ({
      name: metric.metric,
      change: parseInt(metric.change.replace('+', '').replace('%', '')),
    })
  );

  return (
    <div className="container max-w-7xl px-4 py-4">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Candidate Market Insights
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Industry trends and market intelligence for tech candidate
              recruitment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(
                    (c) => c.code === e.target.value
                  );
                  if (country) setSelectedCountry(country);
                }}
                className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Skills Chart */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Most In-Demand Skills
                </h2>
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="demand"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                {(industryTrends[0].data as SkillData[]).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Avg. Salary: {selectedCountry.currencySymbol}
                          {(
                            Number(item.salary.replace(/[^0-9]/g, '')) *
                            selectedCountry.exchangeRate
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.growth} YoY
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Demand Score: {item.demand}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roles Chart */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Emerging Roles
                </h2>
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={rolesChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="growth"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                {(industryTrends[1].data as RoleData[]).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedCountry.currencySymbol}
                          {(
                            Number(item.salary.replace(/[^0-9]/g, '')) *
                            selectedCountry.exchangeRate
                          ).toLocaleString()}{' '}
                          {selectedCountry.currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.growth}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Trends */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Salary Trends
                </h2>
                <LineChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salaryChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="trend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                {(marketInsights[0].data as SalaryData[]).map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.role}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCountry.currencySymbol}
                        {(
                          Number(
                            item.range.split(' - ')[0].replace(/[^0-9]/g, '')
                          ) * selectedCountry.exchangeRate
                        ).toLocaleString()}{' '}
                        - {selectedCountry.currencySymbol}
                        {(
                          Number(
                            item.range.split(' - ')[1].replace(/[^0-9]/g, '')
                          ) * selectedCountry.exchangeRate
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remote Work Impact */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Remote Work Impact
                </h2>
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={remoteWorkChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="change"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {(marketInsights[1].data as RemoteWorkData[]).map((item) => (
                  <div
                    key={item.metric}
                    className="group relative rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.metric}
                      </h3>
                      <div className="mt-2 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <p className="ml-1 text-2xl font-bold text-gray-900 dark:text-white">
                          {item.change}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
