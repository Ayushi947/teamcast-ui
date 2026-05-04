'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/utils';

const SideDrawer = DialogPrimitive.Root;

const SideDrawerTrigger = DialogPrimitive.Trigger;

const SideDrawerPortal = DialogPrimitive.Portal;

const SideDrawerClose = DialogPrimitive.Close;

const SideDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
      className
    )}
    {...props}
  />
));
SideDrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SideDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SideDrawerPortal>
    <SideDrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l shadow-lg transition ease-in-out sm:max-w-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SideDrawerPortal>
));
SideDrawerContent.displayName = DialogPrimitive.Content.displayName;

const SideDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
SideDrawerHeader.displayName = 'SideDrawerHeader';

const SideDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
SideDrawerFooter.displayName = 'SideDrawerFooter';

const SideDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg leading-none font-semibold tracking-tight',
      className
    )}
    {...props}
  />
));
SideDrawerTitle.displayName = DialogPrimitive.Title.displayName;

const SideDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
SideDrawerDescription.displayName = DialogPrimitive.Description.displayName;

export {
  SideDrawer,
  SideDrawerPortal,
  SideDrawerOverlay,
  SideDrawerTrigger,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerHeader,
  SideDrawerFooter,
  SideDrawerTitle,
  SideDrawerDescription,
};
