'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code2,
  Network,
  Shield,
  Globe,
  Zap,
  ExternalLink,
  ArrowRight,
  FileCode,
  Workflow,
  Cloud,
  Database,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GuideCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link?: string;
  tags?: string[];
}

function GuideCard({
  title,
  description,
  icon: Icon,
  link,
  tags,
}: GuideCardProps) {
  return (
    <Card className="group border-border bg-card hover:border-primary/50 relative overflow-hidden border p-6 transition-all hover:shadow-lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="bg-primary/10 rounded-lg p-3 transition-transform group-hover:scale-110">
            <Icon className="text-primary h-6 w-6" />
          </div>
          {link && (
            <ExternalLink className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {link && (
          <div className="pt-2">
            <Link
              href={link}
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              View documentation
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export function ApiDocsLanding() {
  const [activeTab, setActiveTab] = useState('api');

  const apiFeatures = [
    {
      title: 'RESTful API',
      description:
        'Access all platform features through our comprehensive REST API with predictable resource-oriented URLs.',
      icon: Code2,
      tags: ['REST', 'JSON', 'HTTP'],
    },
    {
      title: 'Authentication',
      description:
        'Secure your requests with Bearer token authentication and API key management.',
      icon: Shield,
      tags: ['JWT', 'OAuth2', 'API Keys'],
    },
    {
      title: 'Webhooks',
      description:
        'Receive real-time notifications about events happening in your Teamcast account.',
      icon: Workflow,
      tags: ['Events', 'Real-time', 'Callbacks'],
    },
    {
      title: 'SDKs & Libraries',
      description:
        'Official SDKs for popular programming languages to integrate faster.',
      icon: FileCode,
      tags: ['Node.js', 'Python', 'Go'],
    },
  ];

  const mcpFeatures = [
    {
      title: 'Model Context Protocol',
      description:
        'Connect AI assistants to your Teamcast data and workflows with standardized context sharing.',
      icon: Network,
      tags: ['AI', 'Claude', 'Context'],
    },
    {
      title: 'Context Servers',
      description:
        'Build custom MCP servers to expose your recruiting data to AI assistants securely.',
      icon: Database,
      tags: ['Server', 'TypeScript', 'Python'],
    },
    {
      title: 'AI Tool Integration',
      description:
        'Enable Claude and other AI assistants to perform actions in Teamcast on your behalf.',
      icon: Cloud,
      tags: ['Tools', 'Actions', 'Automation'],
    },
    {
      title: 'Secure Prompting',
      description:
        'Control what data AI assistants can access with fine-grained permissions and context controls.',
      icon: Lock,
      tags: ['Security', 'Permissions', 'Privacy'],
    },
  ];

  const a2aFeatures = [
    {
      title: 'Agent-to-Agent Protocol',
      description:
        'Enable AI agents to communicate and collaborate on complex recruiting workflows.',
      icon: Network,
      tags: ['Agents', 'Collaboration', 'Workflows'],
    },
    {
      title: 'Multi-Agent Systems',
      description:
        'Orchestrate multiple AI agents to handle different aspects of the hiring process.',
      icon: Workflow,
      tags: ['Orchestration', 'Coordination', 'Tasks'],
    },
    {
      title: 'Agent Discovery',
      description:
        'Publish and discover specialized agents for screening, interviewing, and candidate matching.',
      icon: Globe,
      tags: ['Registry', 'Discovery', 'Marketplace'],
    },
    {
      title: 'Interoperability',
      description:
        'Connect Teamcast agents with external AI systems using standardized protocols.',
      icon: CheckCircle2,
      tags: ['Standards', 'Integration', 'APIs'],
    },
  ];

  const quickStartSteps = {
    api: [
      {
        step: 1,
        title: 'Get API Key',
        description: 'Generate your API key from dashboard settings',
      },
      {
        step: 2,
        title: 'Make First Request',
        description: 'Test authentication with a simple GET request',
      },
      {
        step: 3,
        title: 'Explore Endpoints',
        description: 'Browse available endpoints and try them out',
      },
    ],
    mcp: [
      {
        step: 1,
        title: 'Install MCP SDK',
        description: 'npm install @anthropic-ai/sdk',
      },
      {
        step: 2,
        title: 'Configure Server',
        description: 'Set up your context server with Teamcast credentials',
      },
      {
        step: 3,
        title: 'Connect Claude',
        description: 'Enable MCP in Claude Desktop or API',
      },
    ],
    a2a: [
      {
        step: 1,
        title: 'Agent Registration',
        description: 'Register your agent in the Teamcast agent registry',
      },
      {
        step: 2,
        title: 'Define Capabilities',
        description: 'Specify what your agent can do using A2A schema',
      },
      {
        step: 3,
        title: 'Start Collaboration',
        description: 'Begin coordinating with other agents',
      },
    ],
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        className="space-y-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
          <BookOpen className="h-4 w-4" />
          Developer Documentation
        </div>

        <div className="space-y-4">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Build with Teamcast
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            Powerful APIs, AI-native integrations, and agent protocols to extend
            your recruiting platform
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/20 px-3 py-1"
          >
            <Zap className="mr-1 h-3 w-3" />
            Production Ready
          </Badge>
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/20 px-3 py-1"
          >
            <Shield className="mr-1 h-3 w-3" />
            Enterprise Security
          </Badge>
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/20 px-3 py-1"
          >
            <Globe className="mr-1 h-3 w-3" />
            99.9% Uptime
          </Badge>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-3 p-1">
          <TabsTrigger value="api" className="flex items-center gap-2 py-3">
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">REST API</span>
            <span className="sm:hidden">API</span>
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center gap-2 py-3">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">MCP Protocol</span>
            <span className="sm:hidden">MCP</span>
          </TabsTrigger>
          <TabsTrigger value="a2a" className="flex items-center gap-2 py-3">
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">A2A Protocol</span>
            <span className="sm:hidden">A2A</span>
          </TabsTrigger>
        </TabsList>

        {/* API Documentation Tab */}
        <TabsContent value="api" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-muted/50 border-border mb-8 rounded-2xl border p-8">
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 rounded-xl p-4">
                  <Code2 className="text-primary h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-foreground mb-3 text-2xl font-bold">
                    REST API Documentation
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Build custom integrations, automate workflows, and extend
                    Teamcast with our comprehensive REST API. Access candidates,
                    jobs, interviews, analytics, and more.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/apis/reference">
                        Browse API Reference
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/apis/quickstart">Quick Start Guide</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {apiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GuideCard {...feature} />
                </motion.div>
              ))}
            </div>

            {/* Quick Start */}
            <div className="bg-card border-border mt-8 rounded-xl border p-8">
              <h3 className="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
                <Zap className="text-primary h-5 w-5" />
                Quick Start
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {quickStartSteps.api.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-foreground mb-1 font-semibold">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-muted/50 border-border rounded-xl border p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                What you can build with REST API
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Custom recruiting dashboards
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Build tailored analytics and reporting interfaces
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Automated candidate workflows
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Sync candidates across your HR tech stack
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Interview scheduling automation
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Integrate with calendar and communication tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Recruitment analytics platform
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Extract and analyze hiring data for insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* MCP Documentation Tab */}
        <TabsContent value="mcp" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-muted/50 border-border mb-8 rounded-2xl border p-8">
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 rounded-xl p-4">
                  <Network className="text-primary h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-foreground mb-3 text-2xl font-bold">
                    Model Context Protocol (MCP)
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Enable AI assistants like Claude to understand and interact
                    with your Teamcast data. MCP provides a standardized way to
                    give AI context about your recruiting pipeline.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/apis/mcp/overview">
                        MCP Documentation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href="https://modelcontextprotocol.io"
                        target="_blank"
                      >
                        Learn about MCP
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {mcpFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GuideCard {...feature} />
                </motion.div>
              ))}
            </div>

            {/* Quick Start */}
            <div className="bg-card border-border mt-8 rounded-xl border p-8">
              <h3 className="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
                <Zap className="text-primary h-5 w-5" />
                Quick Start with MCP
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {quickStartSteps.mcp.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-foreground mb-1 font-semibold">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-muted/50 border-border rounded-xl border p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                What you can build with MCP
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      AI-powered candidate screening
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Let Claude analyze resumes and match candidates to jobs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Interview scheduling assistant
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Automate interview scheduling with AI coordination
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Intelligent job descriptions
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Generate optimized job posts based on company data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Analytics insights
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Ask Claude to analyze your recruiting metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* A2A Documentation Tab */}
        <TabsContent value="a2a" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-muted/50 border-border mb-8 rounded-2xl border p-8">
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 rounded-xl p-4">
                  <Workflow className="text-primary h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-foreground mb-3 text-2xl font-bold">
                    Agent-to-Agent Protocol (A2A)
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Build autonomous AI agent systems that collaborate to handle
                    complex recruiting workflows. Enable agents to discover,
                    communicate, and coordinate with each other.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/a2a-demo">
                        Try Live Demo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/apis/a2a/overview">A2A Documentation</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {a2aFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GuideCard {...feature} />
                </motion.div>
              ))}
            </div>

            {/* Quick Start */}
            <div className="bg-card border-border mt-8 rounded-xl border p-8">
              <h3 className="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
                <Zap className="text-primary h-5 w-5" />
                Quick Start with A2A
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {quickStartSteps.a2a.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-foreground mb-1 font-semibold">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Examples */}
            <div className="bg-muted/50 border-border rounded-xl border p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                Example Agent Workflows
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Screening → Interview → Offer
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Three agents coordinate candidate progression
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Multi-channel sourcing
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Agents source from LinkedIn, GitHub, and job boards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Automated reference checks
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Agent coordinates and aggregates reference feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">
                      Team collaboration workflows
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Agents manage stakeholder feedback and decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Resources Section */}
      <motion.div
        className="bg-card border-border rounded-xl border p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-foreground mb-6 text-2xl font-bold">
          Additional Resources
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/apis/changelog"
            className="group border-border hover:border-primary/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <FileCode className="text-primary mt-0.5 h-5 w-5" />
            <div>
              <h4 className="text-foreground group-hover:text-primary mb-1 font-semibold transition-colors">
                Changelog
              </h4>
              <p className="text-muted-foreground text-sm">
                Latest API updates and changes
              </p>
            </div>
          </Link>

          <Link
            href="/support"
            className="group border-border hover:border-primary/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <Shield className="text-primary mt-0.5 h-5 w-5" />
            <div>
              <h4 className="text-foreground group-hover:text-primary mb-1 font-semibold transition-colors">
                Support
              </h4>
              <p className="text-muted-foreground text-sm">
                Get help from our team
              </p>
            </div>
          </Link>

          <Link
            href="/apis/status"
            className="group border-border hover:border-primary/50 hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <Zap className="text-primary mt-0.5 h-5 w-5" />
            <div>
              <h4 className="text-foreground group-hover:text-primary mb-1 font-semibold transition-colors">
                API Status
              </h4>
              <p className="text-muted-foreground text-sm">
                Check system status and uptime
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
