'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Download,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: 'candidate' | 'agent';
  text: string;
  isFinal?: boolean;
}

interface TranscriptProps {
  entries: TranscriptEntry[];
  isVisible: boolean;
  onToggle: () => void;
  onClear?: () => void;
  className?: string;
  candidateName?: string;
}

export function Transcript({
  entries,
  isVisible,
  onToggle,
  onClear,
  className,
  candidateName = 'You',
}: TranscriptProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current && isVisible) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [entries, isVisible]);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
  };

  const copyTranscript = async () => {
    const transcriptText = entries
      .map(
        (entry) =>
          `[${formatTimestamp(entry.timestamp)}] ${entry.speaker === 'candidate' ? candidateName : 'AI Agent'}: ${entry.text}`
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(transcriptText);
      toast.success('Transcript copied to clipboard');
    } catch {
      toast.error('Failed to copy transcript');
    }
  };

  const downloadTranscript = () => {
    const transcriptText = entries
      .map(
        (entry) =>
          `[${formatTimestamp(entry.timestamp)}] ${entry.speaker === 'candidate' ? candidateName : 'AI Agent'}: ${entry.text}`
      )
      .join('\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Transcript downloaded');
  };

  const clearTranscript = () => {
    if (onClear) {
      onClear();
      toast.success('Transcript cleared');
    } else {
      toast.info('Clear transcript functionality needs to be implemented');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'bg-card flex h-full flex-col rounded-lg border shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <h3 className="text-foreground font-semibold">Live Transcript</h3>
          </div>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
            {entries.length} messages
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground h-8 px-3"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Transcript Content */}
      <div
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-96' : 'max-h-64'
        )}
      >
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-4 p-4">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Bot className="text-muted-foreground h-8 w-8" />
                </div>
                <h4 className="text-foreground mb-2 text-sm font-medium">
                  No conversation yet
                </h4>
                <p className="text-muted-foreground text-xs">
                  The transcript will appear here as you speak with the AI
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex gap-3 rounded-lg p-3 transition-all duration-200',
                    entry.speaker === 'candidate'
                      ? 'bg-primary/5 border-primary border-l-4'
                      : 'bg-muted/50 border-muted-foreground border-l-4'
                  )}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                        entry.speaker === 'candidate'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground text-muted-foreground'
                      )}
                    >
                      {entry.speaker === 'candidate' ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-foreground text-xs font-medium">
                        {entry.speaker === 'candidate'
                          ? candidateName
                          : 'AI Agent'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      {!entry.isFinal && (
                        <span className="text-muted-foreground animate-pulse text-xs">
                          • typing
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed break-words">
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer Actions */}
      {entries.length > 0 && (
        <div className="bg-muted/30 flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyTranscript}
              className="text-muted-foreground hover:text-foreground h-8 text-xs"
            >
              <Copy size={12} className="mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTranscript}
              className="text-muted-foreground hover:text-foreground h-8 text-xs"
            >
              <Download size={12} className="mr-1" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="text-destructive hover:text-destructive/90 h-8 text-xs"
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          </div>
          <div className="text-muted-foreground text-xs">
            Updated {formatTimestamp(new Date())}
          </div>
        </div>
      )}
    </div>
  );
}
