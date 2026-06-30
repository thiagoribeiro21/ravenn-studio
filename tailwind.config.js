/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rv-void':     '#03000A',
        'rv-purple':   '#7C3AED',
        'rv-purple-500': '#8B5CF6',
        'rv-purple-400': '#A78BFA',
        'rv-titanium': '#F8F9FA',
        'rv-slate':    '#94A3B8',
        'rv-faint':    '#5B6472',
        'rv-line':     '#1E1B4B',
        'rv-line-strong': '#2A2560',
        'rv-surface':  '#08060F',
        'rv-surface-2':'#0D0A18',
      },
      fontFamily: {
        grotesk: ['"ClashGrotesk-Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
        widest3: '0.4em',
        widest4: '0.55em',
      },
    },
  },
  plugins: [],
};
