'use client';

import { useOpenAPI } from './openapi-context';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Copy,
  Play,
  Check,
  Code2,
  AlertTriangle,
  Key,
  Send,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiDocsRightPanelProps {
  endpoint?: {
    path: string;
    method: string;
    title: string;
    description?: string;
    parameters?: any[];
  };
}

export function ApiDocsRightPanel({ endpoint }: ApiDocsRightPanelProps) {
  const { loading, error, data } = useOpenAPI();
  const params = useParams() as { slug?: string[] };
  const [credentialType, setCredentialType] = useState<'header' | 'bearer'>(
    'bearer'
  );
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [apiToken, setApiToken] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  const fullApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
  const baseUrl = fullApiUrl.endsWith('/api')
    ? fullApiUrl
    : `${fullApiUrl}/api`;

  // Helper functions (keeping the existing schema resolution logic)
  const resolveSchema = (schema: any, components: any): any => {
    if (schema.$ref && components?.schemas) {
      const refName = schema.$ref.split('/').pop();
      return components.schemas[refName] || schema;
    }
    return schema;
  };

  const generateExampleFromSchema = (
    schema: any,
    components?: any,
    visited: Set<string> = new Set()
  ): any => {
    if (!schema) return {};

    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      if (visited.has(refName)) return {};
      visited.add(refName);
      const resolvedSchema = resolveSchema(schema, components);
      const result = generateExampleFromSchema(
        resolvedSchema,
        components,
        visited
      );
      visited.delete(refName);
      return result;
    }

    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;

    if (schema.type === 'object' && schema.properties) {
      const example: any = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        example[key] = generateExampleFromSchema(
          prop as any,
          components,
          visited
        );
      }
      return example;
    }

    if (schema.type === 'array') {
      if (schema.items) {
        const itemExample = generateExampleFromSchema(
          schema.items,
          components,
          visited
        );
        return [itemExample];
      }
      return [];
    }

    if (schema.type === 'string') {
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'date')
        return new Date().toISOString().split('T')[0];
      if (schema.format === 'uuid')
        return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.enum) return schema.enum[0];

      const lowerKey = (schema.title || '').toLowerCase();
      if (lowerKey.includes('email')) return 'user@example.com';
      if (lowerKey.includes('name')) return 'Sample Name';
      if (lowerKey.includes('title')) return 'Sample Title';
      if (lowerKey.includes('description')) return 'Sample description';
      if (lowerKey.includes('password')) return 'password123';

      return 'sample string';
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.maximum !== undefined) return Math.min(schema.maximum, 100);
      return 1;
    }

    if (schema.type === 'boolean') return true;
    return {};
  };

  // Check if endpoint requires authentication
  const isAuthRequired = (path?: string) => {
    if (!path) return true;

    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/signup',
      '/candidate/signup',
      '/client/signup',
      '/partner/signup',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/health',
      '/status',
    ];

    return !publicEndpoints.some((endpoint) =>
      path.toLowerCase().includes(endpoint.toLowerCase())
    );
  };

  // Find endpoint from OpenAPI if not passed as prop
  let ep = endpoint;
  let requestBodyExample = '';

  if (!ep && !loading && data && params?.slug) {
    const joined = '/' + params.slug.join('/');
    for (const path in data.paths) {
      if (path === joined) {
        const methods = Object.keys(data.paths[path]);
        const preferred = ['get', 'post', 'put', 'delete', 'patch'];
        const method = preferred.find((m) => methods.includes(m)) || methods[0];
        if (method) {
          const operation = data.paths[path][method];
          ep = {
            path,
            method: method.toUpperCase(),
            title: operation.summary || path,
            parameters: operation.parameters || [],
          };

          if (operation.requestBody?.content?.['application/json']) {
            const jsonContent =
              operation.requestBody.content['application/json'];

            if (jsonContent.example) {
              requestBodyExample =
                typeof jsonContent.example === 'string'
                  ? jsonContent.example
                  : JSON.stringify(jsonContent.example, null, 2);
            } else if (jsonContent.examples?.default?.value) {
              requestBodyExample =
                typeof jsonContent.examples.default.value === 'string'
                  ? jsonContent.examples.default.value
                  : JSON.stringify(jsonContent.examples.default.value, null, 2);
            } else if (jsonContent.schema) {
              const resolvedSchema = resolveSchema(
                jsonContent.schema,
                data.components
              );
              const generated = generateExampleFromSchema(
                resolvedSchema,
                data.components,
                new Set()
              );
              if (generated && Object.keys(generated).length > 0) {
                requestBodyExample = JSON.stringify(generated, null, 2);
              }
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    if (ep && ['POST', 'PUT', 'PATCH'].includes(ep.method)) {
      if (requestBodyExample && requestBodyExample !== '{}') {
        setRequestBody(requestBodyExample);
      } else {
        const defaultBody = {
          ...(ep.path.includes('/user') && {
            name: 'John Doe',
            email: 'john@example.com',
          }),
          ...(ep.path.includes('/job') && {
            title: 'Software Engineer',
            description: 'Job description',
          }),
          ...(ep.path.includes('/candidate') && {
            name: 'Jane Smith',
            skills: ['JavaScript', 'React'],
          }),
          ...(ep.method === 'POST' &&
            !Object.keys({}).length && { name: 'Example Name' }),
          ...(ep.method === 'PUT' && {
            id: 'example-id',
            name: 'Updated Name',
          }),
          ...(ep.method === 'PATCH' && { field: 'updated value' }),
        };

        if (Object.keys(defaultBody).length > 0) {
          setRequestBody(JSON.stringify(defaultBody, null, 2));
        }
      }
    }
  }, [ep?.path, ep?.method, requestBodyExample]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryIt = async () => {
    if (!ep) {
      setResponseError('No endpoint selected');
      return;
    }

    const authRequired = isAuthRequired(ep.path);
    if (authRequired && !apiToken.trim()) {
      setResponseError('Please provide an API token for this endpoint');
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setResponseError(null);
    setResponseStatus(null);

    try {
      let url = `${baseUrl}${ep.path}`;
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value.trim())
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&');

      if (queryString) url += `?${queryString}`;

      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      // Only add auth headers if token is provided and endpoint requires auth
      if (apiToken.trim() && authRequired) {
        if (credentialType === 'bearer') {
          headers['Authorization'] = `Bearer ${apiToken}`;
        } else {
          headers['X-API-Key'] = apiToken;
        }
      }

      const requestOptions: RequestInit = { method: ep.method, headers };

      if (['POST', 'PUT', 'PATCH'].includes(ep.method) && requestBody.trim()) {
        try {
          JSON.parse(requestBody);
          requestOptions.body = requestBody;
        } catch {
          setResponseError('Invalid JSON in request body');
          setIsLoading(false);
          return;
        }
      }

      const apiResponse = await fetch(url, requestOptions);
      setResponseStatus(apiResponse.status);

      const responseText = await apiResponse.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
        setResponse(JSON.stringify(responseData, null, 2));
      } catch {
        setResponse(responseText);
      }

      if (!apiResponse.ok) {
        setResponseError(
          `HTTP ${apiResponse.status}: ${apiResponse.statusText}`
        );
      }
    } catch (error: any) {
      setResponseError(error.message || 'Network error occurred');
      setResponse(null);
      setResponseStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCodeExample = () => {
    if (!ep) return '';
    const token = apiToken || 'YOUR_API_TOKEN_HERE';
    const authRequired = isAuthRequired(ep.path);

    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value.trim())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    let curlCommand = `curl -X ${ep.method || 'GET'} "${baseUrl}${ep.path}${queryString ? `?${queryString}` : ''}"`;

    // Only add auth headers if endpoint requires authentication
    if (authRequired) {
      if (credentialType === 'bearer') {
        curlCommand += ` \\\n  -H "Authorization: Bearer ${token}"`;
      } else {
        curlCommand += ` \\\n  -H "X-API-Key: ${token}"`;
      }
    }

    curlCommand += ' \\\n  -H "Content-Type: application/json"';

    if (['POST', 'PUT', 'PATCH'].includes(ep.method) && requestBody.trim()) {
      curlCommand += ` \\\n  -d '${requestBody}'`;
    }

    return curlCommand;
  };

  const queryParameters =
    ep?.parameters?.filter((p: any) => p.in === 'query') || [];

  // Check if current endpoint requires authentication
  const currentEndpointRequiresAuth = ep ? isAuthRequired(ep.path) : true;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading API documentation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ep) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="bg-muted rounded-lg border p-8">
            <Code2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Endpoint Selected</h3>
            <p className="text-muted-foreground text-sm">
              Choose an API endpoint from the sidebar to start testing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background border-b p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Play className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Test API</h2>
            <p className="text-muted-foreground text-sm">
              Try this endpoint with real requests
            </p>
          </div>
        </div>

        {/* Endpoint Info */}
        <div className="flex items-center gap-2">
          <Badge
            variant={
              ep.method === 'GET'
                ? 'default'
                : ep.method === 'POST'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {ep.method}
          </Badge>
          <code className="bg-muted rounded px-2 py-1 text-sm">{ep.path}</code>
          {!currentEndpointRequiresAuth && (
            <Badge variant="outline" className="text-xs">
              No Auth Required
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="setup" className="flex h-full flex-col">
          <TabsList className="mx-6 mt-4 grid w-full grid-cols-3">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent
            value="setup"
            className="flex-1 space-y-6 overflow-y-auto p-6"
          >
            {/* Authentication */}
            {currentEndpointRequiresAuth && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="text-primary h-4 w-4" />
                  <h3 className="font-semibold">Authentication</h3>
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCredentialType('bearer')}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        credentialType === 'bearer'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      Bearer Token
                    </button>
                    <button
                      onClick={() => setCredentialType('header')}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        credentialType === 'header'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      API Key
                    </button>
                  </div>

                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder={`Enter your ${credentialType === 'bearer' ? 'bearer token' : 'API key'}`}
                    className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* No Auth Notice */}
            {!currentEndpointRequiresAuth && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="text-muted-foreground h-4 w-4" />
                  <h3 className="font-semibold">Authentication</h3>
                  <Badge variant="outline" className="text-xs">
                    Not Required
                  </Badge>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    This endpoint does not require authentication. You can test
                    it directly without providing an API token.
                  </p>
                </div>
              </div>
            )}

            {/* Query Parameters */}
            {queryParameters.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Query Parameters</h3>
                <div className="space-y-3">
                  {queryParameters.map((param: any) => (
                    <div key={param.name} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">
                          {param.name}
                        </label>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={param.description || `Enter ${param.name}`}
                        value={queryParams[param.name] || ''}
                        onChange={(e) =>
                          setQueryParams((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                      />
                      {param.description && (
                        <p className="text-muted-foreground text-xs">
                          {param.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(ep.method) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Request Body</h3>
                  {requestBodyExample && (
                    <button
                      onClick={() => setRequestBody(requestBodyExample)}
                      className="text-primary text-xs hover:underline"
                    >
                      Reset to example
                    </button>
                  )}
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="Enter JSON request body"
                  rows={8}
                  className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            )}
          </TabsContent>

          {/* Test Tab */}
          <TabsContent
            value="test"
            className="flex-1 space-y-6 overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Send Request</h3>
              <button
                onClick={handleTryIt}
                disabled={
                  isLoading || (currentEndpointRequiresAuth && !apiToken.trim())
                }
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                  isLoading || (currentEndpointRequiresAuth && !apiToken.trim())
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Send className="h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>

            {/* Request Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">
                Request Details
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <strong>Method:</strong> {ep.method}
                </p>
                <p>
                  <strong>Endpoint:</strong> {ep.path}
                </p>
                <p>
                  <strong>Authentication:</strong>{' '}
                  {currentEndpointRequiresAuth ? 'Required' : 'Not Required'}
                </p>
                {currentEndpointRequiresAuth && !apiToken.trim() && (
                  <p className="mt-2 text-amber-700">
                    ⚠️ API token required to test this endpoint
                  </p>
                )}
              </div>
            </div>

            {/* Response */}
            {(response || isLoading || responseError) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Response</h4>
                  {responseStatus && (
                    <Badge
                      variant={
                        responseStatus >= 200 && responseStatus < 300
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {responseStatus}
                    </Badge>
                  )}
                </div>

                {responseError && (
                  <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
                    <div className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-destructive/80 mt-1 text-sm">
                      {responseError}
                    </p>
                  </div>
                )}

                <div className="overflow-hidden rounded-lg border">
                  <div className="bg-muted flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium">Response Body</span>
                    {response && (
                      <button
                        onClick={() => handleCopy(response)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="bg-background p-4">
                    {isLoading ? (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        <span className="text-sm">Sending request...</span>
                      </div>
                    ) : response ? (
                      <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                        {response}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No response yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Code Example</h3>
                <button
                  onClick={() => handleCopy(getCodeExample())}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="bg-muted px-4 py-2">
                  <span className="text-sm font-medium">cURL</span>
                </div>
                <div className="bg-background p-4">
                  <pre className="overflow-x-auto font-mono text-sm">
                    {getCodeExample()}
                  </pre>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">Quick Tips</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {currentEndpointRequiresAuth && (
                    <li>
                      • Replace YOUR_API_TOKEN_HERE with your actual token
                    </li>
                  )}
                  {!currentEndpointRequiresAuth && (
                    <li>• This endpoint does not require authentication</li>
                  )}
                  <li>• Check the response status code for success/error</li>
                  <li>
                    • Request body should be valid JSON for POST/PUT/PATCH
                  </li>
                  {currentEndpointRequiresAuth && (
                    <li>• Get your API token by logging in first</li>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
