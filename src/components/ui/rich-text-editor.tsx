'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false,
  rows = 6,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const formatText = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        newCursorPos = start + 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        newCursorPos = start + 1;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'bullet':
        formattedText = `• ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'numbered':
        formattedText = `1. ${selectedText}`;
        newCursorPos = start + 3;
        break;
      default:
        return;
    }

    const newValue =
      value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(
          newCursorPos,
          newCursorPos + selectedText.length
        );
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      });
    }
  };

  const hasSelection = selection.start !== selection.end;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="bg-background flex flex-wrap items-center gap-1 rounded-lg border p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          disabled={disabled || !hasSelection}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          disabled={disabled || !hasSelection}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('underline')}
          disabled={disabled || !hasSelection}
          className="h-8 w-8 p-0"
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="bg-border mx-1 h-6 w-px" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bullet')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('numbered')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="bg-border mx-1 h-6 w-px" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('quote')}
          disabled={disabled || !hasSelection}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('code')}
          disabled={disabled || !hasSelection}
          className="h-8 w-8 p-0"
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextareaSelect}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="min-h-[120px] resize-none font-mono text-sm"
      />

      {/* Help Text */}
      <div className="text-muted-foreground text-xs">
        <p>
          Markdown shortcuts: **bold**, *italic*, __underline__, `code`, &gt;
          quote, • bullet, 1. numbered
        </p>
      </div>
    </div>
  );
};
