# Blue Fire Platform - Design System

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#3b82f6` (Blue-500)
- **Primary Hover**: `#2563eb` (Blue-600)
- **Secondary Purple**: `#8b5cf6` (Purple-500)
- **Accent Cyan**: `#06b6d4` (Cyan-500)

### Gray Scale (Max gray-300 for readability)
- **Gray-100**: `#f3f4f6` (Lightest)
- **Gray-200**: `#e5e7eb` (Light)
- **Gray-300**: `#d1d5db` (Medium - Max darkness)

### Semantic Colors
- **Success**: `#10b981` (Green-500)
- **Warning**: `#f59e0b` (Yellow-500)
- **Error**: `#ef4444` (Red-500)
- **Info**: `#3b82f6` (Blue-500)

### Background Colors
- **Primary BG**: `#0f172a` (Dark blue)
- **Secondary BG**: `#1e293b` (Lighter dark)
- **Card BG**: `rgba(255, 255, 255, 0.05)` (Frosted glass)
- **Overlay BG**: `rgba(0, 0, 0, 0.2)` (Modal overlay)

## 📝 Typography

### Headings
- **H1**: `2.5rem` (40px) - Page titles
- **H2**: `2rem` (32px) - Section headers
- **H3**: `1.5rem` (24px) - Subsection headers
- **H4**: `1.25rem` (20px) - Card titles
- **H5**: `1.125rem` (18px) - Small headers
- **H6**: `1rem` (16px) - Micro headers

### Body Text
- **Primary**: `#ffffff` (White)
- **Secondary**: `#d1d5db` (Gray-300)
- **Muted**: `#d1d5db` (Gray-300)

## 🧩 Components

### Button Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Success Action</Button>
<Button variant="warning">Warning Action</Button>
<Button variant="error">Error Action</Button>
<Button variant="outline">Outline Action</Button>
```

### Button Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card Variants
```tsx
<Card variant="default">Default Card</Card>
<Card variant="frosted">Frosted Glass Card</Card>
<Card variant="gradient">Gradient Card</Card>
```

### Badge Variants
```tsx
<Badge variant="pending">Pending</Badge>
<Badge variant="approved">Approved</Badge>
<Badge variant="rejected">Rejected</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

## 🎯 CSS Classes

### Layout
- `.container-main`: Main container with padding
- `.section-header`: Section title styling
- `.section-subtitle`: Section subtitle styling

### Buttons
- `.btn-primary`: Primary button styling
- `.btn-secondary`: Secondary button styling
- `.btn-success`: Success button styling
- `.btn-warning`: Warning button styling
- `.btn-error`: Error button styling

### Status Badges
- `.badge-pending`: Pending status badge
- `.badge-approved`: Approved status badge
- `.badge-rejected`: Rejected status badge

### Forms
- `.input-field`: Standard input styling
- `.input-field:focus`: Focus state styling

### Navigation
- `.nav-link`: Navigation link styling
- `.nav-link-active`: Active navigation link

### Utilities
- `.text-muted`: Muted text color
- `.text-secondary`: Secondary text color
- `.bg-card`: Card background
- `.bg-overlay`: Overlay background
- `.border-light`: Light border color
- `.animate-fade-in`: Fade in animation
- `.animate-slide-up`: Slide up animation
- `.hover-lift`: Hover lift effect

## 🎨 Gradients

### Accent Gradient
```css
.gradient-accent {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}
```

### Card Gradient
```css
.gradient-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Adjustments
- Reduced padding: `p-4` instead of `p-8`
- Smaller headings: `2rem` instead of `2.5rem`
- Stacked layouts for better mobile UX

## 🔧 Usage Guidelines

### 1. Color Consistency
- Always use `gray-300` as the darkest gray
- Use semantic colors for status indicators
- Maintain contrast ratios for accessibility

### 2. Component Usage
- Use the Button component for all interactive elements
- Use the Card component for content containers
- Use the Badge component for status indicators

### 3. Spacing
- Use consistent spacing with Tailwind utilities
- Maintain visual hierarchy with proper spacing

### 4. Animations
- Use subtle transitions for better UX
- Keep animations under 300ms for responsiveness
- Use hover effects sparingly

## 🚀 Best Practices

1. **Consistency**: Always use the design system components
2. **Accessibility**: Maintain proper contrast ratios
3. **Performance**: Use CSS custom properties for theming
4. **Maintainability**: Keep styles centralized in globals.css
5. **Scalability**: Use component-based architecture for reusability 