import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SyncLog {
  id: string;
  timestamp: Date;
  type: string;
  status: string;
  details: string;
}

export default function SyncLogs({
  fetchSyncLogs,
  syncLogs,
}: {
  fetchSyncLogs: () => void;
  syncLogs: SyncLog[];
}) {
  return (
    <Card className="border-primary/10 w-full shadow-sm">
      <CardHeader className="border-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-lg">
              <RefreshCw className="text-primary mr-2 h-5 w-5" />
              Sync Logs
            </CardTitle>
            <CardDescription className="text-sm">
              Recent synchronization activities
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchSyncLogs()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {syncLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'success' ? 'default' : 'destructive'
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RefreshCw className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Sync Logs</h3>
            <p className="text-muted-foreground max-w-md">
              No synchronization activities have been recorded yet. Sync logs
              will appear here after performing integration actions.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchSyncLogs()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Logs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
