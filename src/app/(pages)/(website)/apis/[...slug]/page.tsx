'use client';
import { useOpenAPI } from '../components/openapi-context';
import { EndpointPage } from '../components/endpoint-page';
import { useParams, notFound } from 'next/navigation';

// Function to match a URL path with OpenAPI paths that may contain parameters
function findMatchingPath(
  requestedPath: string,
  openApiPaths: Record<string, any>
) {
  // First try exact match
  if (openApiPaths[requestedPath]) {
    return requestedPath;
  }

  // Then try to match with parameter substitution
  for (const apiPath in openApiPaths) {
    // Convert OpenAPI path to regex pattern
    const pattern = apiPath.replace(/\{[^}]+\}/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(requestedPath)) {
      return apiPath;
    }
  }
  return null;
}

// Helper to generate example from schema
function generateExampleFromSchema(
  schema: any,
  components?: any,
  visited: Set<string> = new Set()
): any {
  if (!schema) return {};

  if (schema.example) return schema.example;

  // Resolve $ref if present
  if (schema.$ref && components?.schemas) {
    const refName = schema.$ref.split('/').pop();

    // Check for circular references
    if (visited.has(refName)) {
      // Return a basic example to avoid infinite recursion
      return { id: 'circular-reference-detected' };
    }

    const resolvedSchema = components.schemas[refName];
    if (resolvedSchema) {
      visited.add(refName);
      const result = generateExampleFromSchema(
        resolvedSchema,
        components,
        visited
      );
      visited.delete(refName);
      return result;
    }
  }

  // Handle allOf, anyOf, oneOf
  if (schema.allOf && schema.allOf.length > 0) {
    const mergedExample = {};
    schema.allOf.forEach((subSchema: any) => {
      const subExample = generateExampleFromSchema(
        subSchema,
        components,
        visited
      );
      Object.assign(mergedExample, subExample);
    });
    return mergedExample;
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateExampleFromSchema(schema.anyOf[0], components, visited);
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateExampleFromSchema(schema.oneOf[0], components, visited);
  }

  if (schema.type === 'object' && schema.properties) {
    const example: any = {};
    for (const [key, value] of Object.entries(
      schema.properties as Record<string, any>
    )) {
      const prop = value as any;
      if (prop.example !== undefined) {
        example[key] = prop.example;
      } else if (prop.type === 'string') {
        // Generate meaningful string examples based on property name
        if (key.toLowerCase().includes('id')) {
          example[key] = '123e4567-e89b-12d3-a456-426614174000';
        } else if (key.toLowerCase().includes('email')) {
          example[key] = 'user@example.com';
        } else if (key.toLowerCase().includes('name')) {
          example[key] = 'John Doe';
        } else if (key.toLowerCase().includes('title')) {
          example[key] = 'Sample Title';
        } else if (key.toLowerCase().includes('description')) {
          example[key] = 'Sample description text';
        } else if (key.toLowerCase().includes('url')) {
          example[key] = 'https://example.com';
        } else if (
          key.toLowerCase().includes('date') ||
          key.toLowerCase().includes('time')
        ) {
          example[key] = '2024-01-15T10:30:00Z';
        } else if (key.toLowerCase().includes('status')) {
          example[key] = 'active';
        } else if (key.toLowerCase().includes('type')) {
          example[key] = 'default';
        } else if (key.toLowerCase().includes('code')) {
          example[key] = 'SUCCESS';
        } else if (key.toLowerCase().includes('message')) {
          example[key] = 'Operation completed successfully';
        } else if (key.toLowerCase().includes('error')) {
          example[key] = null;
        } else {
          example[key] = 'sample_string';
        }
      } else if (prop.type === 'number' || prop.type === 'integer') {
        if (
          key.toLowerCase().includes('count') ||
          key.toLowerCase().includes('total')
        ) {
          example[key] = 100;
        } else if (key.toLowerCase().includes('page')) {
          example[key] = 1;
        } else if (key.toLowerCase().includes('limit')) {
          example[key] = 20;
        } else if (
          key.toLowerCase().includes('score') ||
          key.toLowerCase().includes('rating')
        ) {
          example[key] = 4.5;
        } else if (
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('amount')
        ) {
          example[key] = 99.99;
        } else {
          example[key] = 0;
        }
      } else if (prop.type === 'boolean') {
        if (key.toLowerCase().includes('success')) {
          example[key] = true;
        } else if (
          key.toLowerCase().includes('active') ||
          key.toLowerCase().includes('enabled')
        ) {
          example[key] = true;
        } else if (
          key.toLowerCase().includes('deleted') ||
          key.toLowerCase().includes('disabled')
        ) {
          example[key] = false;
        } else {
          example[key] = true;
        }
      } else if (prop.type === 'array') {
        if (prop.items) {
          const itemExample = generateExampleFromSchema(
            prop.items,
            components,
            visited
          );
          example[key] = [itemExample];
        } else {
          example[key] = [];
        }
      } else if (prop.$ref) {
        // For referenced schemas, try to resolve and generate example
        if (components?.schemas) {
          const refName = prop.$ref.split('/').pop();

          // Check for circular references
          if (visited.has(refName)) {
            example[key] = { id: 'circular-reference-detected' };
          } else {
            const resolvedSchema = components.schemas[refName];
            if (resolvedSchema) {
              visited.add(refName);
              example[key] = generateExampleFromSchema(
                resolvedSchema,
                components,
                visited
              );
              visited.delete(refName);
            } else {
              // Fallback to basic object structure based on ref name
              if (refName?.toLowerCase().includes('user')) {
                example[key] = {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'John Doe',
                  email: 'john@example.com',
                };
              } else if (refName?.toLowerCase().includes('category')) {
                example[key] = {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'Sample Category',
                  description: 'Sample category description',
                };
              } else if (refName?.toLowerCase().includes('partner')) {
                example[key] = {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  companyName: 'Sample Company',
                  status: 'active',
                };
              } else {
                example[key] = {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'Sample Item',
                };
              }
            }
          }
        } else {
          // Fallback when components not available
          example[key] = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Sample Item',
          };
        }
      } else {
        example[key] = null;
      }
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

  if (schema.type === 'string') return 'sample_string';
  if (schema.type === 'number' || schema.type === 'integer') return 0;
  if (schema.type === 'boolean') return true;

  return {};
}

// Helper to resolve $ref parameters
function resolveParameter(param: any, components: any): any {
  if (param.$ref && components?.parameters) {
    // $ref is like '#/components/parameters/ISupportPartnerIdParams'
    const refName = param.$ref.split('/').pop();
    return components.parameters[refName] || param;
  }
  return param;
}

// Helper to resolve $ref schemas
function resolveSchema(schema: any, components: any): any {
  if (schema.$ref && components?.schemas) {
    // $ref is like '#/components/schemas/User'
    const refName = schema.$ref.split('/').pop();
    return components.schemas[refName] || schema;
  }
  return schema;
}

export default function DynamicEndpointPage() {
  const params = useParams() as { slug?: string[] };
  const { loading, error, data } = useOpenAPI();

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading endpoint...</div>
    );
  }
  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load API documentation
      </div>
    );
  }
  if (!params?.slug) {
    notFound();
  }

  // Find the endpoint in OpenAPI JSON
  const requestedPath = '/' + params.slug.join('/');
  const matchedPath = findMatchingPath(requestedPath, data.paths);
  if (!matchedPath) {
    notFound();
  }
  const pathObj = data.paths[matchedPath];
  if (!pathObj) {
    notFound();
  }
  // Prefer GET > POST > PUT > DELETE > PATCH if multiple methods
  const preferred = ['get', 'post', 'put', 'delete', 'patch'];
  let method = preferred.find((m) => pathObj[m]);
  if (!method) {
    // fallback to any available method
    method = Object.keys(pathObj)[0];
  }
  if (!method) {
    notFound();
  }
  const op = pathObj[method];

  // Merge path-level and operation-level parameters, resolving $ref
  const allParams = [
    ...(data.paths[matchedPath].parameters || []),
    ...(op.parameters || []),
  ].map((p: any) => resolveParameter(p, data.components));

  // Transform OpenAPI operation to EndpointPage shape
  const endpoint = {
    path: matchedPath, // Use the original OpenAPI path, not the requested path
    method: method.toUpperCase(),
    title: op.summary || matchedPath,
    description: op.description || '',
    scope: op.security ? Object.keys(op.security[0] || {})[0] : undefined,
    parameters: allParams.map((p: any) => ({
      name: p.name || '(unnamed)',
      in: p.in || 'query', // default to query if missing
      type: p.schema?.type || p.type || 'string',
      required: p.required || false,
      description: p.description || '',
      example:
        p.example !== undefined
          ? p.example
          : p.schema?.example !== undefined
            ? p.schema.example
            : 'N/A',
    })),
    requestBody: op.requestBody
      ? {
          type:
            Object.keys(op.requestBody.content || {})[0] || 'application/json',
          description:
            op.requestBody.description ||
            op.requestBody.content?.['application/json']?.schema?.description ||
            '',
          example: (() => {
            // Try to get explicit example first
            let example =
              op.requestBody.content?.['application/json']?.example ||
              op.requestBody.content?.['application/json']?.examples?.default
                ?.value;

            // If no explicit example, generate one from schema
            if (
              !example &&
              op.requestBody.content?.['application/json']?.schema
            ) {
              const resolvedSchema = resolveSchema(
                op.requestBody.content['application/json'].schema,
                data.components
              );
              example = generateExampleFromSchema(
                resolvedSchema,
                data.components,
                new Set()
              );
            }

            // Return as formatted JSON string if we have an example
            if (example) {
              return typeof example === 'string'
                ? example
                : JSON.stringify(example, null, 2);
            }

            return '';
          })(),
        }
      : undefined,
    responses: Object.entries(op.responses || {}).map(([code, resp]: any) => {
      // Try to get example from response content
      let example =
        resp.content?.['application/json']?.example ||
        resp.content?.['application/json']?.examples?.default?.value ||
        resp.content?.['application/json']?.examples?.['200']?.value ||
        resp.content?.['application/json']?.examples?.['success']?.value;

      // If no example, generate one from schema
      if (!example && resp.content?.['application/json']?.schema) {
        const resolvedSchema = resolveSchema(
          resp.content['application/json'].schema,
          data.components
        );
        example = generateExampleFromSchema(
          resolvedSchema,
          data.components,
          new Set()
        );
      }

      // Only include example if it's not empty
      const exampleString = example ? JSON.stringify(example, null, 2) : '';
      const hasValidExample =
        exampleString &&
        exampleString !== '{}' &&
        exampleString !== '[]' &&
        exampleString !== '""' &&
        exampleString !== 'null';

      return {
        code: Number(code),
        description: resp.description || '',
        example: hasValidExample ? exampleString : undefined,
      };
    }),
  };

  return <EndpointPage endpoint={endpoint} />;
}
