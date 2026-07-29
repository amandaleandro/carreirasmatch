import type { Preview } from '@storybook/react-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  globalTypes: {
    theme: {
      description: 'Tema global (CarreirasMatch usa data-theme, não prefers-color-scheme)',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Claro' },
          { value: 'dark', icon: 'moon', title: 'Escuro' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'light',
  },

  decorators: [
    (Story, context) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', context.globals.theme ?? 'light');
      }
      return (
        <div className="p-6">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
