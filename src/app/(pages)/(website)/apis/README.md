# API Documentation

This directory contains the API documentation for the Teamcast platform, built with Next.js and Tailwind CSS.

## Structure

```
docs/
├── components/
│   ├── api-docs-sidebar.tsx      # Left sidebar navigation
│   ├── api-docs-right-panel.tsx  # Right panel with code examples
│   └── endpoint-page.tsx         # Reusable endpoint documentation component
├── layout.tsx                    # Main layout with three-panel design
├── page.tsx                      # Landing page with API categories
├── not-found.tsx                 # 404 page for invalid endpoints
├── [...slug]/
│   └── page.tsx                  # Dynamic route for all endpoints
└── README.md                     # This file
```

## Features

- **Three-panel layout**: Sidebar navigation, main content, and interactive right panel
- **Responsive design**: Works on desktop and mobile devices
- **Dark mode support**: Automatic theme switching
- **Interactive code examples**: Copy code and try API calls
- **Dynamic routing**: All endpoints handled by a single dynamic route
- **Search and filtering**: Easy navigation through API sections

## Adding New Endpoints

To add a new endpoint to the documentation:

1. **Update the sidebar navigation** in `components/api-docs-sidebar.tsx`
2. **Add endpoint data** to the `endpoints` object in `[...slug]/page.tsx`
3. **Create specific page** (optional) for detailed documentation

### Example Endpoint Data

```typescript
'new/endpoint': {
  path: '/new/endpoint',
  method: 'POST',
  title: 'New Endpoint',
  description: 'Description of what this endpoint does.',
  scope: 'scope:permission',
  parameters: [
    {
      name: 'paramName',
      type: 'string',
      required: true,
      description: 'Parameter description',
      example: 'example_value'
    }
  ],
  requestBody: {
    type: 'application/json',
    description: 'Request body description',
    example: `{
  "key": "value"
}`
  },
  responses: [
    {
      code: 200,
      description: 'Success response',
      example: `{
  "success": true,
  "data": {}
}`
    }
  ]
}
```

## Components

### ApiDocsSidebar

- Collapsible sections for different API categories
- Method badges (GET, POST, PUT, DELETE) with color coding
- Active state highlighting
- Scrollable navigation

### ApiDocsRightPanel

- Authentication type selector (Bearer Token vs API Key)
- Interactive code examples with copy functionality
- "Try It!" button for testing API calls
- Response preview panel

### EndpointPage

- Tabbed interface (Overview, Parameters, Responses)
- Method badges and full URL display
- Parameter tables with type, required status, and examples
- Response code examples with syntax highlighting

## Styling

The documentation uses Tailwind CSS with:

- Consistent color scheme for light and dark modes
- Responsive breakpoints for mobile and desktop
- Custom utility classes for API-specific styling
- Smooth transitions and hover effects

## API Categories

1. **Authentication** - Login, registration, token management
2. **Candidates** - Candidate profiles and applications
3. **Clients** - Client management and job postings
4. **Partners** - Partner integrations and management
5. **Search** - Advanced search functionality
6. **Documents** - File upload and management
7. **Settings** - User preferences and profile management

## Development

To run the documentation locally:

```bash
npm run dev
```

Then navigate to `http://localhost:3000/docs` to view the API documentation.

## Customization

- **Colors**: Update the color scheme in the component files
- **Layout**: Modify the three-panel layout in `layout.tsx`
- **Navigation**: Add new sections in `api-docs-sidebar.tsx`
- **Endpoints**: Add new endpoints in `[...slug]/page.tsx`
