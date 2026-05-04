# Support Ticket Utilities

This module provides comprehensive utilities for managing support ticket categories, subcategories, and entity type determination for clients.

## Overview

The system automatically determines if an issue is related to a new entity creation or an existing entity based on the category and subcategory. This eliminates the need for end users to manually select whether they're creating a new entity or dealing with an existing one.

## Key Features

### 1. Automatic Entity Type Determination
- **NEW_ENTITY**: Issues related to creating new entities (job postings, user invitations, AI assessments, etc.)
- **EXISTING_ENTITY**: Issues related to existing entities (updates, troubleshooting, etc.)

### 2. Comprehensive Category Mapping
- 22 main categories covering all client operations
- 80+ subcategories for precise issue classification
- Automatic validation of category-subcategory combinations

### 3. Backend Integration Ready
- Utilities available for both frontend and backend
- Backend utilities include SLA policy determination, team assignment, and escalation rules

## Usage Examples

### Frontend Usage

```typescript
import {
  getTicketType,
  getCategoryLabel,
  getSubcategoriesForCategory,
  ClientTicketCategory,
  ClientTicketSubcategory,
} from '@/lib/utils/support-ticket.utils';

// Determine ticket type automatically
const ticketType = getTicketType(
  ClientTicketCategory.JOB_POSTING,
  ClientTicketSubcategory.JOB_POSTING_CREATE
);
// Returns: SupportTicketType.NEW_ENTITY

// Get human-readable labels
const categoryLabel = getCategoryLabel(ClientTicketCategory.JOB_POSTING);
// Returns: "Job Posting"

// Get available subcategories
const subcategories = getSubcategoriesForCategory(ClientTicketCategory.JOB_POSTING);
// Returns: Array of job posting subcategories
```

### Backend Usage

```typescript
import {
  getTicketType,
  getSLAPolicy,
  getSupportTeam,
  validateCategorySubcategory,
} from '@/shared/utils/support-ticket.utils';

// Validate incoming ticket data
const isValid = validateCategorySubcategory(category, subcategory);

// Determine ticket type for processing
const ticketType = getTicketType(category, subcategory);

// Get appropriate SLA policy
const slaPolicy = getSLAPolicy(ticketType, priority);

// Get support team assignment
const supportTeam = getSupportTeam(category);
```

## Category Structure

### Job Management
- **JOB_POSTING**: Create, update, delete, publish, AI review, manual review
- **JOB_APPLICATION**: Review, shortlist, reject, export
- **JOB_INTERVIEW**: Scheduling, rescheduling, cancellation, feedback
- **JOB_ONBOARDING**: Setup, assessment, tracking

### User & Access Management
- **USER_INVITATION**: Send, resend, withdraw invitations
- **USER_MANAGEMENT**: Role assignment, permissions, deactivation
- **ACCOUNT_SETTINGS**: Profile updates, password changes, 2FA
- **SECURITY_AUTHENTICATION**: Login issues, account lockouts, suspicious activity

### Assessment & AI
- **AI_ASSESSMENT**: Setup, configuration, results, accuracy
- **PANEL_ASSESSMENT**: Setup, scheduling, evaluation
- **CANDIDATE_RECOMMENDATION**: Algorithm, quality, filters

### Business Operations
- **SUBSCRIPTION_BILLING**: Upgrades, downgrades, payments, refunds
- **CANDIDATE_MANAGEMENT**: Search, filtering, export, import
- **COMPANY_PROFILE**: Updates, verification, branding
- **INTEGRATION**: Setup, sync, error handling

### Technical & Support
- **TECHNICAL_ISSUE**: Performance, system errors, compatibility
- **API_ACCESS**: Key generation, rate limiting, documentation
- **REPORTING_ANALYTICS**: Report generation, dashboards, visualization
- **FEATURE_REQUEST**: New features, enhancements, customization

## Entity Type Logic

### NEW_ENTITY Subcategories
The following subcategories automatically classify tickets as NEW_ENTITY:

- Job posting creation
- User invitation sending
- AI assessment setup
- Panel assessment setup
- Candidate import
- Integration setup
- API key generation
- Feature requests

### EXISTING_ENTITY Subcategories
All other subcategories are classified as EXISTING_ENTITY:

- Updates and modifications
- Troubleshooting
- Configuration changes
- Data operations
- Performance issues
- General inquiries

## Backend Integration

### SLA Policies
- NEW_ENTITY tickets get higher priority SLA policies
- Faster escalation thresholds for critical operations
- Automatic assignment for critical subcategories

### Team Assignment
- Tickets are automatically routed to appropriate support teams
- Skill-based assignment based on category and subcategory
- Load balancing and round-robin assignment for non-critical tickets

### Escalation Rules
- NEW_ENTITY tickets escalate faster than EXISTING_ENTITY tickets
- Priority-based escalation thresholds
- Automatic escalation to managers for SLA breaches

## Validation

### Category-Subcategory Validation
```typescript
import { isValidSubcategoryForCategory } from '@/lib/utils/support-ticket.utils';

const isValid = isValidSubcategoryForCategory(
  ClientTicketCategory.JOB_POSTING,
  ClientTicketSubcategory.JOB_POSTING_CREATE
);
// Returns: true

const isInvalid = isValidSubcategoryForCategory(
  ClientTicketCategory.JOB_POSTING,
  ClientTicketSubcategory.USER_INVITATION_SEND
);
// Returns: false
```

### Complete Ticket Validation
```typescript
import { validateCategorySubcategory } from '@/shared/utils/support-ticket.utils';

const validateTicket = (ticketData) => {
  const errors = [];
  
  if (!validateCategorySubcategory(ticketData.category, ticketData.subcategory)) {
    errors.push('Invalid category-subcategory combination');
  }
  
  return errors;
};
```

## Migration Guide

### From Mock Enums
Replace mock enums with utility imports:

```typescript
// Before
const SupportTicketTypeEnum = {
  NEW_ENTITY: 'new_entity',
  EXISTING_ENTITY: 'existing_entity',
};

// After
import { SupportTicketType } from '@/lib/utils/support-ticket.utils';
const SupportTicketTypeEnum = SupportTicketType;
```

### From Hardcoded Categories
Replace hardcoded category arrays with utility functions:

```typescript
// Before
const categories = [
  { value: 'job_posting', label: 'Job Posting' },
  { value: 'user_management', label: 'User Management' },
];

// After
import { getAllClientCategories, getCategoryLabel, getCategoryIcon } from '@/lib/utils/support-ticket.utils';

const categories = getAllClientCategories().map(category => ({
  value: category,
  label: `${getCategoryIcon(category)} ${getCategoryLabel(category)}`,
}));
```

## Best Practices

1. **Always use utility functions** instead of hardcoding category/subcategory values
2. **Validate category-subcategory combinations** before processing tickets
3. **Use automatic entity type determination** instead of asking users
4. **Leverage backend utilities** for SLA policies and team assignment
5. **Keep category mappings updated** when adding new features

## Future Enhancements

- Support for candidate and partner ticket categories
- Dynamic category loading from backend configuration
- Multi-language support for labels and descriptions
- Integration with AI-powered ticket classification
- Advanced routing rules based on ticket complexity
