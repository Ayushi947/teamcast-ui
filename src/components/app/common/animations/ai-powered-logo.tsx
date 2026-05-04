import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import React from 'react';

const AIPoweredLogo = () => {
  return (
    <Badge
      variant="secondary"
      className="bg-primary/15 text-primary inline-flex items-center gap-1 px-2.5 text-xs font-bold whitespace-nowrap"
    >
      <Bot size={15} strokeWidth={2} className="flex-shrink-0" />
      AI Powered
    </Badge>
  );
};

export default AIPoweredLogo;
