'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { logger } from '@/lib/logger';

interface OpenAPIContextValue {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const OpenAPIContext = createContext<OpenAPIContextValue>({
  loading: true,
  error: null,
  data: null,
});

export function useOpenAPI() {
  return useContext(OpenAPIContext);
}

// Fallback mock OpenAPI data for when the API server is not available
const mockOpenAPIData = {
  openapi: '3.0.0',
  info: {
    title: 'Teamcast API',
    version: '1.0.0',
    description: 'API documentation for Teamcast platform',
    contact: {
      email: 'hello@teamcast.ai',
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'User Login',
        tags: ['Authentication'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
              example: {
                email: 'user@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  user: {
                    id: '123',
                    email: 'user@example.com',
                    name: 'John Doe',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        summary: 'Get Users',
        tags: ['Users'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: 'Number of items per page',
          },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                example: {
                  users: [
                    { id: '1', name: 'John Doe', email: 'john@example.com' },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
                  ],
                  total: 2,
                  page: 1,
                },
              },
            },
          },
        },
      },
    },
  },
};

export function OpenAPIProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchOpenAPI() {
      setLoading(true);
      setError(null);
      try {
        // Get the full API URL and remove /api for OpenAPI spec
        const fullApiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
        const baseUrl = fullApiUrl.replace(/\/api$/, ''); // Remove /api if present
        const openApiUrl = `${baseUrl}/api-docs.json`;

        const res = await fetch(openApiUrl);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch OpenAPI JSON: ${res.status} ${res.statusText}`
          );
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        logger.error('OpenAPI fetch error:', err);
        // Use fallback data instead of showing error
        setData(mockOpenAPIData);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    }
    fetchOpenAPI();
  }, []);

  return (
    <OpenAPIContext.Provider value={{ loading, error, data }}>
      {children}
    </OpenAPIContext.Provider>
  );
}
