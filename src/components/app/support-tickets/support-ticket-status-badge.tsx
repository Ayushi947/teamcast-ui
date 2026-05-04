import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SupportTicketStatusEnum } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

interface SupportTicketStatusBadgeProps {
  status: SupportTicketStatusEnum;
  className?: string;
}

export const SupportTicketStatusBadge: React.FC<
  SupportTicketStatusBadgeProps
> = ({ status, className }) => {
  const getStatusBadge = (status: SupportTicketStatusEnum) => {
    switch (status) {
      case SupportTicketStatusEnum.OPEN:
        return (
          <Badge
            className={`border-transparent bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.IN_PROGRESS:
        return (
          <Badge
            className={`border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.PENDING:
        return (
          <Badge
            className={`border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.RESOLVED:
        return (
          <Badge
            className={`border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.CLOSED:
        return (
          <Badge
            className={`border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.REOPENED:
        return (
          <Badge
            className={`border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      case SupportTicketStatusEnum.CANCELLED:
        return (
          <Badge
            className={`border-transparent bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-300 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
      default:
        return (
          <Badge
            className={`border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 ${className || ''}`}
          >
            {formatEnumValue(status)}
          </Badge>
        );
    }
  };

  return getStatusBadge(status);
};

export default SupportTicketStatusBadge;
