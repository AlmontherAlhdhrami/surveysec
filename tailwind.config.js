/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
    	extend: {
			colors: {
				'plum': {
				  50: '#F5F3FF',
				  100: '#EDE9FE',
				  200: '#DDD6FE',
				  300: '#C4B5FD',
				  400: '#A78BFA',
				  500: '#8B5CF6',
				  600: '#7C3AED',
				  700: '#6D28D9',
				  800: '#5B21B6',
				  900: '#4C1D95',
				},
				 
        'royal-purple': '#7851A9',
        'butterscotch': '#F5B041',
     
				'gold': {
				  50: '#FFFBEB',
				  100: '#FEF3C7',
				  200: '#FDE68A',
				  300: '#FCD34D',
				  400: '#FBBF24',
				  500: '#F59E0B',
				  600: '#D97706',
				  700: '#B45309',
				  800: '#92400E',
				  900: '#78350F',
				},
				'cream': {
				  50: '#FDFAF6',
				  100: '#FAF5ED',
				  200: '#F4EBE1',
				  300: '#E8DECD',
				}
			},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
				
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
  };
  