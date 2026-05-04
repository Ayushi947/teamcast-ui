'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Users, Briefcase, AlertCircle } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
} from '@/components/app/common/tables/saas-data-table';
import { supportClientManagementService } from '@/lib/services/services';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface JobPostingsTabProps {
  clientId: string;
  isActive?: boolean;
}

interface JobPosting {
  id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  status: string;
  postedDate: string;
  applications?: any;
  description?: string;
}

export function JobPostingsTab({
  clientId,
  isActive = false,
}: JobPostingsTabProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: jobPostingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'support-client-job-postings',
      clientId,
      page,
      pageSize,
      debouncedSearch,
    ],
    queryFn: async () => {
      logger.info('Fetching job postings for client:', clientId);
      return await supportClientManagementService.listSupportClientJobPostings(
        clientId,
        {
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
        }
      );
    },
    enabled: !!clientId && isActive,
  });

  // Reset page when tab becomes active
  useEffect(() => {
    if (isActive) {
      setPage(1);
    }
  }, [isActive]);

  const columns: SaasTableColumn<JobPosting>[] = [
    {
      key: 'title',
      label: 'Job Title',
      sortable: true,
      render: (jobPosting) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{jobPosting.title}</div>
            {jobPosting.department && (
              <div className="text-sm text-gray-500">
                {jobPosting.department}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (jobPosting) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{jobPosting.location || 'Remote'}</span>
        </div>
      ),
    },
    {
      key: 'employmentType',
      label: 'Type',
      render: (jobPosting) => (
        <Badge variant="outline">
          {jobPosting.employmentType || 'Full-time'}
        </Badge>
      ),
    },
    {
      key: 'salaryRange',
      label: 'Salary Range',
      render: (jobPosting) => {
        if (!jobPosting.minSalary && !jobPosting.maxSalary)
          return <span className="text-gray-500">Not specified</span>;

        const min = jobPosting.minSalary;
        const max = jobPosting.maxSalary;
        const currency = jobPosting.salaryCurrency || 'USD';

        if (min && max) {
          return (
            <span>
              {min.toLocaleString()} - {max.toLocaleString()} {currency}
            </span>
          );
        } else if (min) {
          return (
            <span>
              {min.toLocaleString()}+ {currency}
            </span>
          );
        } else if (max) {
          return (
            <span>
              Up to {max.toLocaleString()} {currency}
            </span>
          );
        }

        return <span className="text-gray-500">Not specified</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (jobPosting) => {
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case 'active':
            case 'published':
              return '!bg-green-100 !text-green-800 hover:!bg-green-100 hover:!text-green-800';
            case 'draft':
              return '!bg-yellow-100 !text-yellow-800 hover:!bg-yellow-100 hover:!text-yellow-800';
            case 'closed':
            case 'archived':
              return '!bg-red-100 !text-red-800 hover:!bg-red-100 hover:!text-red-800';
            case 'paused':
              return '!bg-gray-100 !text-gray-800 hover:!bg-gray-100 hover:!text-gray-800';
            default:
              return '!bg-gray-100 !text-gray-800 hover:!bg-gray-100 hover:!text-gray-800';
          }
        };
        return (
          <Badge className={`${getStatusColor(jobPosting.status)} !border-0`}>
            {formatEnumValue(jobPosting.status)}
          </Badge>
        );
      },
    },
    {
      key: 'applicationCount',
      label: 'Applications',
      sortable: true,
      render: (jobPosting) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{jobPosting.applications?.length || 0}</span>
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (jobPosting) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Navigate to job posting details
            router.push(`/app/support/job-details/${jobPosting.id}`);
          }}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
    toast.success('Job postings refreshed');
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Error Loading Job Postings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Unable to load job postings. Please try again.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SaasDataTable<JobPosting>
        data={jobPostingsData?.items || []}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        emptyState={{
          title: 'No job postings found',
          icon: <Briefcase className="text-muted-foreground/50 h-12 w-12" />,
          description: 'No job postings found for this client',
          action: {
            label: 'Refresh',
            onClick: handleRefresh,
          },
        }}
        pagination={{
          totalItems: jobPostingsData?.pagination?.total || 0,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(
            (jobPostingsData?.pagination?.total || 0) / pageSize
          ),
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        onRefresh={handleRefresh}
        searchable={true}
        searchPlaceholder="Search job postings..."
        searchValue={debouncedSearch}
        onSearchChange={setSearch}
      />
    </div>
  );
}
