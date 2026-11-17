const defaultTheme = require('tailwindcss/defaultTheme');

const display = ['Fraunces', ...defaultTheme.fontFamily.serif];

module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                accent: 'rgb(var(--color-accent) / <alpha-value>)',
                paper: 'rgb(var(--color-paper) / <alpha-value>)',
                ink: 'rgb(var(--color-ink) / <alpha-value>)',
                muted: 'rgb(var(--color-muted) / <alpha-value>)',
                rule: 'rgb(var(--color-rule) / <alpha-value>)'
            },
            fontFamily: {
                serif: ['Newsreader', ...defaultTheme.fontFamily.serif],
                display
            },
            typography: () => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-body': 'rgb(var(--color-ink) / 0.88)',
                        '--tw-prose-headings': 'rgb(var(--color-ink))',
                        '--tw-prose-lead': 'rgb(var(--color-muted))',
                        '--tw-prose-links': 'rgb(var(--color-accent))',
                        '--tw-prose-bold': 'rgb(var(--color-ink))',
                        '--tw-prose-counters': 'rgb(var(--color-muted))',
                        '--tw-prose-bullets': 'rgb(var(--color-muted) / 0.6)',
                        '--tw-prose-hr': 'rgb(var(--color-rule))',
                        '--tw-prose-quotes': 'rgb(var(--color-ink))',
                        '--tw-prose-quote-borders': 'rgb(var(--color-accent))',
                        '--tw-prose-captions': 'rgb(var(--color-muted))',
                        '--tw-prose-code': 'rgb(var(--color-ink))',
                        '--tw-prose-pre-code': 'rgb(var(--color-paper))',
                        '--tw-prose-pre-bg': 'rgb(var(--color-ink))',
                        '--tw-prose-th-borders': 'rgb(var(--color-rule))',
                        '--tw-prose-td-borders': 'rgb(var(--color-rule))',
                        'h1, h2, h3, h4': {
                            fontFamily: display.join(', '),
                            fontWeight: 500,
                            letterSpacing: '-0.01em'
                        },
                        a: {
                            textDecorationThickness: '1px',
                            textUnderlineOffset: '0.2em',
                            '&:hover': {
                                color: 'rgb(var(--color-ink))'
                            }
                        },
                        blockquote: {
                            borderLeftWidth: '2px',
                            fontFamily: display.join(', '),
                            fontSize: '1.25em',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            lineHeight: 1.45
                        }
                    }
                }
            })
        }
    },
    plugins: [require('@tailwindcss/typography')]
};
