'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Download,
  FileText,
  Image,
  File,
  Search,
  Calendar,
  Eye,
  Star,
  Users,
  Building,
  Brain,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Clipboard,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DownloadResource {
  id: string;
  title: string;
  description: string;
  type:
    | 'pdf'
    | 'template'
    | 'checklist'
    | 'guide'
    | 'infographic'
    | 'worksheet';
  category: string;
  categoryIcon: React.ElementType;
  categoryColor: string;
  fileSize: string;
  pages?: number;
  downloads: number;
  rating: number;
  lastUpdated: string;
  author: string;
  tags: string[];
  featured?: boolean;
  downloadUrl: string;
  previewUrl?: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  resourceCount: number;
}

const resourceCategories: ResourceCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential guides for new users',
    icon: Lightbulb,
    color: 'text-emerald-600',
    resourceCount: 8,
  },
  {
    id: 'for-clients',
    name: 'For Clients',
    description: 'Hiring and recruitment resources',
    icon: Building,
    color: 'text-blue-600',
    resourceCount: 15,
  },
  {
    id: 'for-candidates',
    name: 'For Candidates',
    description: 'Job search and career resources',
    icon: Users,
    color: 'text-purple-600',
    resourceCount: 12,
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'Ready-to-use templates and forms',
    icon: Clipboard,
    color: 'text-orange-600',
    resourceCount: 10,
  },
  {
    id: 'checklists',
    name: 'Checklists',
    description: 'Step-by-step checklists and workflows',
    icon: CheckCircle,
    color: 'text-green-600',
    resourceCount: 7,
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    description: 'Data insights and reporting guides',
    icon: BarChart3,
    color: 'text-indigo-600',
    resourceCount: 6,
  },
];

const downloadResources: DownloadResource[] = [
  {
    id: 'complete-hiring-guide',
    title: 'Complete Hiring Guide 2024',
    description:
      'Comprehensive guide covering the entire hiring process from job posting to onboarding.',
    type: 'guide',
    category: 'For Clients',
    categoryIcon: Building,
    categoryColor: 'text-blue-600',
    fileSize: '2.4 MB',
    pages: 45,
    downloads: 8920,
    rating: 4.9,
    lastUpdated: '2024-01-15',
    author: 'Teamcast HR Team',
    tags: ['hiring', 'recruitment', 'process', 'best practices'],
    featured: true,
    downloadUrl: '/downloads/complete-hiring-guide-2024.pdf',
    previewUrl: '/downloads/preview/complete-hiring-guide-2024',
  },
  {
    id: 'candidate-profile-template',
    title: 'Professional Profile Template',
    description:
      'Customizable template to create a standout candidate profile that gets noticed.',
    type: 'template',
    category: 'For Candidates',
    categoryIcon: Users,
    categoryColor: 'text-purple-600',
    fileSize: '1.2 MB',
    pages: 8,
    downloads: 12450,
    rating: 4.8,
    lastUpdated: '2024-01-12',
    author: 'Career Specialists',
    tags: ['profile', 'template', 'candidates', 'optimization'],
    featured: true,
    downloadUrl: '/downloads/candidate-profile-template.pdf',
  },
  {
    id: 'interview-preparation-checklist',
    title: 'Interview Preparation Checklist',
    description:
      'Essential checklist to prepare for both AI and panel interviews.',
    type: 'checklist',
    category: 'For Candidates',
    categoryIcon: Users,
    categoryColor: 'text-purple-600',
    fileSize: '0.8 MB',
    pages: 4,
    downloads: 15670,
    rating: 4.7,
    lastUpdated: '2024-01-10',
    author: 'Interview Experts',
    tags: ['interview', 'preparation', 'checklist', 'tips'],
    featured: true,
    downloadUrl: '/downloads/interview-preparation-checklist.pdf',
  },
  {
    id: 'job-posting-template',
    title: 'High-Converting Job Posting Template',
    description: 'Proven template that increases application rates by 300%.',
    type: 'template',
    category: 'For Clients',
    categoryIcon: Building,
    categoryColor: 'text-blue-600',
    fileSize: '1.1 MB',
    pages: 6,
    downloads: 7890,
    rating: 4.6,
    lastUpdated: '2024-01-08',
    author: 'Recruitment Team',
    tags: ['job posting', 'template', 'conversion', 'clients'],
    downloadUrl: '/downloads/job-posting-template.pdf',
  },
  {
    id: 'ai-features-overview',
    title: 'AI Features Overview Infographic',
    description:
      'Visual guide to understanding all AI-powered features in Teamcast.',
    type: 'infographic',
    category: 'AI Features',
    categoryIcon: Brain,
    categoryColor: 'text-orange-600',
    fileSize: '3.2 MB',
    downloads: 5430,
    rating: 4.5,
    lastUpdated: '2024-01-05',
    author: 'AI Team',
    tags: ['AI', 'features', 'infographic', 'visual guide'],
    downloadUrl: '/downloads/ai-features-overview.pdf',
  },
  {
    id: 'onboarding-checklist',
    title: 'New User Onboarding Checklist',
    description: 'Step-by-step checklist to get started with Teamcast quickly.',
    type: 'checklist',
    category: 'Getting Started',
    categoryIcon: Lightbulb,
    categoryColor: 'text-emerald-600',
    fileSize: '0.6 MB',
    pages: 3,
    downloads: 9870,
    rating: 4.4,
    lastUpdated: '2024-01-03',
    author: 'Onboarding Team',
    tags: ['onboarding', 'getting started', 'checklist', 'setup'],
    downloadUrl: '/downloads/onboarding-checklist.pdf',
  },
  {
    id: 'recruitment-metrics-guide',
    title: 'Recruitment Metrics & Analytics Guide',
    description: 'Learn how to track and improve your recruitment performance.',
    type: 'guide',
    category: 'Analytics & Reports',
    categoryIcon: BarChart3,
    categoryColor: 'text-indigo-600',
    fileSize: '1.8 MB',
    pages: 28,
    downloads: 4320,
    rating: 4.8,
    lastUpdated: '2024-01-01',
    author: 'Analytics Team',
    tags: ['metrics', 'analytics', 'performance', 'tracking'],
    downloadUrl: '/downloads/recruitment-metrics-guide.pdf',
  },
  {
    id: 'resume-optimization-worksheet',
    title: 'Resume Optimization Worksheet',
    description:
      'Interactive worksheet to improve your resume for ATS and AI systems.',
    type: 'worksheet',
    category: 'For Candidates',
    categoryIcon: Users,
    categoryColor: 'text-purple-600',
    fileSize: '1.0 MB',
    pages: 12,
    downloads: 11230,
    rating: 4.6,
    lastUpdated: '2023-12-28',
    author: 'Resume Experts',
    tags: ['resume', 'optimization', 'worksheet', 'ATS'],
    downloadUrl: '/downloads/resume-optimization-worksheet.pdf',
  },
  {
    id: 'team-collaboration-guide',
    title: 'Team Collaboration Best Practices',
    description: 'Guide to effective team collaboration in the hiring process.',
    type: 'guide',
    category: 'For Clients',
    categoryIcon: Building,
    categoryColor: 'text-blue-600',
    fileSize: '1.5 MB',
    pages: 22,
    downloads: 3450,
    rating: 4.3,
    lastUpdated: '2023-12-25',
    author: 'Collaboration Team',
    tags: ['collaboration', 'team', 'best practices', 'workflow'],
    downloadUrl: '/downloads/team-collaboration-guide.pdf',
  },
  {
    id: 'salary-negotiation-guide',
    title: 'Salary Negotiation Guide',
    description:
      'Comprehensive guide to negotiating salary and benefits effectively.',
    type: 'guide',
    category: 'For Candidates',
    categoryIcon: Users,
    categoryColor: 'text-purple-600',
    fileSize: '1.3 MB',
    pages: 18,
    downloads: 8760,
    rating: 4.7,
    lastUpdated: '2023-12-22',
    author: 'Negotiation Experts',
    tags: ['salary', 'negotiation', 'benefits', 'career'],
    downloadUrl: '/downloads/salary-negotiation-guide.pdf',
  },
];

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredResources = downloadResources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'all' ||
        resource.category ===
          resourceCategories.find((cat) => cat.id === selectedCategory)?.name;
      const matchesType =
        selectedType === 'all' || resource.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        case 'oldest':
          return (
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
          );
        case 'most-downloaded':
          return b.downloads - a.downloads;
        case 'highest-rated':
          return b.rating - a.rating;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const featuredResources = downloadResources.filter(
    (resource) => resource.featured
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'template':
        return Clipboard;
      case 'checklist':
        return CheckCircle;
      case 'guide':
        return BookOpen;
      case 'infographic':
        return Image;
      case 'worksheet':
        return File;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'template':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'checklist':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'guide':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'infographic':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'worksheet':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleDownload = (resource: DownloadResource) => {
    // Track download
    // Downloading: ${resource.title}
    // In a real app, this would trigger the download
    window.open(resource.downloadUrl, '_blank');
  };

  const ResourceCard = ({
    resource,
    featured = false,
  }: {
    resource: DownloadResource;
    featured?: boolean;
  }) => {
    const TypeIcon = getTypeIcon(resource.type);

    return (
      <Card
        className={`group flex h-full flex-col transition-all duration-300 hover:shadow-xl ${featured ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'} hover:scale-105`}
      >
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <TypeIcon className="h-4 w-4 text-slate-500" />
                <Badge variant="outline" className="text-xs">
                  {resource.category}
                </Badge>
              </div>
              <Badge
                className={`text-xs capitalize ${getTypeColor(resource.type)}`}
              >
                {resource.type}
              </Badge>
              {featured && (
                <Badge className="bg-blue-600 text-xs text-white">
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-500">{resource.rating}</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {resource.title}
            </h3>
            <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {resource.description}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {resource.downloads.toLocaleString()}
              </span>
              <span>{resource.fileSize}</span>
              {resource.pages && <span>{resource.pages} pages</span>}
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(resource.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {resource.previewUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={resource.previewUrl}>
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleDownload(resource)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10" />
        <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-8">
              <h1 className="mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-white dark:via-blue-100 dark:to-white">
                Downloads & Resources
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Access our comprehensive library of guides, templates, and
                resources to maximize your success with Teamcast
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>50+ Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>100K+ Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="border-b border-slate-200 py-12 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Find the resources that match your specific needs and role
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resourceCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedCategory === category.id
                      ? 'border-blue-200 ring-2 ring-blue-500 dark:border-blue-800'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-4">
                      <div
                        className={
                          'rounded-2xl bg-gradient-to-br from-white to-slate-50 p-3 shadow-lg dark:from-slate-700 dark:to-slate-800'
                        }
                      >
                        <category.icon
                          className={`h-6 w-6 ${category.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {category.resourceCount} resources available
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="bg-slate-50 py-12 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              Featured Resources
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Our most popular and essential downloads
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="flex h-full flex-col"
              >
                <ResourceCard resource={resource} featured={true} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Resources */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {resourceCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="guide">Guides</SelectItem>
                      <SelectItem value="template">Templates</SelectItem>
                      <SelectItem value="checklist">Checklists</SelectItem>
                      <SelectItem value="infographic">Infographics</SelectItem>
                      <SelectItem value="worksheet">Worksheets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="most-downloaded">
                        Most Downloaded
                      </SelectItem>
                      <SelectItem value="highest-rated">
                        Highest Rated
                      </SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300">
                {filteredResources.length} resources found
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="py-12 text-center">
                <div className="mb-4">
                  <Search className="mx-auto h-12 w-12 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  No resources found
                </h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
