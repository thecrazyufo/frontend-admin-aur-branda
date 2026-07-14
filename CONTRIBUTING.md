# Storefront Contribution Guidelines

This document outlines the workflow for developing, reviewing, and deploying changes to the storefront codebases (specifically `storefront-prismmigration` for brandA).

## Workflow Rules

To prevent breaking the live storefronts or releasing unapproved design revisions directly to production, follow this flow:

### 1. Development on `design-preview`
* All design modifications, styling, assets, or markup adjustments **must** be committed to the `design-preview` branch.
* Never push directly to `main` for design or layout changes.

```bash
# Checkout the design-preview branch
git checkout design-preview

# Pull latest changes
git pull origin design-preview

# Work on your changes, commit them
git add .
git commit -m "design: adjust layout rhythm and color spacing"
git push origin design-preview
```

### 2. Preview Review
* Every push to `design-preview` triggers an automatic **Vercel Preview Deployment**.
* Check the commit statuses on GitHub or Vercel dashboard to retrieve the unique preview URL.
* Review the look, feel, performance, and functionality on the preview URL.

### 3. Explicit Approval and Merging
* Once the design has been reviewed and explicitly approved, merge `design-preview` into `main`.
* Pushing/merging to `main` triggers the **Production Build** which updates the live `branda.thecrazyufo.in` site.

```bash
# Switch to main
git checkout main
git pull origin main

# Merge design-preview
git merge design-preview

# Push to deploy to live site
git push origin main

# Go back to preview branch for future development
git checkout design-preview
```
