# Localization Guide

This project uses **i18next** and **react-i18next** for internationalization (i18n) support.

## Supported Languages

- **English (en)** - English
- **French (fr)** - Français (Default)

## Implementation Details

### Libraries Used

- `i18next` - Core i18n functionality
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Automatic language detection

### File Structure

```
src/
├── i18n/
│   ├── config.ts              # i18n configuration
│   └── locales/
│       ├── en.json            # English translations
│       └── fr.json            # French translations
└── components/
    └── theme/
        └── language-switcher.tsx  # Language switcher component
```

### Configuration

The i18n configuration is in `src/i18n/config.ts`:

- **Default language**: French (fr)
- **Fallback language**: French (fr)
- **Detection order**: localStorage → browser navigator
- **Storage**: localStorage

### Translation Files

Translation keys are organized by feature/domain:

- `common` - Common UI elements (buttons, labels, etc.)
- `auth` - Authentication related (login, password, etc.)
- `validation` - Form validation messages
- `nav` - Navigation menu items
- `dashboard` - Dashboard page content
- `newData` - New data page content
- `dataTable` - Data table page content
- `form` - Form labels and placeholders
- `table` - Table headers and pagination

### Usage in Components

Import the `useTranslation` hook:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.unitsProduced")}</p>
    </div>
  );
}
```

### Interpolation

For dynamic values, use interpolation:

```tsx
// In translation file:
{
  "dashboard.since": "since {{date}}"
}

// In component:
t("dashboard.since", { date: format(date, "MMM d, yyyy") })
```

## Language Switcher

The language switcher is located in the sidebar footer. It allows users to:

- See the current language
- Switch between English and French
- Language preference is saved to localStorage

## Adding a New Language

1. Create a new translation file in `src/i18n/locales/` (e.g., `es.json`)
2. Copy the structure from `en.json` or `fr.json`
3. Translate all keys to the new language
4. Import and add the new language to `src/i18n/config.ts`:

```ts
import es from "./locales/es.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }, // Add new language
};
```

5. Add the language to the switcher in `src/components/theme/language-switcher.tsx`:

```ts
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" }, // Add new language
];
```

## Adding New Translation Keys

1. Add the key to all translation files (`en.json` and `fr.json`)
2. Use the key in your component with the `t()` function
3. Ensure consistency across all language files

## Testing

To test translations:

1. Run the development server: `yarn dev`
2. Open the application in your browser
3. Use the language switcher in the sidebar to change languages
4. Verify that all text changes appropriately

## Best Practices

1. **Keep keys organized**: Group related translations together
2. **Use descriptive keys**: Make it clear what the translation is for
3. **Maintain consistency**: Keep all translation files in sync
4. **Avoid hardcoded text**: Always use translation keys
5. **Test all languages**: Ensure translations work in all supported languages
6. **Use interpolation**: For dynamic content, use placeholders

## Notes

- The default language is French as the application is primarily used by French-speaking users
- Language preference persists across browser sessions via localStorage
- If a translation key is missing, i18next will display the key itself as a fallback
