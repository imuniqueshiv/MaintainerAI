'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { GitBranch, Menu, Moon, Sun, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '/github-app', label: 'GitHub App' },
  { href: '/docs', label: 'Docs' },
  { href: '/community', label: 'Community' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/releases', label: 'Roadmap' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const menuId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors',
        scrolled
          ? 'border-border/80 bg-background/80 backdrop-blur-xl'
          : 'border-transparent bg-background/60 backdrop-blur-md',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" aria-hidden />
          </div>
          <span className="text-lg font-bold text-foreground">MaintainerAI</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:inline-flex"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <GitBranch className="h-4 w-4" />
              GitHub
            </Button>
          </a>
          <Link href="/onboarding" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button size="sm">Open Dashboard</Button>
          </Link>
          <Link href="/install" className="hidden lg:inline-flex">
            <Button size="sm">Install GitHub App</Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div
          id={menuId}
          className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
            <span className="px-3 py-3 text-sm text-muted-foreground">Pricing — Coming soon</span>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <GitBranch className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
              <Link href="/onboarding" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full">Open Dashboard</Button>
              </Link>
              <Link href="/install" onClick={() => setOpen(false)}>
                <Button className="w-full">Install GitHub App</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
