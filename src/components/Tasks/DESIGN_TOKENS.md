# Task Management Kanban - Design System & Tokens

## Color Palette

### Status Colors
```typescript
const statusColors = {
  notStarted: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700'
  },
  inProgress: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    badge: 'bg-orange-100 text-orange-700'
  },
  onTrack: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700'
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  }
};
```

### Priority Colors
```typescript
const priorityColors = {
  low: {
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200'
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-yellow-200'
  },
  high: {
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200'
  }
};
```

### Column Colors
```typescript
const columnColors = {
  todo: 'bg-slate-400',
  inProgress: 'bg-blue-400',
  done: 'bg-green-400'
};
```

## Typography

### Font Sizes
- Card Title: `text-sm` font-bold
- Modal Title: `text-3xl` font-bold
- Column Header: font-bold
- Status Badge: `text-xs` font-medium
- Description: `text-sm` text-gray-600
- Meta Info: `text-xs` text-gray-500

### Font Weights
- Bold: `font-bold` (card titles, main text)
- Semibold: `font-semibold` (status badges)
- Medium: `font-medium` (labels, button text)
- Regular: default (descriptions)

## Spacing

### Card Spacing
```
Padding: p-4 (16px)
Gap between items: gap-3 (12px), gap-2 (8px)
Margin bottom: mb-3, mb-4
```

### Modal Spacing
```
Padding: p-8 (32px)
Gap between sections: space-y-4
Gap in grid: gap-6
```

### Column Spacing
```
Padding: p-4
Margin bottom (header): mb-4
Scrollable area: pr-2 (padding-right for scrollbar)
```

## Border Radius

- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-lg`, `rounded-xl`
- Badges: `rounded-full`
- Modals: `rounded-2xl`
- Inputs: `rounded-xl`, `rounded-lg`

## Shadows

### Elevation Levels
- `shadow-sm`: Cards at rest
- `shadow-md`: Cards on hover
- `shadow-2xl`: Modal backdrop

### Shadow Application
```typescript
// Card shadow
'shadow-sm' -> 'shadow-md' on hover
transition-all duration-200

// Modal shadow
'shadow-2xl'

// Buttons
No shadow by default
```

## Animations & Transitions

### Timing Functions
- All transitions: `duration-200` (200ms)
- Hover effects: `transition-all duration-200`
- Scale transform: `hover:scale-[1.02]`
- Opacity: `opacity-0 group-hover:opacity-100`

### Card Interactions
```typescript
// Hover
hover:shadow-md
hover:scale-[1.02]

// Drag
opacity: isDragging ? 0.5 : 1

// Transitions
transform: CSS.Transform.toString(transform)
transition: transition
```

## Component Dimensions

### Card
- Width: Full container width
- Min Height: `auto`
- Padding: `p-4`

### Column Header
- Height: Auto
- Padding: `p-4`
- Badge: `h-6 w-6` (24px)

### Assignee Avatars
- Size: `h-6 w-6` (24px)
- Border: `border-2 border-white`
- Display: `-space-x-2` (overlap)

### Progress Bar
- Height: `h-1.5` rounded
- Container: `h-full bg-gray-200`

### Task Count Badge
- Size: `h-6 w-6`
- Text: `text-xs`
- Bg: `bg-gray-200`

### Modal Close Button
- Size: `h-8 w-8`
- Border radius: `rounded-lg`

## Interaction States

### Buttons
```typescript
// Normal
'bg-blue-600 text-white'

// Hover
'hover:bg-blue-700'

// Active/Pressed
'active:scale-95'

// Disabled
'disabled:opacity-50 disabled:cursor-not-allowed'

// Focus
'focus:ring-2 focus:ring-blue-200'
```

### Inputs
```typescript
// Normal
'border border-gray-200 px-4 py-3'

// Focus
'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

// Error (if implemented)
'border-red-500 focus:ring-red-200'
```

### Cards
```typescript
// Normal
'border border-gray-200 bg-white shadow-sm'

// Hover
'hover:shadow-md hover:scale-[1.02]'

// Dragging
'opacity-0.5'
```

## Responsive Breakpoints

### Grid Columns
```typescript
// Desktop (lg+)
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

// Tablet (md)
2 columns per row

// Mobile (sm)
1 column stacked
```

### Modal
```typescript
'max-w-2xl'  // Max width constraint
'p-4 sm:p-6' // Padding responsive
'max-h-[90vh]' // Max height
```

### Visibility
```typescript
'hidden md:block'  // Hide on mobile
'block md:hidden'  // Show only on mobile
```

## Consistent Patterns

### Card Layout
```
1. Status badge (top-right)
2. Title (bold, truncated)
3. Description (2 lines max)
4. Assignees (with overflow +N)
5. Due date + Priority
6. Progress bar
7. Footer (comments, links, count)
```

### Modal Layout
```
1. Close button (top-right)
2. Title + Status badges
3. Description
4. Details grid
5. Assignees section
6. Completion progress
7. Action buttons
```

### Column Layout
```
1. Header with count badge
2. Add button
3. Tasks container (scrollable)
4. Empty state (if no tasks)
```

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Use of icons + color for status indication
- Meaningful alt text for avatars

### Focus States
- Visible focus ring on interactive elements
- Focus trap in modals
- Keyboard navigation support

### Semantic HTML
- Proper heading hierarchy
- Label associations for form fields
- Role attributes where needed

## Performance Optimizations

### CSS Classes
- Avoid dynamic class generation
- Use Tailwind utilities
- Limit arbitrary values

### Animations
- Use CSS transforms over property changes
- Use `will-change: transform` sparingly
- Debounce resize listeners

### Re-renders
- Memoize expensive components
- Use `useCallback` for event handlers
- Prevent prop drilling

## Customization Guide

### Changing Theme Colors

1. **Primary Color**: Update blue-600 to your brand color throughout
   ```typescript
   'bg-blue-600' -> 'bg-[your-color]'
   'text-blue-700' -> 'text-[your-color]-700'
   ```

2. **Status Colors**: Update in status color maps
   ```typescript
   getStatusColor() function in TaskCard.tsx
   getStatusColor() function in TaskModal.tsx
   ```

3. **Sizing**: Adjust padding/margin constants
   ```typescript
   'p-4' -> 'p-5' or 'p-3'
   'gap-3' -> 'gap-4' or 'gap-2'
   ```

### Dark Mode (Future)

Prepare for dark mode:
```typescript
// Add dark: prefixes
'bg-white dark:bg-gray-900'
'text-gray-900 dark:text-white'
'border-gray-200 dark:border-gray-700'
```

## Testing Against Design

### Visual Regression Testing
- Screenshot on card hover
- Screenshot on modal open
- Screenshot on drag action
- Screenshot on responsive sizes

### Component Testing
- Color application correctness
- Spacing accuracy
- Animation timing
- Focus states

### Accessibility Testing
- Contrast ratio validation
- Keyboard navigation testing
- Screen reader testing
- Focus management

---

**Version:** 1.0.0  
**Last Updated:** April 2024
