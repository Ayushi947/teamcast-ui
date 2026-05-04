'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Copy,
  Check,
  Shield,
  Zap,
  Globe,
  Settings,
  Book,
  Download,
  CheckCircle,
  Info,
  Terminal,
  FileText,
  Users,
  Building,
  Search,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  category: string;
  authentication: boolean;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  examples: Example[];
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

interface RequestBody {
  type: string;
  description: string;
  schema: object;
  example: object;
}

interface Response {
  code: number;
  description: string;
  schema?: object;
  example?: object;
}

interface Example {
  title: string;
  description: string;
  request: string;
  response: string;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'get-candidate-profile',
    method: 'GET',
    path: '/api/v1/candidates/{id}',
    summary: 'Get Candidate Profile',
    description: 'Retrieve detailed information about a specific candidate',
    category: 'Candidates',
    authentication: true,
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Unique identifier of the candidate',
        example: 'cand_123456789',
      },
    ],
    responses: [
      {
        code: 200,
        description: 'Candidate profile retrieved successfully',
        example: {
          id: 'cand_123456789',
          name: 'John Doe',
          email: 'john@example.com',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: 5,
          location: 'San Francisco, CA',
        },
      },
      {
        code: 404,
        description: 'Candidate not found',
      },
    ],
    examples: [
      {
        title: 'Basic Request',
        description: 'Get a candidate profile by ID',
        request: `curl -X GET "http://localhost:4300/api/candidates/cand_123456789" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
        response: `{
  "id": "cand_123456789",
  "name": "John Doe",
  "email": "john@example.com",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": 5,
  "location": "San Francisco, CA",
  "created_at": "2024-01-15T10:00:00Z"
}`,
      },
    ],
  },
  {
    id: 'create-job-posting',
    method: 'POST',
    path: '/api/v1/jobs',
    summary: 'Create Job Posting',
    description: 'Create a new job posting with AI-powered candidate matching',
    category: 'Jobs',
    authentication: true,
    requestBody: {
      type: 'application/json',
      description: 'Job posting details',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          requirements: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          salary_range: { type: 'object' },
        },
      },
      example: {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced frontend developer...',
        requirements: ['5+ years React experience', 'TypeScript proficiency'],
        location: 'Remote',
        salary_range: { min: 120000, max: 180000 },
      },
    },
    responses: [
      {
        code: 201,
        description: 'Job posting created successfully',
        example: {
          id: 'job_987654321',
          title: 'Senior Frontend Developer',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
        },
      },
      {
        code: 400,
        description: 'Invalid request data',
      },
    ],
    examples: [
      {
        title: 'Create Job Posting',
        description: 'Create a new job posting with all required fields',
        request: `curl -X POST "https://api.teamcast.ai/v1/jobs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Senior Frontend Developer",
    "description": "We are looking for an experienced frontend developer...",
    "requirements": ["5+ years React experience", "TypeScript proficiency"],
    "location": "Remote",
    "salary_range": {"min": 120000, "max": 180000}
  }'`,
        response: `{
  "id": "job_987654321",
  "title": "Senior Frontend Developer",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z",
  "ai_matching_enabled": true
}`,
      },
    ],
  },
  {
    id: 'get-ai-matches',
    method: 'GET',
    path: '/api/v1/jobs/{id}/matches',
    summary: 'Get AI Candidate Matches',
    description: 'Retrieve AI-powered candidate matches for a specific job',
    category: 'AI Matching',
    authentication: true,
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Job posting ID',
        example: 'job_987654321',
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of matches to return (default: 10)',
        example: '20',
      },
      {
        name: 'min_score',
        type: 'number',
        required: false,
        description: 'Minimum matching score (0-100)',
        example: '80',
      },
    ],
    responses: [
      {
        code: 200,
        description: 'AI matches retrieved successfully',
        example: {
          matches: [
            {
              candidate_id: 'cand_123456789',
              score: 95,
              reasons: ['Strong React experience', 'TypeScript expertise'],
              candidate: {
                name: 'John Doe',
                skills: ['JavaScript', 'React', 'TypeScript'],
              },
            },
          ],
          total: 1,
          page: 1,
        },
      },
    ],
    examples: [
      {
        title: 'Get Top Matches',
        description: 'Get the top 10 AI-powered candidate matches',
        request: `curl -X GET "http://localhost:4300/api/jobs/job_987654321/matches?limit=10&min_score=80" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "matches": [
    {
      "candidate_id": "cand_123456789",
      "score": 95,
      "reasons": ["Strong React experience", "TypeScript expertise"],
      "candidate": {
        "name": "John Doe",
        "skills": ["JavaScript", "React", "TypeScript"]
      }
    }
  ],
  "total": 1,
  "page": 1
}`,
      },
    ],
  },
];

const categories = [
  { id: 'all', name: 'All Endpoints', icon: Globe },
  { id: 'Authentication', name: 'Authentication', icon: Shield },
  { id: 'Candidates', name: 'Candidates', icon: Users },
  { id: 'Jobs', name: 'Jobs', icon: Building },
  { id: 'AI Matching', name: 'AI Matching', icon: Zap },
  { id: 'Applications', name: 'Applications', icon: FileText },
  { id: 'Assessments', name: 'Assessments', icon: CheckCircle },
  { id: 'Webhooks', name: 'Webhooks', icon: Settings },
];

export default function ApiDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || endpoint.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500';
      case 'POST':
        return 'bg-green-500';
      case 'PUT':
        return 'bg-yellow-500';
      case 'DELETE':
        return 'bg-red-500';
      case 'PATCH':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold">API Documentation</h1>
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Build powerful integrations with Teamcast&apos;s AI-powered
              recruitment platform
            </p>
          </motion.div>
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">1. Get Your API Key</h3>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Generate your API key from the developer dashboard
                  </p>
                  <div className="bg-background rounded-lg p-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {showApiKey
                          ? 'tc_live_1234567890abcdef...'
                          : 'tc_live_••••••••••••••••'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              'tc_live_1234567890abcdef...',
                              'api-key'
                            )
                          }
                        >
                          {copiedCode === 'api-key' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    2. Make Your First Request
                  </h3>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Test the API with a simple GET request
                  </p>
                  <div className="bg-background rounded-lg p-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        curl -H &quot;Authorization: Bearer...&quot;
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            'curl -H &quot;Authorization: Bearer tc_live_1234567890abcdef...&quot; https://api.teamcast.ai/v1/candidates',
                            'first-request'
                          )
                        }
                      >
                        {copiedCode === 'first-request' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search endpoints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? 'default' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="mr-2 h-4 w-4" />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resources</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      OpenAPI Spec
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Book className="mr-2 h-4 w-4" />
                      SDK Documentation
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Terminal className="mr-2 h-4 w-4" />
                      Postman Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Endpoints List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">API Endpoints</h2>
                  <Badge variant="outline">
                    {filteredEndpoints.length} endpoints
                  </Badge>
                </div>

                {filteredEndpoints.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-medium">
                        No endpoints found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or category filter
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredEndpoints.map((endpoint, index) => (
                      <motion.div
                        key={endpoint.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-0">
                            <div
                              className="hover:bg-muted/50 cursor-pointer p-6 transition-colors"
                              onClick={() =>
                                setSelectedEndpoint(
                                  selectedEndpoint === endpoint.id
                                    ? null
                                    : endpoint.id
                                )
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${getMethodColor(endpoint.method)} text-white`}
                                    >
                                      {endpoint.method}
                                    </Badge>
                                    <code className="bg-muted rounded px-2 py-1 text-sm">
                                      {endpoint.path}
                                    </code>
                                  </div>
                                  {endpoint.authentication && (
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1"
                                    >
                                      <Shield className="h-3 w-3" />
                                      Auth Required
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {endpoint.category}
                                  </Badge>
                                  {selectedEndpoint === endpoint.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-3">
                                <h3 className="font-semibold">
                                  {endpoint.summary}
                                </h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {endpoint.description}
                                </p>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {selectedEndpoint === endpoint.id && (
                              <div className="border-t">
                                <Tabs defaultValue="overview" className="p-6">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">
                                      Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="parameters">
                                      Parameters
                                    </TabsTrigger>
                                    <TabsTrigger value="examples">
                                      Examples
                                    </TabsTrigger>
                                    <TabsTrigger value="responses">
                                      Responses
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="overview"
                                    className="space-y-4"
                                  >
                                    <div>
                                      <h4 className="mb-2 font-semibold">
                                        Description
                                      </h4>
                                      <p className="text-muted-foreground text-sm">
                                        {endpoint.description}
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="mb-2 font-semibold">
                                        Endpoint
                                      </h4>
                                      <div className="bg-muted rounded-lg p-4">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            className={`${getMethodColor(endpoint.method)} text-white`}
                                          >
                                            {endpoint.method}
                                          </Badge>
                                          <code className="text-sm">
                                            https://api.teamcast.ai
                                            {endpoint.path}
                                          </code>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent
                                    value="parameters"
                                    className="space-y-4"
                                  >
                                    {endpoint.parameters &&
                                    endpoint.parameters.length > 0 ? (
                                      <div className="space-y-4">
                                        <h4 className="font-semibold">
                                          Path Parameters
                                        </h4>
                                        <div className="space-y-3">
                                          {endpoint.parameters.map((param) => (
                                            <div
                                              key={param.name}
                                              className="rounded-lg border p-4"
                                            >
                                              <div className="mb-2 flex items-center gap-2">
                                                <code className="text-sm font-medium">
                                                  {param.name}
                                                </code>
                                                <Badge variant="outline">
                                                  {param.type}
                                                </Badge>
                                                {param.required && (
                                                  <Badge
                                                    variant="destructive"
                                                    className="text-xs"
                                                  >
                                                    Required
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-muted-foreground mb-2 text-sm">
                                                {param.description}
                                              </p>
                                              {param.example && (
                                                <div className="bg-muted rounded p-2">
                                                  <code className="text-xs">
                                                    Example: {param.example}
                                                  </code>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="py-8 text-center">
                                        <Info className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground">
                                          No parameters required
                                        </p>
                                      </div>
                                    )}

                                    {endpoint.requestBody && (
                                      <div className="space-y-4">
                                        <h4 className="font-semibold">
                                          Request Body
                                        </h4>
                                        <div className="rounded-lg border p-4">
                                          <div className="mb-2 flex items-center gap-2">
                                            <Badge variant="outline">
                                              {endpoint.requestBody.type}
                                            </Badge>
                                          </div>
                                          <p className="text-muted-foreground mb-3 text-sm">
                                            {endpoint.requestBody.description}
                                          </p>
                                          <div className="bg-muted rounded-lg p-3">
                                            <pre className="overflow-x-auto text-xs">
                                              <code>
                                                {JSON.stringify(
                                                  endpoint.requestBody.example,
                                                  null,
                                                  2
                                                )}
                                              </code>
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent
                                    value="examples"
                                    className="space-y-4"
                                  >
                                    {endpoint.examples.map((example, idx) => (
                                      <div key={idx} className="space-y-4">
                                        <div>
                                          <h4 className="font-semibold">
                                            {example.title}
                                          </h4>
                                          <p className="text-muted-foreground text-sm">
                                            {example.description}
                                          </p>
                                        </div>

                                        <div className="space-y-3">
                                          <div>
                                            <div className="mb-2 flex items-center justify-between">
                                              <h5 className="text-sm font-medium">
                                                Request
                                              </h5>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  copyToClipboard(
                                                    example.request,
                                                    `request-${idx}`
                                                  )
                                                }
                                              >
                                                {copiedCode ===
                                                `request-${idx}` ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  <Copy className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </div>
                                            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
                                              <pre className="text-sm">
                                                <code>{example.request}</code>
                                              </pre>
                                            </div>
                                          </div>

                                          <div>
                                            <div className="mb-2 flex items-center justify-between">
                                              <h5 className="text-sm font-medium">
                                                Response
                                              </h5>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  copyToClipboard(
                                                    example.response,
                                                    `response-${idx}`
                                                  )
                                                }
                                              >
                                                {copiedCode ===
                                                `response-${idx}` ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  <Copy className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </div>
                                            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
                                              <pre className="text-sm">
                                                <code>{example.response}</code>
                                              </pre>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </TabsContent>

                                  <TabsContent
                                    value="responses"
                                    className="space-y-4"
                                  >
                                    <div className="space-y-3">
                                      {endpoint.responses.map(
                                        (response, idx) => (
                                          <div
                                            key={idx}
                                            className="rounded-lg border p-4"
                                          >
                                            <div className="mb-2 flex items-center gap-2">
                                              <Badge
                                                variant={
                                                  response.code >= 200 &&
                                                  response.code < 300
                                                    ? 'default'
                                                    : 'destructive'
                                                }
                                              >
                                                {response.code}
                                              </Badge>
                                              <span className="font-medium">
                                                {response.description}
                                              </span>
                                            </div>
                                            {response.example && (
                                              <div className="bg-muted mt-3 rounded-lg p-3">
                                                <pre className="overflow-x-auto text-xs">
                                                  <code>
                                                    {JSON.stringify(
                                                      response.example,
                                                      null,
                                                      2
                                                    )}
                                                  </code>
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
