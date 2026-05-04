'use client';
import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ApiDocsSidebar } from './components/api-docs-sidebar';
import { ApiDocsRightPanel } from './components/api-docs-right-panel';
import { OpenAPIProvider } from './components/openapi-context';

interface ApiDocsLayoutProps {
  children: ReactNode;
}

export default function ApiDocsLayout({ children }: ApiDocsLayoutProps) {
  const pathname = usePathname();

  // Show full layout only for API reference pages (not landing page)
  const isReferencePage = pathname !== '/apis';

  if (!isReferencePage) {
    // Landing page - no sidebar, full width
    return (
      <OpenAPIProvider>
        <div className="bg-background min-h-screen pt-20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </OpenAPIProvider>
    );
  }

  // API reference pages - with sidebar
  return (
    <OpenAPIProvider>
      <div className="bg-background flex h-screen pt-20">
        {/* Left Sidebar */}
        <div className="border-sidebar-border bg-sidebar w-80 border-r">
          <ApiDocsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-4">{children}</div>
        </div>

        {/* Right Panel */}
        <div className="border-sidebar-border bg-sidebar w-96 border-l">
          <ApiDocsRightPanel />
        </div>
      </div>
    </OpenAPIProvider>
  );
}
