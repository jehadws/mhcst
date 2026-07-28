import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { dictionary, type Dictionary, type Locale } from '@/data/i18n'

type Theme = 'light' | 'dark'

interface SiteContextValue {
    locale: Locale
    dir: 'ltr' | 'rtl'
    isRTL: boolean
    t: Dictionary
    theme: Theme
    setLocale: (l: Locale) => void
    toggleLocale: () => void
    setTheme: (t: Theme) => void
    toggleTheme: () => void
    tr: (value: Record<Locale, string>) => string
}

interface SiteProviderProps {
    children: React.ReactNode
    initialLocale: Locale
    initialDirection: 'ltr' | 'rtl'
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children, initialLocale, initialDirection }: SiteProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)
    const [theme, setThemeState] = useState<Theme>('light')

    // Theme: load from localStorage (client-only, no hydration issue)
    useEffect(() => {
        const savedTheme = (localStorage.getItem('ms-theme') as Theme | null) ?? null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setThemeState(savedTheme ?? (prefersDark ? 'dark' : 'light'))
    }, [])

    // Locale: sync <html> instantly
    useEffect(() => {
        const html = document.documentElement
        html.lang = locale
        html.dir = locale === 'ar' ? 'rtl' : 'ltr'
        html.classList.toggle('rtl', locale === 'ar')
        localStorage.setItem('ms-locale', locale)
    }, [locale])

    // Theme: sync dark mode
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('ms-theme', theme)
    }, [theme])

    // Set locale instantly + sync to Laravel session in background
    const setLocale = useCallback(async (l: Locale) => {
        setLocaleState(l)

        try {
            await axios.post(route('locale.update'), { locale: l })
        } catch (error) {
            console.error('Failed to sync locale:', error)
        }
    }, [])

    const toggleLocale = useCallback(() => {
        setLocale(locale === 'en' ? 'ar' : 'en')
    }, [locale, setLocale])

    const setTheme = useCallback((t: Theme) => setThemeState(t), [])
    const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')), [])

    const value = useMemo<SiteContextValue>(
        () => ({
            locale,
            dir: locale === 'ar' ? 'rtl' : 'ltr',
            isRTL: locale === 'ar',
            t: dictionary[locale],
            theme,
            setLocale,
            toggleLocale,
            setTheme,
            toggleTheme,
            tr: (v) => v[locale],
        }),
        [locale, theme, setLocale, toggleLocale, setTheme, toggleTheme],
    )

    return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
    const ctx = useContext(SiteContext)
    if (!ctx) throw new Error('useSite must be used within SiteProvider')
    return ctx
}
