import { Suspense } from 'react';
import McpClientsPage from './client-page';

export const metadata = {
  title: 'MCP Integrations | Teamcast',
  description:
    'Manage MCP (Model Context Protocol) clients for AI agent integrations',
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <McpClientsPage />
    </Suspense>
  );
}
