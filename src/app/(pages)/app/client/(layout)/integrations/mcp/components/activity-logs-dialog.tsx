'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClient, IMcpActivityLog } from '@/lib/shared';
import { formatDistanceToNow, format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, RefreshCwIcon } from 'lucide-react';

interface ActivityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IMcpClient;
}

export function ActivityLogsDialog({
  open,
  onOpenChange,
  client,
}: ActivityLogsDialogProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mcpActivityLogs', client.id, page, pageSize],
    queryFn: () =>
      mcpClientService.getActivityLogs(client.id, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
    enabled: open,
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadge = (status: string) => {
    return status === 'success' ? 'default' : 'destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Activity Logs</DialogTitle>
              <DialogDescription>
                Recent API requests for {client.name}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No activity logs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: IMcpActivityLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div title={format(new Date(log.createdAt), 'PPpp')}>
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted rounded px-1 py-0.5 text-xs">
                        {log.method}
                      </code>
                    </TableCell>
                    <TableCell>
                      {log.toolName && (
                        <code className="bg-muted rounded px-1 py-0.5 text-xs">
                          {log.toolName}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadge(log.responseStatus) as
                            | 'default'
                            | 'destructive'
                        }
                      >
                        {log.responseStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.durationMs}ms</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                      {log.errorMessage}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-muted-foreground text-sm">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, total)} of {total} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
