import { Metadata } from 'next';
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.blog);

const featuredPost = {
  id: 1,
  title: 'The Future of AI in Recruitment: 5 Trends Shaping 2024',
  excerpt:
    'Discover how artificial intelligence is revolutionizing the recruitment landscape and what it means for HR professionals and job seekers alike.',
  author: 'Sarah Chen',
  authorRole: 'Head of AI Research',
  publishDate: '2024-01-15',
  readTime: '8 min read',
  category: 'AI & Technology',
  image: '/api/placeholder/800/400',
  featured: true,
};

const blogPosts = [
  {
    id: 2,
    title: 'Building Inclusive Hiring Practices with AI',
    excerpt:
      'Learn how AI can help eliminate bias in recruitment and create more diverse and inclusive teams.',
    author: 'Marcus Johnson',
    authorRole: 'Diversity & Inclusion Lead',
    publishDate: '2024-01-12',
    readTime: '6 min read',
    category: 'Diversity & Inclusion',
    image: '/api/placeholder/400/250',
  },
  {
    id: 3,
    title: '10 Interview Questions That Actually Matter',
    excerpt:
      'Stop asking generic questions and start evaluating candidates with purpose. Here are the questions that reveal true potential.',
    author: 'Emma Rodriguez',
    authorRole: 'Senior Recruiter',
    publishDate: '2024-01-10',
    readTime: '5 min read',
    category: 'Best Practices',
    image: '/api/placeholder/400/250',
  },
  {
    id: 4,
    title: 'Remote Hiring: Challenges and Solutions',
    excerpt:
      'Navigate the complexities of remote recruitment with proven strategies and tools for virtual interviews.',
    author: 'David Park',
    authorRole: 'VP of Engineering',
    publishDate: '2024-01-08',
    readTime: '7 min read',
    category: 'Remote Work',
    image: '/api/placeholder/400/250',
  },
  {
    id: 5,
    title: 'Understanding Candidate Experience in the AI Era',
    excerpt:
      'How AI is transforming the candidate journey and what it means for employer branding.',
    author: 'Lisa Thompson',
    authorRole: 'UX Research Lead',
    publishDate: '2024-01-05',
    readTime: '4 min read',
    category: 'Candidate Experience',
    image: '/api/placeholder/400/250',
  },
  {
    id: 6,
    title: 'Data-Driven Recruitment: Metrics That Matter',
    excerpt:
      'Key performance indicators every recruiter should track to optimize their hiring process.',
    author: 'Alex Kumar',
    authorRole: 'Data Scientist',
    publishDate: '2024-01-03',
    readTime: '6 min read',
    category: 'Analytics',
    image: '/api/placeholder/400/250',
  },
  {
    id: 7,
    title: 'The Rise of Skills-Based Hiring',
    excerpt:
      'Why companies are moving beyond degrees and focusing on practical skills and competencies.',
    author: 'Rachel Green',
    authorRole: 'Talent Strategy Lead',
    publishDate: '2023-12-28',
    readTime: '5 min read',
    category: 'Hiring Trends',
    image: '/api/placeholder/400/250',
  },
];

const categories = [
  'All Posts',
  'AI & Technology',
  'Best Practices',
  'Diversity & Inclusion',
  'Remote Work',
  'Candidate Experience',
  'Analytics',
  'Hiring Trends',
];

const getCategoryColor = (category: string) => {
  const colors = {
    'AI & Technology': 'bg-blue-100 text-blue-800',
    'Best Practices': 'bg-green-100 text-green-800',
    'Diversity & Inclusion': 'bg-purple-100 text-purple-800',
    'Remote Work': 'bg-orange-100 text-orange-800',
    'Candidate Experience': 'bg-pink-100 text-pink-800',
    Analytics: 'bg-indigo-100 text-indigo-800',
    'Hiring Trends': 'bg-yellow-100 text-yellow-800',
  };
  return (
    (colors as Record<string, string>)[category] || 'bg-gray-100 text-gray-800'
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function BlogPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
              Teamcast <span className="text-[#6e55cf]">Blog</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-8">
              Insights, trends, and best practices in AI-powered recruitment.
              Stay ahead with expert advice from our team and industry leaders.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === 'All Posts' ? 'default' : 'outline'}
                  size="sm"
                  className={
                    category === 'All Posts'
                      ? 'bg-[#6e55cf] hover:bg-[#5a4ba8]'
                      : ''
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-foreground mb-2 text-2xl font-bold">
              Featured Article
            </h2>
            <div className="h-1 w-20 bg-[#6e55cf]"></div>
          </div>

          <div className="bg-card overflow-hidden rounded-2xl border shadow-lg">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="relative aspect-[4/3] lg:aspect-auto">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#6e55cf]/20 to-[#8b6edb]/20">
                  <div className="text-6xl font-bold text-[#6e55cf]/30">AI</div>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <Badge
                  className={getCategoryColor(featuredPost.category)}
                  variant="secondary"
                >
                  {featuredPost.category}
                </Badge>
                <h3 className="text-foreground mt-4 mb-4 text-2xl font-bold lg:text-3xl">
                  {featuredPost.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{formatDate(featuredPost.publishDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="bg-[#6e55cf] hover:bg-[#5a4ba8]">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-foreground mb-2 text-2xl font-bold">
              Latest Articles
            </h2>
            <div className="h-1 w-20 bg-[#6e55cf]"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-card overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/10]">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#6e55cf]/10 to-[#8b6edb]/10">
                    <Tag className="h-8 w-8 text-[#6e55cf]/40" />
                  </div>
                  <Badge
                    className={`absolute top-4 left-4 ${getCategoryColor(post.category)}`}
                    variant="secondary"
                  >
                    {post.category}
                  </Badge>
                </div>

                <div className="p-6">
                  <h3 className="text-foreground mb-3 line-clamp-2 text-xl font-semibold">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      {formatDate(post.publishDate)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#6e55cf] hover:bg-[#6e55cf]/10 hover:text-[#5a4ba8]"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-[#6e55cf] text-[#6e55cf] hover:bg-[#6e55cf] hover:text-white"
            >
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-8 text-xl">
            Get the latest insights on AI-powered recruitment delivered to your
            inbox.
          </p>

          <form className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
              required
            />
            <Button type="submit" className="bg-[#6e55cf] hover:bg-[#5a4ba8]">
              Subscribe
            </Button>
          </form>

          <p className="text-muted-foreground mt-4 text-sm">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
