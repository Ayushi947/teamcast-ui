import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateAndTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Truncate a string to a given length
 */
export function truncateString(str: string, length: number) {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generate initials from a name (e.g. "John Doe" -> "JD")
 */
export function getInitials(name: string) {
  if (!name) return '';

  const honorifics = [
    'mr',
    'ms',
    'mrs',
    'dr',
    'miss',
    'sir',
    'madam',
    'prof',
    'rev',
    'mx',
  ];

  return name
    .split(' ')
    .filter((n) => !honorifics.includes(n.toLowerCase().replace('.', '')))
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Utility to wait for a specified time
 */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely access nested object properties
 */
export function getNestedValue(
  obj: any,
  path: string,
  defaultValue: any = undefined
) {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert enum value to readable text
 * Removes underscores and capitalizes each word
 */
export function enumToReadableText(enumValue: string): string {
  if (!enumValue) return '';

  return enumValue
    .split('_')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
}

/**
 * Formats an enum value from snake case to title case
 * e.g., FULL_TIME -> Full Time
 */

const ENUM_EXCEPTIONS: Record<string, string> = {
  // Databases
  mongodb: 'MongoDB',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mariadb: 'MariaDB',
  sqlite: 'SQLite',
  redis: 'Redis',
  cassandra: 'Cassandra',
  dynamodb: 'DynamoDB',
  oracle: 'Oracle',
  mssql: 'MSSQL',
  db: 'DB',
  nosql: 'NoSQL',
  sql: 'SQL',

  // Cloud & DevOps
  aws: 'AWS',
  us: 'US',
  usa: 'USA',
  gcp: 'GCP',
  azure: 'Azure',
  ci: 'CI',
  cd: 'CD',
  cicd: 'CI/CD',
  devops: 'DevOps',
  k8s: 'Kubernetes',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  jenkins: 'Jenkins',
  terraform: 'Terraform',
  ansible: 'Ansible',
  helm: 'Helm',
  vpc: 'VPC',
  iam: 'IAM',
  ecs: 'ECS',
  eks: 'EKS',
  s3: 'S3',
  ec2: 'EC2',
  rds: 'RDS',
  lambda: 'Lambda',
  cloudfront: 'CloudFront',

  // Web / Frontend
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  react: 'React',
  reactjs: 'ReactJS',
  next: 'Next.js',
  nextjs: 'NextJS',
  vue: 'Vue',
  vuejs: 'Vue.js',
  angular: 'Angular',
  svelte: 'Svelte',
  nuxt: 'Nuxt',
  gatsby: 'Gatsby',
  tailwind: 'Tailwind',
  bootstrap: 'Bootstrap',
  mui: 'MUI',
  chakra: 'ChakraUI',
  dom: 'DOM',
  svg: 'SVG',

  // Backend / APIs
  api: 'API',
  rest: 'REST',
  restapi: 'REST API',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  json: 'JSON',
  xml: 'XML',
  yaml: 'YAML',
  http: 'HTTP',
  https: 'HTTPS',
  tcp: 'TCP',
  udp: 'UDP',
  ssl: 'SSL',
  tls: 'TLS',
  ws: 'WebSocket',

  // Security & Auth
  jwt: 'JWT',
  oauth: 'OAuth',
  saml: 'SAML',
  oidc: 'OIDC',
  mfa: 'MFA',
  csrf: 'CSRF',
  xss: 'XSS',
  sqlinjection: 'SQL Injection',
  ddos: 'DDoS',
  vpn: 'VPN',

  // AI / ML / Data Science
  ai: 'AI',
  ml: 'ML',
  dl: 'DL',
  rl: 'RL',
  nlp: 'NLP',
  cv: 'CV',
  llm: 'LLM',
  gpt: 'GPT',
  rag: 'RAG',
  bert: 'BERT',
  t5: 'T5',
  cnn: 'CNN',
  rnn: 'RNN',
  gan: 'GAN',
  svm: 'SVM',
  pca: 'PCA',
  api2: 'API', // fallback

  // Business / Roles
  hr: 'HR',
  ceo: 'CEO',
  cto: 'CTO',
  cfo: 'CFO',
  coo: 'COO',
  cmo: 'CMO',
  cio: 'CIO',
  cpo: 'CPO',
  pm: 'PM',
  qa: 'QA',
  ui: 'UI',
  ux: 'UX',
  bi: 'BI',
  saas: 'SaaS',
  paas: 'PaaS',
  iaas: 'IaaS',
  b2b: 'B2B',
  b2c: 'B2C',

  // Misc Tech
  ide: 'IDE',
  cli: 'CLI',
  sdk: 'SDK',
  os: 'OS',
  iot: 'IoT',
  vr: 'VR',
  ar: 'AR',
  xr: 'XR',
  qaops: 'QAOps',
  ciops: 'CIOps',

  // Popular Tools
  figma: 'Figma',
  jira: 'Jira',
  confluence: 'Confluence',
  slack: 'Slack',
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  notion: 'Notion',
};

export function formatEnumValue(value: string): string {
  if (!value) return value;

  const lower = value.toLowerCase();

  // ✅ Whole string exception
  if (ENUM_EXCEPTIONS[lower]) {
    return ENUM_EXCEPTIONS[lower];
  }

  // ✅ Split into words
  const words = value.split(/[_\-\s]+/);

  return words
    .map((word) => {
      const lowerWord = word.toLowerCase();

      // ✅ Check each word in exceptions
      if (ENUM_EXCEPTIONS[lowerWord]) {
        return ENUM_EXCEPTIONS[lowerWord];
      }

      // ✅ Default Title-case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Generate a display name from an email address
 * Converts email.local@domain.com to "Email Local"
 */
export function generateNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'Unknown User';
  }

  const localPart = email.split('@')[0];

  // Handle common patterns
  if (localPart.includes('.')) {
    // Convert "john.doe" to "John Doe"
    return localPart
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  if (localPart.includes('_')) {
    // Convert "john_doe" to "John Doe"
    return localPart
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  if (localPart.includes('-')) {
    // Convert "john-doe" to "John Doe"
    return localPart
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  // Handle camelCase or single word
  // Convert "johnDoe" to "John Doe" or "john" to "John"
  return localPart
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Format a date to a local input format
 */
export function formatDateToLocalInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

/** Format Score Percentage */
export const formatScore = (score: number | undefined | null): number => {
  if (typeof score !== 'number' || isNaN(score)) return 0;

  let formatted = score;

  if (score >= 0 && score <= 1) {
    formatted = score * 100;
  } else if (score > 1 && score <= 100) {
    formatted = score;
  } else {
    return 0; // fallback for out-of-range
  }

  return parseFloat(formatted.toFixed(2)); // limit to max 2 decimal digits
};

/**
 * Format a file size to a readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Feedback category type
 */
export type FeedbackCategory =
  | 'excellent'
  | 'good'
  | 'better'
  | 'needs-improvement';

/**
 * Feedback summary result
 */
export interface FeedbackSummary {
  category: FeedbackCategory;
  label: string;
  summary: string;
  color: string;
}

/**
 * Analyze overall feedback and categorize it
 * Returns a category, label, summary, and color for display
 */
export function analyzeFeedbackSummary(
  overallFeedback?: string | null
): FeedbackSummary | null {
  if (!overallFeedback || overallFeedback.trim().length === 0) {
    return null;
  }

  const feedbackLower = overallFeedback.toLowerCase();

  // Keywords for different categories
  const excellentKeywords = [
    'excellent',
    'outstanding',
    'exceptional',
    'impressive',
    'strong performance',
    'highly skilled',
    'demonstrates mastery',
    'exceeds expectations',
    'top performer',
    'exceptional ability',
    'exemplary',
    'superior',
    'remarkable',
    'commendable',
  ];

  const goodKeywords = [
    'good',
    'solid',
    'competent',
    'adequate',
    'satisfactory',
    'meets expectations',
    'demonstrates understanding',
    'shows promise',
    'capable',
    'proficient',
    'well-prepared',
    'suitable',
  ];

  const betterKeywords = [
    'better',
    'improved',
    'progressing',
    'developing',
    'growing',
    'shows potential',
    'room for growth',
    'developing skills',
    'promising',
    'encouraging',
  ];

  // Enhanced negative indicators - check these first as they're more specific
  const needsImprovementPhrases = [
    'needs to',
    'needs improvement',
    'needs work',
    'needs more',
    'lacks',
    'weak',
    'poor',
    'inadequate',
    'insufficient',
    'below expectations',
    'struggles',
    'limited',
    'requires development',
    'significant gaps',
    'not meeting',
    'missing',
    'incomplete',
    'crucial to',
    'important to',
    'should',
    'must',
    'need to',
    'provide more',
    'showcase deeper',
    'more detailed',
    'thorough responses',
    'completing the assessment',
    'completing',
    'all questions',
    'but needs',
    'however',
    'although',
    'despite',
    'but lacks',
    'foundation but',
    'demonstrates but',
    'however needs',
  ];

  // Check for negative patterns first (higher priority)
  const hasNegativePattern = needsImprovementPhrases.some((phrase) =>
    feedbackLower.includes(phrase)
  );

  // Count positive keyword matches
  const excellentCount = excellentKeywords.filter((keyword) =>
    feedbackLower.includes(keyword)
  ).length;

  const goodCount = goodKeywords.filter((keyword) =>
    feedbackLower.includes(keyword)
  ).length;

  const betterCount = betterKeywords.filter((keyword) =>
    feedbackLower.includes(keyword)
  ).length;

  // Check for "but" clauses that indicate problems
  const hasButClause =
    /but\s+(needs|lacks|requires|should|must|needs to|is missing|is incomplete)/i.test(
      overallFeedback
    );

  // Check for incomplete assessment indicators
  const hasIncompleteIndicators =
    /(completing|complete|all questions|thorough responses|provide more|more detailed|showcase deeper)/i.test(
      overallFeedback
    );

  // Determine category based on keyword matches and feedback tone
  let category: FeedbackCategory;
  let label: string;
  let color: string;

  // Priority 1: Clear negative indicators
  if (hasNegativePattern || hasButClause || hasIncompleteIndicators) {
    // If there are strong positive keywords, it might be "good" with caveats
    // Otherwise, it's needs improvement
    if (
      excellentCount >= 2 ||
      (excellentCount > 0 && !hasButClause && !hasIncompleteIndicators)
    ) {
      category = 'good';
      label = 'Good';
      color = 'text-blue-600 dark:text-blue-400';
    } else if (goodCount >= 2 && !hasButClause && !hasIncompleteIndicators) {
      category = 'good';
      label = 'Good';
      color = 'text-blue-600 dark:text-blue-400';
    } else {
      category = 'needs-improvement';
      label = 'Needs Improvement';
      color = 'text-red-600 dark:text-red-400';
    }
  }
  // Priority 2: Strong positive indicators
  else if (excellentCount > goodCount && excellentCount > 0) {
    category = 'excellent';
    label = 'Excellent';
    color = 'text-green-600 dark:text-green-400';
  }
  // Priority 3: Good indicators
  else if (goodCount > 0 || excellentCount > 0) {
    category = 'good';
    label = 'Good';
    color = 'text-blue-600 dark:text-blue-400';
  }
  // Priority 4: Better/developing
  else if (betterCount > 0) {
    category = 'better';
    label = 'Better';
    color = 'text-amber-600 dark:text-amber-400';
  }
  // Default: If no clear indicators, check overall tone
  else {
    // If feedback is short and neutral, default to "better"
    // If it has any negative words, mark as needs improvement
    const hasAnyNegative =
      /(but|however|although|needs|lacks|missing|incomplete|should|must)/i.test(
        overallFeedback
      );
    if (hasAnyNegative) {
      category = 'needs-improvement';
      label = 'Needs Improvement';
      color = 'text-red-600 dark:text-red-400';
    } else {
      category = 'better';
      label = 'Better';
      color = 'text-amber-600 dark:text-amber-400';
    }
  }

  // Generate a concise summary (first 100 characters or first sentence)
  let summary = overallFeedback.trim();
  const firstSentenceEnd = summary.match(/[.!?]\s/);
  if (firstSentenceEnd) {
    summary = summary.substring(0, firstSentenceEnd.index! + 1);
  } else if (summary.length > 100) {
    summary = summary.substring(0, 100).trim() + '...';
  }

  return {
    category,
    label,
    summary,
    color,
  };
}
