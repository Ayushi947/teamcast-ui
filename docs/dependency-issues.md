# Dependency Issues and Solutions

This document outlines the deprecated dependencies found in the Teamcast UI project and provides solutions to resolve them.

## Current Issues

### Deprecated Dependencies Found

1. **har-validator@5.1.5** - Deprecated HTTP Archive (HAR) validator
2. **request@2.88.2** - Deprecated HTTP request library
3. **uuid@3.4.0** - Old version of UUID generator

### Security Vulnerabilities

1. **xlsx** - Multiple vulnerabilities in SheetJS library
2. **tough-cookie** - Prototype pollution vulnerability
3. **pm2** - Regular Expression Denial of Service vulnerability
4. **brace-expansion** - Regular Expression Denial of Service vulnerability

## Root Causes

### Primary Sources

1. **city-state-country@3.0.0** - Uses `alasql` which depends on `xlsx` and `request`
2. **pm2@5.3.1** - Uses `needle` which depends on `request`
3. **axios@1.9.0** - Uses `form-data` which depends on `request`
4. **recharts@2.15.2** - Deep dependency chain through `react-transition-group`

### Dependency Chain Analysis

```
city-state-country
└── alasql@0.5.10
    ├── xlsx@0.17.0 (vulnerable)
    └── request@2.88.2 (deprecated)
        ├── har-validator@5.1.5 (deprecated)
        ├── tough-cookie@3.0.1 (vulnerable)
        └── uuid@3.4.0 (old version)

pm2@5.3.1
└── needle@2.4.0
    └── request@2.88.2 (deprecated)

axios@1.9.0
└── form-data@4.0.2
    └── request@2.88.2 (deprecated)
```

## Solutions

### 1. Immediate Fixes (Applied)

#### Package.json Overrides

Added overrides to force specific versions of problematic dependencies:

```json
{
  "overrides": {
    "uuid": "^9.0.0",
    "request": "^2.88.2",
    "har-validator": "^5.1.5",
    "tough-cookie": "^4.1.3",
    "xlsx": "^0.20.2",
    "brace-expansion": "^1.1.12"
  },
  "pnpm": {
    "overrides": {
      "uuid": "^9.0.0",
      "request": "^2.88.2",
      "har-validator": "^5.1.5",
      "tough-cookie": "^4.1.3",
      "xlsx": "^0.20.2",
      "brace-expansion": "^1.1.12"
    }
  }
}
```

#### Automated Fix Script

Created `scripts/fix-deprecated-deps.sh` to:

- Update packages to latest versions
- Clean and reinstall dependencies
- Check for remaining issues

### 2. Long-term Solutions

#### Replace city-state-country

Consider replacing `city-state-country` with modern alternatives:

**Option 1: Use country-state-city (already installed)**

```typescript
import { Country, State, City } from 'country-state-city';

// Instead of city-state-country
const countries = Country.getAllCountries();
const states = State.getStatesOfCountry('US');
const cities = City.getCitiesOfState('US', 'CA');
```

**Option 2: Use a lightweight alternative**

```bash
pnpm remove city-state-country
pnpm add @vvo/tzdb  # For timezone data
pnpm add countries-list  # For country data
```

#### Update PM2

PM2 has newer versions available:

```bash
pnpm update pm2@latest
```

#### Consider Alternative Process Managers

For production, consider alternatives to PM2:

- **nodemon** (development)
- **forever** (simple production)
- **systemd** (Linux systems)
- **Docker** (containerized)

### 3. Monitoring and Prevention

#### Regular Audits

Run security audits regularly:

```bash
# Check for vulnerabilities
pnpm audit

# Check for outdated packages
pnpm outdated

# Update packages
pnpm update
```

#### Dependency Monitoring

Use tools to monitor dependencies:

- **Dependabot** (GitHub)
- **Snyk** (security monitoring)
- **npm audit** (built-in)

## Implementation Steps

### Step 1: Apply Immediate Fixes

```bash
# Run the automated fix script
./scripts/fix-deprecated-deps.sh
```

### Step 2: Test Application

```bash
# Build the application
pnpm build

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Step 3: Monitor for Issues

```bash
# Check for remaining vulnerabilities
pnpm audit

# Check dependency tree
pnpm ls har-validator request uuid
```

### Step 4: Plan Long-term Solutions

1. Evaluate alternatives to `city-state-country`
2. Consider PM2 alternatives for production
3. Implement regular dependency monitoring

## Best Practices

### Dependency Management

1. **Regular Updates**: Update dependencies monthly
2. **Security Audits**: Run audits weekly
3. **Version Pinning**: Pin critical dependencies
4. **Override Strategy**: Use overrides for problematic subdependencies

### Package Selection

1. **Active Maintenance**: Choose actively maintained packages
2. **Security History**: Check package security history
3. **Alternative Evaluation**: Always evaluate alternatives
4. **Bundle Size**: Consider impact on bundle size

### Monitoring

1. **Automated Alerts**: Set up automated security alerts
2. **Regular Reviews**: Review dependencies quarterly
3. **Documentation**: Document dependency decisions
4. **Testing**: Test thoroughly after dependency updates

## Troubleshooting

### Common Issues

#### Override Conflicts

If overrides cause conflicts:

```bash
# Remove overrides temporarily
# Edit package.json to remove overrides section
pnpm install
```

#### Build Failures

If build fails after updates:

```bash
# Clear cache
pnpm store prune
rm -rf node_modules
pnpm install
```

#### Runtime Errors

If runtime errors occur:

```bash
# Check for breaking changes
pnpm ls <package-name>
# Review changelog for breaking changes
```

## Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [pnpm overrides documentation](https://pnpm.io/package_json#pnpmoverrides)
- [Security advisories](https://github.com/advisories)
- [Dependency monitoring tools](https://snyk.io/)
