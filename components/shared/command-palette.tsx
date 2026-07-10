'use client'

import { useEffect, useState } from 'react'
import { Search, GitBranch, MessageCircle, Users, Settings, Heart, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface Command {
  id: string
  title: string
  category: string
  icon: React.ReactNode
  href?: string
  action?: () => void
}

const commands: Command[] = [
  { id: '1', title: 'Dashboard', category: 'Navigation', icon: <GitBranch className="w-4 h-4" />, href: '/dashboard' },
  { id: '2', title: 'Repositories', category: 'Navigation', icon: <GitBranch className="w-4 h-4" />, href: '/repositories' },
  { id: '3', title: 'Issues', category: 'Navigation', icon: <MessageCircle className="w-4 h-4" />, href: '/issues' },
  { id: '4', title: 'Contributors', category: 'Analytics', icon: <Users className="w-4 h-4" />, href: '/contributors' },
  { id: '5', title: 'Health Center', category: 'Enterprise', icon: <Heart className="w-4 h-4" />, href: '/health' },
  { id: '6', title: 'AI Insights', category: 'Enterprise', icon: <Lightbulb className="w-4 h-4" />, href: '/insights' },
  { id: '7', title: 'Settings', category: 'Configuration', icon: <Settings className="w-4 h-4" />, href: '/settings' },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  const groupedCommands = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const handleSelect = (cmd: Command) => {
    if (cmd.href) {
      router.push(cmd.href)
    }
    if (cmd.action) {
      cmd.action()
    }
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm text-muted-foreground flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search (⌘K)</span>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Type a command or search..."
              className="border-0 bg-transparent focus:outline-none placeholder-muted-foreground"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedCommands).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No commands found</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </div>
                  {cmds.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-muted-foreground">{cmd.icon}</span>
                      <span className="font-medium text-foreground">{cmd.title}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press ESC to close</span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-border text-foreground">⌘K</kbd>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
