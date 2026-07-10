'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Clock, Star, GitBranch, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'

const availableRepos = [
  { id: 1, name: 'react-components', owner: 'vercel', stars: 12500, synced: true, status: 'synced' },
  { id: 2, name: 'next-auth', owner: 'nextauthjs', stars: 8300, synced: true, status: 'synced' },
  { id: 3, name: 'tailwindcss', owner: 'tailwindlabs', stars: 75000, synced: false, status: 'pending' },
  { id: 4, name: 'shadcn-ui', owner: 'shadcn', stars: 45000, synced: false, status: 'available' },
]

export default function ImportPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [importing, setImporting] = useState<number | null>(null)

  const filteredRepos = availableRepos.filter((repo) =>
    `${repo.owner}/${repo.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import Repositories"
        description="Add your GitHub repositories to MaintainerAI and start automating"
      />

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="synced">Synced</TabsTrigger>
          <TabsTrigger value="pending">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search repositories..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid gap-4">
            {filteredRepos.map((repo) => (
              <Card key={repo.id} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {repo.owner}/{repo.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-current" />
                          {repo.stars.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          GitHub
                        </div>
                        <span>TypeScript</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {repo.status === 'synced' ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">Synced</span>
                        </div>
                      ) : repo.status === 'pending' ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Syncing</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setImporting(repo.id)}
                          disabled={importing === repo.id}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {importing === repo.id ? 'Importing...' : 'Import'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="synced" className="space-y-4 mt-6">
          <div className="text-center py-12 text-muted-foreground">
            {filteredRepos.filter((r) => r.status === 'synced').length > 0 ? (
              <div className="grid gap-4">
                {filteredRepos
                  .filter((r) => r.status === 'synced')
                  .map((repo) => (
                    <Card key={repo.id} className="border border-border">
                      <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {repo.owner}/{repo.name}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              'No synced repositories yet'
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          <div className="text-center py-12 text-muted-foreground">
            {filteredRepos.filter((r) => r.status === 'pending').length > 0 ? (
              <div className="grid gap-4">
                {filteredRepos
                  .filter((r) => r.status === 'pending')
                  .map((repo) => (
                    <Card key={repo.id} className="border border-border">
                      <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {repo.owner}/{repo.name}
                          </p>
                          <p className="text-sm text-muted-foreground">Syncing repository data...</p>
                        </div>
                        <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              'No repositories in progress'
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
