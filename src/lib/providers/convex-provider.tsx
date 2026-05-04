'use client';

import { ConvexProvider } from 'convex/react';
import { ReactNode } from 'react';
import { convexReact } from '../convex';

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return <ConvexProvider client={convexReact}>{children}</ConvexProvider>;
}
