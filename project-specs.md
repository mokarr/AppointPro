# AppointPro Project Specifications

## Project Overview

AppointPro is a comprehensive appointment management system primarily focused on sports facilities and activities. The platform serves multiple user types:

- **Business/Company users:** Sports facility owners and managers
- **Customers:** End-users who book sports facilities
- **Admin users:** Internal administrators who manage the platform

The application provides functionality for scheduling appointments, managing locations, handling subscriptions, and analyzing business performance.

## Project Structure

```
appoint_pro/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── common/           # Shared UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── layout/           # Layout components (header, footer, etc.)
│   │   └── subscription/     # Subscription management components
│   ├── hooks/                # Custom React hooks
│   ├── locales/              # Translation files
│   │   ├── en.json           # English translations
│   │   └── nl.json           # Dutch translations
│   ├── pages/                # Page components (Next.js)
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   └── subscription/     # Subscription management pages
│   ├── services/             # Service layer for API communication
│   ├── store/                # State management
│   ├── styles/               # Global styles and theme
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
```

## Key Files

- **src/locales/en.json & nl.json:** Contain all application translations
- **src/types/index.ts:** Core type definitions for the application
- **src/pages/_app.tsx:** Main application entry point
- **src/components/layout/Layout.tsx:** Main layout wrapper

## Coding Conventions

### TypeScript

- **Strong typing required:** All components, functions, and variables must be properly typed
- **Interfaces/Types:** Define explicit interfaces for all data structures
- **Avoid any:** Use of `any` is discouraged; use proper typing or `unknown` when necessary
- **Type exports:** Export all types from dedicated type files

```typescript
// Example of proper typing
interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  locationId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
}

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

// Function with proper typing
const getAppointment = async (id: string): Promise<Appointment | null> => {
  // Implementation
};
```

### React Components

- **Functional components:** Use functional components with hooks
- **Props typing:** All component props must have explicit interfaces
- **Early returns:** Implement early returns for error/loading states

```tsx
interface UserProfileProps {
  userId: string;
  showDetails: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, showDetails }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Early return example
  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorState message="User not found" />;
  
  return (
    // Component JSX
  );
};
```

### Styling

- **TailwindCSS:** Use Tailwind classes for all styling
- **Class conditionals:** Use the `class:` syntax over ternary operators when possible
- **Descriptive class names:** Use semantic class naming for custom components

```tsx
// Good practice
<button 
  className={`btn-primary ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}
  aria-label="Save changes"
>
  Save
</button>
```

### Event Handlers

- **Naming:** Prefix event handlers with "handle" (e.g., `handleClick`, `handleSubmit`)
- **Typing:** Properly type event parameters

```tsx
// Example of properly typed event handler
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // Implementation
};
```

### Accessibility

- **ARIA attributes:** Include appropriate ARIA attributes on interactive elements
- **Keyboard navigation:** Ensure keyboard navigation works properly
- **Focus management:** Implement proper focus management for modals and dynamic content

```tsx
// Example of accessible component
<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
  aria-label="Close dialog"
  aria-pressed={isPressed}
>
  <CloseIcon />
</button>
```

## Internationalization (i18n)

### Translation Structure

- **Locale files:** Located in `src/locales/` with language-specific JSON files
- **Nested structure:** Translations are organized in nested objects by feature/section
- **Common translations:** Shared translations under the `common` key
- **Feature-specific translations:** Grouped by feature (e.g., `dashboard`, `subscription`)

### Translation Guidelines

- **Complete coverage:** All user-facing text must have translations
- **Placeholder variables:** Use curly braces for variables: `{variableName}`
- **Consistency:** Maintain consistent terminology across translations
- **Context notes:** Add context notes for translators when necessary

### Translation Usage

```tsx
// Example of translation usage
import { useTranslation } from 'next-i18next';

const SubscriptionCard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('subscription.manage.title')}</h2>
      <p>{t('subscription.manage.currentSubscription', { organizationName: orgName })}</p>
    </div>
  );
};
```

## State Management

- **Context API:** Use React Context for global state management
- **Custom hooks:** Implement custom hooks for reusable logic
- **State typing:** All state must be properly typed

```typescript
// Example of typed state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state with proper typing
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};
```

## Error Handling

- **Consistent approach:** Use a consistent error handling pattern throughout the application
- **User-friendly messages:** Display appropriate user-facing error messages
- **Error boundaries:** Implement React Error Boundaries for component-level error handling
- **Typed errors:** Define explicit error types

## Testing

- **Unit tests:** Write unit tests for utility functions and hooks
- **Component tests:** Test components in isolation
- **Integration tests:** Test component interactions
- **E2E tests:** End-to-end tests for critical user flows

## Performance Considerations

- **Memoization:** Use React.memo, useMemo, and useCallback appropriately
- **Code splitting:** Implement code splitting for large components
- **Lazy loading:** Use lazy loading for images and non-critical components
- **Bundle optimization:** Regularly analyze and optimize bundle size

## Documentation

- **Code comments:** Document complex logic with clear comments
- **JSDoc:** Use JSDoc for function and component documentation
- **README:** Maintain up-to-date README files for major directories
- **Inline documentation:** Document complex components with explanatory comments

## Git Workflow

- **Branch naming:** Use feature/, bugfix/, hotfix/ prefixes
- **Commit messages:** Follow conventional commits format
- **Pull requests:** Include description and reference related issues
- **Code reviews:** Require code reviews before merging

## Deployment

- **Environment variables:** Use environment variables for configuration
- **CI/CD:** Implement continuous integration and deployment
- **Staging environment:** Test changes in staging before production
- **Monitoring:** Implement monitoring and error tracking 