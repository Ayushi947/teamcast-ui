# Teamcast Design System

A comprehensive, modern design system for the AI-powered HR and hiring platform. Built with accessibility, consistency, and developer experience in mind.

## 🎨 Design Philosophy

Our design system is built on these core principles:

- **Consistency**: Unified visual language across all components
- **Accessibility**: WCAG 2.1 AA compliant components
- **Scalability**: Flexible tokens and variants for different use cases
- **Performance**: Optimized for fast loading and smooth interactions
- **Developer Experience**: Well-documented, type-safe, and easy to use

## 🌈 Color System

### Primary Colors

- **Primary**: `#4F46E5` (Indigo) - Primary actions, links, focus states
- **Primary Hover**: `#4338CA` - Hover state for primary elements
- **Secondary**: `#64748B` (Slate Gray) - Secondary actions, muted elements
- **Accent**: `#10B981` (Emerald) - Success states, positive feedback
- **Warning**: `#F59E0B` (Amber) - Warning states, caution
- **Danger**: `#EF4444` (Rose) - Error states, destructive actions

### Background Colors

- **Background**: `#F9FAFB` - Main app background
- **Card**: `#FFFFFF` - Card backgrounds, elevated surfaces
- **Border**: `#E5E7EB` - Default border color

### Text Colors

- **Text Primary**: `#111827` - Main content text
- **Text Muted**: `#6B7280` - Secondary text, captions

### Status Colors (HR-specific)

- **Hired**: `bg-emerald-100 text-emerald-800`
- **Interview**: `bg-blue-100 text-blue-800`
- **Review**: `bg-amber-100 text-amber-800`
- **Declined**: `bg-rose-100 text-rose-800`
- **Pending**: `bg-gray-100 text-gray-800`
- **Active**: `bg-green-100 text-green-800`
- **Inactive**: `bg-gray-100 text-gray-600`

## 📝 Typography

### Font Family

- **Primary**: Inter (Google Fonts)
- **Fallback**: Roboto, system-ui, sans-serif

### Type Scale

- **H1**: 32px, line-height 2.5rem, font-weight 600
- **H2**: 24px, line-height 2rem, font-weight 600
- **H3**: 20px, line-height 1.75rem, font-weight 600
- **Body**: 16px, line-height 1.6, font-weight 400

```tsx
// Usage
<h1 className="text-h1">Main Heading</h1>
<h2 className="text-h2">Section Heading</h2>
<h3 className="text-h3">Subsection Heading</h3>
<p className="text-body">Body text content</p>
```

## 📦 Spacing System

Based on 4px scale for consistent spacing:

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## 🔘 Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🚀</Button>

// States
<Button disabled>Disabled</Button>
```

### Badge

Status indicators and labels, especially useful for HR workflows.

```tsx
import { Badge } from '@/components/ui/badge';

// Standard Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// HR Status Badges (Custom)
<Badge className="bg-emerald-100 text-emerald-800">Hired</Badge>
<Badge className="bg-blue-100 text-blue-800">Interview</Badge>
<Badge className="bg-amber-100 text-amber-800">Review</Badge>
<Badge className="bg-rose-100 text-rose-800">Declined</Badge>
<Badge className="bg-gray-100 text-gray-800">Pending</Badge>
<Badge className="bg-green-100 text-green-800">Active</Badge>
<Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
```

### Card

Container component for grouping related content.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Input & Form Elements

Form controls with consistent styling and accessibility.

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea
    id="message"
    placeholder="Enter your message"
  />
</div>
```

### Table

Data tables with zebra striping and responsive design.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Score</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-800">Interview</Badge>
      </TableCell>
      <TableCell>92/100</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

### Select

Dropdown selection component with clean styling.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

## 🎯 Best Practices

### Accessibility

- Always use semantic HTML elements
- Provide proper ARIA labels and roles
- Ensure sufficient color contrast (4.5:1 for normal text)
- Test with keyboard navigation
- Use focus indicators for interactive elements

### Responsive Design

- Mobile-first approach
- Use breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Test on multiple screen sizes
- Consider touch targets (minimum 44px)

### Performance

- Use `transition-all duration-200 ease-in-out` for smooth animations
- Implement proper loading states
- Optimize images and assets
- Use proper semantic HTML for better SEO

### Color Usage

- Use primary color (`#4F46E5`) for main actions and CTAs
- Use status colors consistently for HR workflows
- Ensure proper contrast in both light and dark modes
- Test accessibility with color blindness simulators

### Typography

- Use the type scale consistently
- Maintain proper line heights for readability
- Use font weights appropriately (400 for body, 600 for headings)
- Consider reading length and content structure

## 🚀 Getting Started

1. Import the component you need:

```tsx
import { Button } from '@/components/ui/button';
```

2. Use design tokens for custom styling:

```tsx
import { designTokens } from '@/lib/design-tokens';

const customStyle = {
  backgroundColor: designTokens.colors.primary,
  borderRadius: designTokens.borderRadius.md,
  padding: designTokens.spacing.md,
};
```

3. View the complete design system:
   Visit `/design-system` to see all components in action.

## 🔧 Customization

The design system is built with CSS custom properties and Tailwind CSS, making it easy to customize:

```css
:root {
  --ds-primary: #4f46e5;
  --ds-primary-hover: #4338ca;
  /* ... other tokens */
}
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://fonts.google.com/specimen/Inter)

---

Built with ❤️ for the Teamcast platform.
