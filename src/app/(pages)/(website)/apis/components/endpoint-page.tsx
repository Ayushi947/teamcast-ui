'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Book, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  in: string;
}

interface ResponseCode {
  code: number;
  description: string;
  example?: string;
}

interface EndpointPageProps {
  endpoint: {
    path: string;
    method: string;
    title: string;
    description: string;
    scope?: string;
    parameters?: Parameter[];
    requestBody?: {
      type: string;
      description: string;
      example: string;
    };
    responses: ResponseCode[];
  };
}

export function EndpointPage({ endpoint }: EndpointPageProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'parameters' | 'responses'
  >('overview');

  // Use environment variable for base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'PUT':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getResponseColor = (code: number) => {
    if (code >= 200 && code < 300)
      return 'text-emerald-600 dark:text-emerald-400';
    if (code >= 400 && code < 500)
      return 'text-orange-600 dark:text-orange-400';
    if (code >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getStatusIcon = (code: number) => {
    if (code >= 200 && code < 300) return <CheckCircle className="h-4 w-4" />;
    if (code >= 400) return <AlertCircle className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              'border font-mono font-medium',
              getMethodColor(endpoint.method)
            )}
          >
            {endpoint.method}
          </Badge>
          <h1 className="text-foreground text-3xl font-bold">
            {endpoint.title}
          </h1>
        </div>

        <div className="bg-muted border-border rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Endpoint URL
            </span>
          </div>
          <code className="text-foreground font-mono text-lg break-all">
            {baseUrl}
            {endpoint.path}
          </code>
        </div>

        <p className="text-muted-foreground text-lg leading-relaxed">
          {endpoint.description}
        </p>

        {endpoint.scope && (
          <div className="flex items-center gap-3">
            <span className="text-foreground text-sm font-medium">
              Required Scope:
            </span>
            <Badge
              variant="outline"
              className="bg-primary/5 border-primary/20 text-primary"
            >
              {endpoint.scope}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-border border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Book },
            { id: 'parameters', label: 'Parameters', icon: Settings },
            { id: 'responses', label: 'Responses', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="border-border rounded-lg border p-6 shadow-sm">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
                <Book className="text-primary h-5 w-5" />
                Endpoint Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    HTTP Method
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono',
                        getMethodColor(endpoint.method)
                      )}
                    >
                      {endpoint.method}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Content Type
                  </label>
                  <div className="text-foreground mt-1 font-mono text-sm">
                    application/json
                  </div>
                </div>
              </div>
            </div>

            {endpoint.requestBody && endpoint.requestBody.example && (
              <div className="border-border rounded-lg border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  Request Body
                </h3>
                <p className="text-muted-foreground mb-4">
                  {endpoint.requestBody.description}
                </p>
                <div className="bg-muted border-border rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      JSON Example
                    </span>
                  </div>
                  <pre className="text-foreground overflow-x-auto font-mono text-sm">
                    <code>{endpoint.requestBody.example}</code>
                  </pre>
                </div>
              </div>
            )}

            {!endpoint.requestBody && (
              <div className="border-border rounded-lg border p-6 shadow-sm">
                <div className="py-8 text-center">
                  <div className="bg-muted mx-auto mb-3 w-fit rounded-full p-3">
                    <CheckCircle className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground">
                    No request body required for this endpoint
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="border-border rounded-lg border shadow-sm">
            <div className="border-border border-b p-6">
              <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                <Settings className="text-primary h-5 w-5" />
                Parameters
              </h3>
            </div>
            {endpoint.parameters && endpoint.parameters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Parameter
                      </th>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Location
                      </th>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Type
                      </th>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Required
                      </th>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Description
                      </th>
                      <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {endpoint.parameters.map((param, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-foreground bg-muted rounded px-2 py-1 text-sm font-medium">
                              {param.name}
                            </code>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {param.in}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-primary bg-primary/10 rounded px-2 py-1 text-sm">
                            {param.type}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {param.required ? (
                            <Badge variant="destructive" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No
                            </Badge>
                          )}
                        </td>
                        <td className="text-muted-foreground max-w-xs px-6 py-4 text-sm">
                          {param.description}
                        </td>
                        <td className="px-6 py-4">
                          {param.example && (
                            <code className="text-foreground bg-muted rounded px-2 py-1 text-sm">
                              {param.example}
                            </code>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="bg-muted mx-auto mb-3 w-fit rounded-full p-3">
                  <Settings className="text-muted-foreground h-6 w-6" />
                </div>
                <p className="text-muted-foreground">
                  No parameters required for this endpoint
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="border-border rounded-lg border shadow-sm">
            <div className="border-border border-b p-6">
              <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                <CheckCircle className="text-primary h-5 w-5" />
                Response Codes
              </h3>
            </div>
            <div className="divide-border divide-y">
              {endpoint.responses.map((response, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded p-1',
                          getResponseColor(response.code)
                        )}
                      >
                        {getStatusIcon(response.code)}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-mono font-medium',
                          response.code >= 200 && response.code < 300
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : response.code >= 400 && response.code < 500
                              ? 'border-orange-200 bg-orange-50 text-orange-700'
                              : response.code >= 500
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {response.code}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground mb-2 font-medium">
                        {response.description}
                      </h4>
                      {response.example && (
                        <div className="bg-muted border-border mt-3 rounded-lg border p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Response Example
                            </span>
                          </div>
                          <pre className="text-foreground overflow-x-auto font-mono text-sm">
                            <code>{response.example}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
