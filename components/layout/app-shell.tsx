'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { CommandPalette } from '@/components/shared/command-palette'
import { AICopilotPanel } from '@/components/copilot/ai-copilot-panel'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMarketing = pathname === '/'

  if (isMarketing) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 min-h-screen p-6">{children}</main>
      <CommandPalette />
      <AICopilotPanel />
    </>
  )
}
