import {
  Wifi,
  Video,
  Mic,
  Volume2,
  FileCheck,
  MapPin,
  AlertCircle,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ENV } from '@/lib/env';

interface SystemCheckProgressProps {
  cameraStatus: 'checking' | 'success' | 'error';
  micStatus: 'checking' | 'success' | 'error';
  speakerStatus: 'idle' | 'checking' | 'success' | 'error';
  internetSpeed: number | null;
  termsAccepted: boolean;
  locationStatus: 'checking' | 'success' | 'error';
  faceDetectionStatus: 'checking' | 'success' | 'error';
}

const getStatusMessage = (status: string, type: string) => {
  switch (status) {
    case 'success':
      return `${type} is working properly`;
    case 'error':
      return `${type} needs attention`;
    case 'checking':
      return `Checking ${type.toLowerCase()}...`;
    default:
      return `${type} status unknown`;
  }
};

const CheckItem = ({
  icon: Icon,
  label,
  status,
  value,
}: {
  icon: React.ElementType;
  label: string;
  status: string;
  value?: number | null;
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-success/20 bg-success/10 text-success';
      case 'error':
        return 'border-destructive/20 bg-destructive/10 text-destructive';
      case 'checking':
        return 'border-primary/20 bg-primary/10 text-primary animate-pulse';
      default:
        return 'border-border bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col gap-1 rounded-lg border px-3 py-2',
        getStatusStyles(status)
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-medium">{label}</span>
          {value !== undefined && value !== null && (
            <span className="ml-1 text-xs opacity-75">({value} Mbps)</span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {status === 'checking' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-2 w-2 rounded-full bg-current"
            />
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs opacity-75">
          {getStatusMessage(status, label)}
        </span>
        {status === 'error' && <AlertCircle className="h-3 w-3 text-current" />}
      </div>
    </motion.div>
  );
};

const SystemCheckProgress = ({
  cameraStatus,
  micStatus,
  speakerStatus,
  internetSpeed,
  termsAccepted,
  locationStatus,
  faceDetectionStatus,
}: SystemCheckProgressProps) => {
  const totalChecks = 7;
  const passedChecks = [
    cameraStatus === 'success',
    micStatus === 'success',
    faceDetectionStatus === 'success',
    speakerStatus === 'success',
    internetSpeed !== null &&
      internetSpeed > ENV.NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD,
    termsAccepted,
    locationStatus === 'success',
  ].filter(Boolean).length;

  const allPassed = passedChecks === totalChecks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-4',
        allPassed ? 'border-success/20 bg-card' : 'border-border bg-card'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-xl font-semibold">
            System Check
          </h3>
          <p className="text-muted-foreground mt-0.5 text-base">
            Ensuring your system meets all requirements
          </p>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className={cn(
            'text-sm font-medium',
            allPassed ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {allPassed
            ? 'All systems ready'
            : `${passedChecks} of ${totalChecks} passed`}
        </motion.span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CheckItem icon={Video} label="Camera" status={cameraStatus} />
        <CheckItem icon={Mic} label="Microphone" status={micStatus} />
        <CheckItem
          icon={User}
          label="Face Detection"
          status={faceDetectionStatus}
        />
        <CheckItem icon={Volume2} label="Speakers" status={speakerStatus} />
        <CheckItem
          icon={Wifi}
          label="Internet"
          status={
            internetSpeed !== null && internetSpeed > 2 ? 'success' : 'error'
          }
          value={internetSpeed}
        />
        <CheckItem
          icon={FileCheck}
          label="Terms"
          status={termsAccepted ? 'success' : 'error'}
        />
        <CheckItem icon={MapPin} label="Location" status={locationStatus} />
      </div>

      {!allPassed && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-warning/10 text-warning mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Please resolve the issues above to proceed</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SystemCheckProgress;
