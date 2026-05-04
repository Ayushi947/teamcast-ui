// Headless CMS Integration for Blog Management

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: number;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: 'draft' | 'published' | 'archived';
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
}

export interface CMSConfig {
  provider: 'contentful' | 'strapi' | 'sanity' | 'mock';
  apiUrl?: string;
  accessToken?: string;
  spaceId?: string;
  environment?: string;
}

// CMS Provider Abstract Class
abstract class CMSProvider {
  protected config: CMSConfig;

  constructor(config: CMSConfig) {
    this.config = config;
  }

  abstract getAllPosts(limit?: number, offset?: number): Promise<BlogPost[]>;
  abstract getPostBySlug(slug: string): Promise<BlogPost | null>;
  abstract getPostsByCategory(categorySlug: string): Promise<BlogPost[]>;
  abstract getPostsByTag(tag: string): Promise<BlogPost[]>;
  abstract getCategories(): Promise<BlogCategory[]>;
  abstract searchPosts(query: string): Promise<BlogPost[]>;
  abstract getFeaturedPosts(limit?: number): Promise<BlogPost[]>;
}

// Mock CMS Provider for Development
class MockCMSProvider extends CMSProvider {
  private mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of AI in Recruitment',
      slug: 'future-of-ai-recruitment',
      excerpt:
        'Explore how artificial intelligence is transforming the hiring landscape and what it means for both employers and job seekers.',
      content: `
        <h2>Introduction</h2>
        <p>Artificial Intelligence is revolutionizing every industry, and recruitment is no exception. From automated screening to predictive analytics, AI is making the hiring process more efficient and effective.</p>
        
        <h2>Key AI Technologies in Recruitment</h2>
        <ul>
          <li>Natural Language Processing for resume parsing</li>
          <li>Machine Learning for candidate matching</li>
          <li>Chatbots for initial candidate interactions</li>
          <li>Predictive analytics for success forecasting</li>
        </ul>
        
        <h2>Benefits for Employers</h2>
        <p>AI-powered recruitment tools help employers save time, reduce bias, and find better candidates faster. Our platform at Teamcast uses advanced AI algorithms to match candidates with job requirements with 95% accuracy.</p>
        
        <h2>The Future Outlook</h2>
        <p>As AI technology continues to evolve, we can expect even more sophisticated tools that will further streamline the hiring process while maintaining the human touch that's essential for building great teams.</p>
      `,
      author: {
        name: 'Sarah Johnson',
        avatar: '/images/authors/sarah-johnson.jpg',
        bio: 'Head of Product at Teamcast with 10+ years in HR technology.',
      },
      category: 'AI & Technology',
      tags: ['AI', 'Recruitment', 'Technology', 'Future of Work'],
      featuredImage: {
        url: '/images/blog/ai-recruitment-future.jpg',
        alt: 'AI and recruitment concept illustration',
        width: 800,
        height: 600,
      },
      publishedAt: new Date('2024-01-15'),
      readingTime: 5,
      seo: {
        title: 'The Future of AI in Recruitment | Teamcast Blog',
        description:
          'Discover how AI is transforming recruitment and what the future holds for hiring technology. Learn about the latest trends and innovations.',
        keywords: [
          'AI recruitment',
          'artificial intelligence hiring',
          'future of recruitment',
          'HR technology',
        ],
      },
      status: 'published',
    },
    {
      id: '2',
      title: 'Building Inclusive Hiring Practices',
      slug: 'building-inclusive-hiring-practices',
      excerpt:
        'Learn practical strategies for creating more inclusive recruitment processes that attract diverse talent and eliminate bias.',
      content: `
        <h2>Why Inclusive Hiring Matters</h2>
        <p>Inclusive hiring practices are essential for building diverse, high-performing teams. Companies with diverse workforces are 35% more likely to outperform their competitors.</p>
        
        <h2>Common Hiring Biases</h2>
        <ul>
          <li>Unconscious bias in resume screening</li>
          <li>Cultural fit bias in interviews</li>
          <li>Educational and experience bias</li>
          <li>Name and demographic bias</li>
        </ul>
        
        <h2>Strategies for Inclusive Hiring</h2>
        <p>Implementing structured interviews, diverse hiring panels, and bias-free job descriptions are key steps toward more inclusive recruitment.</p>
      `,
      author: {
        name: 'Marcus Chen',
        avatar: '/images/authors/marcus-chen.jpg',
        bio: 'Diversity & Inclusion Specialist with expertise in equitable hiring practices.',
      },
      category: 'Diversity & Inclusion',
      tags: ['Diversity', 'Inclusion', 'Hiring Bias', 'Best Practices'],
      featuredImage: {
        url: '/images/blog/inclusive-hiring.jpg',
        alt: 'Diverse team collaboration',
        width: 800,
        height: 600,
      },
      publishedAt: new Date('2024-01-10'),
      readingTime: 7,
      seo: {
        title: 'Building Inclusive Hiring Practices | Teamcast Blog',
        description:
          'Learn how to create inclusive recruitment processes that eliminate bias and attract diverse talent to your organization.',
        keywords: [
          'inclusive hiring',
          'diversity recruitment',
          'hiring bias',
          'diverse teams',
        ],
      },
      status: 'published',
    },
    {
      id: '3',
      title: 'Remote Hiring Best Practices',
      slug: 'remote-hiring-best-practices',
      excerpt:
        'Master the art of remote hiring with proven strategies for evaluating candidates and building strong remote teams.',
      content: `
        <h2>The Remote Hiring Challenge</h2>
        <p>Remote hiring presents unique challenges in assessing candidates and ensuring cultural fit without in-person interactions.</p>
        
        <h2>Virtual Interview Best Practices</h2>
        <ul>
          <li>Use structured video interviews</li>
          <li>Test technical skills with practical assessments</li>
          <li>Evaluate communication skills carefully</li>
          <li>Assess self-motivation and independence</li>
        </ul>
        
        <h2>Building Remote Team Culture</h2>
        <p>Creating a strong remote culture starts with the hiring process. Look for candidates who thrive in autonomous environments.</p>
      `,
      author: {
        name: 'Emily Rodriguez',
        avatar: '/images/authors/emily-rodriguez.jpg',
        bio: 'Remote Work Expert and HR Consultant specializing in distributed teams.',
      },
      category: 'Remote Work',
      tags: [
        'Remote Work',
        'Virtual Interviews',
        'Team Building',
        'Best Practices',
      ],
      featuredImage: {
        url: '/images/blog/remote-hiring.jpg',
        alt: 'Remote interview setup',
        width: 800,
        height: 600,
      },
      publishedAt: new Date('2024-01-05'),
      readingTime: 6,
      seo: {
        title: 'Remote Hiring Best Practices | Teamcast Blog',
        description:
          'Discover effective strategies for remote hiring and building strong distributed teams in the modern workplace.',
        keywords: [
          'remote hiring',
          'virtual interviews',
          'distributed teams',
          'remote work',
        ],
      },
      status: 'published',
    },
  ];

  private mockCategories: BlogCategory[] = [
    {
      id: '1',
      name: 'AI & Technology',
      slug: 'ai-technology',
      description: 'Latest trends in AI and technology for recruitment',
      color: '#6e55cf',
      postCount: 1,
    },
    {
      id: '2',
      name: 'Diversity & Inclusion',
      slug: 'diversity-inclusion',
      description: 'Building inclusive hiring practices and diverse teams',
      color: '#10b981',
      postCount: 1,
    },
    {
      id: '3',
      name: 'Remote Work',
      slug: 'remote-work',
      description: 'Best practices for remote hiring and team management',
      color: '#f59e0b',
      postCount: 1,
    },
  ];

  async getAllPosts(limit = 10, offset = 0): Promise<BlogPost[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const publishedPosts = this.mockPosts
      .filter((post) => post.status === 'published')
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return publishedPosts.slice(offset, offset + limit);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const post = this.mockPosts.find(
      (p) => p.slug === slug && p.status === 'published'
    );
    return post || null;
  }

  async getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const category = this.mockCategories.find((c) => c.slug === categorySlug);
    if (!category) return [];

    return this.mockPosts
      .filter(
        (post) => post.category === category.name && post.status === 'published'
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getPostsByTag(tag: string): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return this.mockPosts
      .filter(
        (post) =>
          post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()) &&
          post.status === 'published'
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getCategories(): Promise<BlogCategory[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.mockCategories;
  }

  async searchPosts(query: string): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const searchTerms = query.toLowerCase().split(' ');

    return this.mockPosts
      .filter((post) => {
        const searchableContent =
          `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase();
        return (
          searchTerms.some((term) => searchableContent.includes(term)) &&
          post.status === 'published'
        );
      })
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For now, just return the most recent posts
    return this.getAllPosts(limit);
  }
}

// Contentful CMS Provider (skeleton implementation)
class ContentfulCMSProvider extends CMSProvider {
  // Implementation would use Contentful's API
  async getAllPosts(_limit?: number, _offset?: number): Promise<BlogPost[]> {
    // Implement Contentful API calls
    throw new Error('Contentful integration not implemented yet');
  }

  async getPostBySlug(_slug: string): Promise<BlogPost | null> {
    throw new Error('Contentful integration not implemented yet');
  }

  async getPostsByCategory(_categorySlug: string): Promise<BlogPost[]> {
    throw new Error('Contentful integration not implemented yet');
  }

  async getPostsByTag(_tag: string): Promise<BlogPost[]> {
    throw new Error('Contentful integration not implemented yet');
  }

  async getCategories(): Promise<BlogCategory[]> {
    throw new Error('Contentful integration not implemented yet');
  }

  async searchPosts(_query: string): Promise<BlogPost[]> {
    throw new Error('Contentful integration not implemented yet');
  }

  async getFeaturedPosts(_limit?: number): Promise<BlogPost[]> {
    throw new Error('Contentful integration not implemented yet');
  }
}

// CMS Factory
export const createCMSProvider = (config: CMSConfig): CMSProvider => {
  switch (config.provider) {
    case 'contentful':
      return new ContentfulCMSProvider(config);
    case 'mock':
    default:
      return new MockCMSProvider(config);
  }
};

// Default CMS instance
const cmsConfig: CMSConfig = {
  provider:
    (typeof process !== 'undefined'
      ? (process.env.CMS_PROVIDER as any)
      : undefined) || 'mock',
  apiUrl: typeof process !== 'undefined' ? process.env.CMS_API_URL : undefined,
  accessToken:
    typeof process !== 'undefined' ? process.env.CMS_ACCESS_TOKEN : undefined,
  spaceId:
    typeof process !== 'undefined' ? process.env.CMS_SPACE_ID : undefined,
  environment:
    (typeof process !== 'undefined'
      ? process.env.CMS_ENVIRONMENT
      : undefined) || 'master',
};

export const cms = createCMSProvider(cmsConfig);

// Utility functions
export const formatReadingTime = (minutes: number): string => {
  return `${minutes} min read`;
};

export const formatPublishedDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const generateBlogPostMetadata = (post: BlogPost) => ({
  title: post.seo.title,
  description: post.seo.description,
  keywords: post.seo.keywords.join(', '),
  openGraph: {
    title: post.seo.title,
    description: post.seo.description,
    type: 'article',
    publishedTime: post.publishedAt.toISOString(),
    authors: [post.author.name],
    images: post.featuredImage
      ? [
          {
            url: post.featuredImage.url,
            width: post.featuredImage.width || 800,
            height: post.featuredImage.height || 600,
            alt: post.featuredImage.alt,
          },
        ]
      : [],
  },
  twitter: {
    card: 'summary_large_image',
    title: post.seo.title,
    description: post.seo.description,
    images: post.featuredImage ? [post.featuredImage.url] : [],
  },
});
