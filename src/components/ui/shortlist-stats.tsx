'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  TrendingUp,
  Clock,
  Users,
  Eye,
  Download,
  ArrowRight,
} from 'lucide-react';
import { shortlistService } from '@/lib/models/shortlist';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ShortlistStatsProps {
  className?: string;
  showActions?: boolean;
}

export function ShortlistStats({
  className,
  showActions = true,
}: ShortlistStatsProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    byJob: {} as Record<string, number>,
    recentlyAdded: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const currentStats = shortlistService.getShortlistStats();
      setStats(currentStats);
    };

    updateStats();

    // Listen for storage changes to update stats
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamcast_shortlisted_candidates') {
        updateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const topJobs = Object.entries(stats.byJob)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const handleViewAll = () => {
    router.push('/app/client/candidates/shortlisted');
  };

  const handleExport = () => {
    shortlistService.exportToCSV();
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            Shortlisted Candidates
          </CardTitle>
          <Badge variant="secondary" className="px-2 py-1">
            {stats.total} total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {stats.total === 0 ? (
          <div className="py-6 text-center">
            <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Heart className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-3 text-sm">
              No candidates shortlisted yet
            </p>
            <Button
              size="sm"
              onClick={() => router.push('/app/client/recruiter/sourcing')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Find Candidates
            </Button>
          </div>
        ) : (
          <>
            {/* Recent Activity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Recent Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  {stats.recentlyAdded} added today
                </span>
              </div>
            </div>

            {/* Job Distribution */}
            {topJobs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Top Jobs</span>
                  </div>
                  <div className="space-y-2">
                    {topJobs.map(([jobId, count]) => (
                      <div
                        key={jobId}
                        className="flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            Job {jobId.slice(-8)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Progress
                              value={(count / stats.total) * 100}
                              className="h-1 flex-1"
                            />
                            <span className="text-muted-foreground text-xs">
                              {Math.round((count / stats.total) * 100)}%
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            {showActions && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewAll}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={stats.total === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for smaller spaces
export function ShortlistStatsCompact({ className }: { className?: string }) {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, recentlyAdded: 0 });

  useEffect(() => {
    const updateStats = () => {
      const currentStats = shortlistService.getShortlistStats();
      setStats({
        total: currentStats.total,
        recentlyAdded: currentStats.recentlyAdded,
      });
    };

    updateStats();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamcast_shortlisted_candidates') {
        updateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Shortlisted</p>
              <p className="text-muted-foreground text-xs">
                {stats.recentlyAdded} added today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              {stats.total}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/app/client/candidates/shortlisted')}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
