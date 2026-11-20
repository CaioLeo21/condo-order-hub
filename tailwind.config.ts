import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Design system iPackage — tokens em docs/design-system/tokens.json, variáveis em src/index.css.
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				kraft: {
					DEFAULT: 'hsl(var(--kraft))',
					foreground: 'hsl(var(--kraft-foreground))'
				},
				pendente: {
					DEFAULT: 'hsl(var(--pendente))',
					foreground: 'hsl(var(--pendente-foreground))'
				},
				retirada: {
					DEFAULT: 'hsl(var(--retirada))',
					foreground: 'hsl(var(--retirada-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				display: ['"Bricolage Grotesque"', '"Public Sans"', 'system-ui', 'sans-serif'],
				sans: ['"Public Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			},
			fontSize: {
				display: ['40px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.02em' }],
				h1: ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.01em' }],
				h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
				body: ['15px', { lineHeight: '22px' }],
				small: ['13px', { lineHeight: '18px' }],
				label: ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.04em' }],
				code: ['14px', { lineHeight: '20px', fontWeight: '500' }],
			},
			borderRadius: {
				lg: '14px', // radius-lg — cards, modais
				md: 'var(--radius)', // radius-md (10px) — botões, inputs
				sm: '6px' // radius-sm — badges, chips
			},
			boxShadow: {
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
			},
			height: {
				'control-sm': '36px',
				'control-md': '44px',
				'control-lg': '52px',
			},
			minHeight: {
				'control-md': '44px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [animate],
} satisfies Config;
