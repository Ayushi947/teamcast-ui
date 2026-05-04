import { ISupportUser, UserRoleEnum } from '@/lib/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { supportUserManagementService } from '@/lib/services/services';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AssignmentDialogProps {
  onAssign: (assigneeId: string, notes?: string) => Promise<void>;
  isAssigning?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function AssignmentDialog({
  onAssign,
  isAssigning = false,
  children,
  className,
}: AssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);
  const [assigneeSearchValue, setAssigneeSearchValue] = useState('');
  const [focusedAssigneeIndex, setFocusedAssigneeIndex] = useState(-1);
  const [selectedAssignee, setSelectedAssignee] = useState<ISupportUser | null>(
    null
  );
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Fetch support users for assignment
  const debouncedAssigneeSearch = useDebounce(assigneeSearchValue, 300);
  const { data: supportUsersData, isLoading: isSearchingAssignees } = useQuery({
    queryKey: ['support-users', debouncedAssigneeSearch],
    queryFn: () =>
      supportUserManagementService.getSupportUsers({
        page: 1,
        limit: 20,
        search: debouncedAssigneeSearch,
        role: UserRoleEnum.TECHNICAL_SUPPORT,
      }),
    enabled: isAssigneePopoverOpen || isOpen,
  });

  const supportUsers = supportUsersData?.items || [];

  // Handle assignee search input keydown
  const handleAssigneeInputKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedAssigneeIndex((prev) =>
          prev < supportUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedAssigneeIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedAssigneeIndex >= 0 && supportUsers[focusedAssigneeIndex]) {
          handleAssigneeSelect(supportUsers[focusedAssigneeIndex]);
        }
        break;
      case 'Escape':
        setIsAssigneePopoverOpen(false);
        setAssigneeSearchValue('');
        setFocusedAssigneeIndex(-1);
        break;
    }
  };

  // Handle assignee selection
  const handleAssigneeSelect = (assignee: ISupportUser) => {
    setSelectedAssignee(assignee);
    setIsAssigneePopoverOpen(false);
    setAssigneeSearchValue('');
    setFocusedAssigneeIndex(-1);
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async () => {
    if (!selectedAssignee) return;

    try {
      await onAssign(selectedAssignee.id, assignmentNotes);
      setIsOpen(false);
      setSelectedAssignee(null);
      setAssignmentNotes('');
    } catch (error) {
      logger.error('Failed to assign ticket:', error);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
    setSelectedAssignee(null);
    setAssignmentNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('flex-1 gap-2', className)}
          disabled={isAssigning}
        >
          {children || (
            <>
              <UserPlus className="h-4 w-4" />
              Change Assignee
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Select a support user to assign this ticket to and add any relevant
            notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Assignee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Assignee
            </label>
            <Popover
              open={isAssigneePopoverOpen}
              onOpenChange={setIsAssigneePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedAssignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-purple-100 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          {selectedAssignee.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedAssignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select assignee...</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-3">
                  <div className="space-y-2">
                    <Input
                      placeholder="Search assignees..."
                      value={assigneeSearchValue}
                      onChange={(e) => {
                        setAssigneeSearchValue(e.target.value);
                        setFocusedAssigneeIndex(-1);
                      }}
                      className="h-9"
                      onKeyDown={handleAssigneeInputKeyDown}
                      aria-activedescendant={
                        focusedAssigneeIndex >= 0 &&
                        supportUsers[focusedAssigneeIndex]
                          ? `assignee-option-${supportUsers[focusedAssigneeIndex].id}`
                          : undefined
                      }
                      aria-controls="assignees-listbox"
                      role="combobox"
                      aria-expanded="true"
                    />
                    {isSearchingAssignees ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 dark:border-gray-600 dark:border-t-purple-400"></div>
                          <span>Searching...</span>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-48">
                        <div
                          id="assignees-listbox"
                          role="listbox"
                          aria-multiselectable="true"
                          className="rounded-md border border-gray-200 dark:border-gray-600"
                        >
                          {supportUsers.length > 0 ? (
                            supportUsers.map(
                              (assignee: ISupportUser, idx: number) => (
                                <div
                                  id={`assignee-option-${assignee.id}`}
                                  key={assignee.id}
                                  role="option"
                                  aria-selected={false}
                                  tabIndex={-1}
                                  className={cn(
                                    'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                                    idx === focusedAssigneeIndex &&
                                      'bg-purple-50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
                                  )}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAssigneeSelect(assignee);
                                  }}
                                  onMouseEnter={() =>
                                    setFocusedAssigneeIndex(idx)
                                  }
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-purple-100 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                      {assignee.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {assignee.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {assignee.email}
                                    </span>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              No assignees found.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Assignment Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Assignment Notes
            </label>
            <Textarea
              placeholder="Add any notes about this assignment..."
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignmentSubmit}
            disabled={!selectedAssignee || isAssigning}
            className="gap-2"
          >
            {isAssigning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Assign Ticket
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
