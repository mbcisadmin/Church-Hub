# Storybook Setup Guide

> **Status:** Not yet implemented **Priority:** Low (add when @church/nextjs-ui
> has 10+ components)

## When to Add Storybook

Add Storybook when:

- ✅ `@church/nextjs-ui` has 10+ reusable components
- ✅ Multiple churches are using the template
- ✅ You need visual component documentation
- ✅ Designers want to browse components

## Installation

```bash
# Install Storybook for Next.js + React
npx storybook@latest init

# Install addons
npm install -D @storybook/addon-a11y @storybook/addon-themes
```

## Configuration

### 1. Configure for Turborepo

```js
// packages/nextjs/ui/.storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  webpackFinal: async (config) => {
    // Resolve @church/* packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@church/tailwind-config': path.resolve(__dirname, '../../../tailwind-config'),
    };
    return config;
  },
};

export default config;
```

### 2. Add Tailwind Support

```js
// packages/nextjs/ui/.storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css'; // Import Tailwind

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### 3. Example Story

```typescript
// packages/nextjs/ui/src/button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Click me',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Click me',
    variant: 'outline',
  },
};
```

## Scripts

Add to `packages/nextjs/ui/package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Deployment

Deploy Storybook to Vercel or Chromatic:

```bash
# Build static Storybook
npm run build-storybook

# Deploy to Vercel
vercel --prod
```

**URL:** `storybook.yourchurch.org` or `your-template.chromatic.com`

## Benefits

- ✅ Visual component library
- ✅ Interactive component playground
- ✅ Automatic documentation
- ✅ Accessibility testing
- ✅ Design system reference

## Alternatives

Before adding Storybook, consider:

- Simple README with screenshots
- Video walkthrough of components
- Component examples in docs site

Storybook is powerful but adds build complexity. Only add when benefits justify
the overhead.
