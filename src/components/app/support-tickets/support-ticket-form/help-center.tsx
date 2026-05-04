'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SideDrawer,
  SideDrawerContent,
  SideDrawerTrigger,
} from '@/components/ui/side-drawer';
import { SupportTicketForm } from './support-ticket-form';

export const HelpCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <SideDrawer open={isOpen} onOpenChange={setIsOpen}>
      <SideDrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group bg-card fixed top-1/2 right-0 z-50 flex h-12 w-12 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-l-full border-y border-l border-gray-200 p-0 shadow-lg transition-all duration-300 hover:h-48 hover:w-12 hover:shadow-xl dark:border-gray-700 dark:hover:bg-gray-900"
          aria-label="Open Support Center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <HelpCircle
            className={`h-5 w-5 flex-shrink-0 rotate-270 group-hover:mb-2 ${isHovered ? '' : 'animate-bounce'}`}
          />
          {isHovered && (
            <span className="rotate-180 text-sm font-medium whitespace-nowrap transition-opacity duration-300 [writing-mode:vertical-rl]">
              Need Support
            </span>
          )}
        </Button>
      </SideDrawerTrigger>

      <SideDrawerContent className="bg-card w-full border-l p-0 sm:w-1/2 sm:max-w-[45vw] lg:w-[50vw] xl:w-[50vw]">
        <SupportTicketForm onClose={handleClose} />
      </SideDrawerContent>
    </SideDrawer>
  );
};
