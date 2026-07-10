'use client'

import { GitBranch, Download, AlertCircle, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'

const releases = [
  {
    version: '1.2.0',
    date: 'June 15, 2025',
    status: 'latest',
    features: ['AI Copilot improvements', 'PR review enhancements', 'New integrations'],
    improvements: ['Performance optimizations', 'UI polish', 'Accessibility improvements'],
    bugFixes: ['Fixed issue filtering', 'Resolved dashboard crashes'],
    breaking: false,
  },
  {
    version: '1.1.5',
    date: 'June 1, 2025',
    status: 'stable',
    features: ['Community hub launch'],
    improvements: ['Documentation updates'],
    bugFixes: ['Fixed webhook delivery'],
    breaking: false,
  },
  {
    version: '1.1.0',
    date: 'May 15, 2025',
    status: 'stable',
    features: ['Repository insights', 'Automation builder'],
    improvements: ['API response times'],
    bugFixes: ['Various fixes'],
    breaking: true,
    breakingInfo: 'Plugin API structure changed',
  },
]

const upcomingReleases = [
  {
    version: '1.3.0',
    estimatedDate: 'Q3 2025',
    plannedFeatures: ['Advanced analytics', 'Custom workflows', 'Team management'],
  },
  {
    version: '2.0.0',
    estimatedDate: 'Q4 2025',
    plannedFeatures: ['Complete redesign', 'Multi-workspace support', 'Enterprise features'],
  },
]

export default function ReleasesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Releases"
        description="Latest updates and versions of MaintainerAI"
      />

      <Tabs defaultValue="releases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="space-y-6 mt-6">
          {releases.map((release) => (
            <Card key={release.version} className="border border-border">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-foreground">v{release.version}</h3>
                      <div className="flex items-center gap-2">
                        {release.status === 'latest' && (
                          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                            Latest
                          </span>
                        )}
                        {release.status === 'stable' && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                            Stable
                          </span>
                        )}
                        {release.breaking && (
                          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Breaking
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                    </p>
                  </div>

                  <Button className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {release.breaking && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-900 dark:text-red-200">
                      <span className="font-semibold">Breaking Changes:</span> {release.breakingInfo}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Features
                    </h4>
                    <ul className="space-y-2">
                      {release.features.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Improvements</h4>
                    <ul className="space-y-2">
                      {release.improvements.map((improvement) => (
                        <li key={improvement} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Bug Fixes</h4>
                    <ul className="space-y-2">
                      {release.bugFixes.map((bugFix) => (
                        <li key={bugFix} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                          {bugFix}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingReleases.map((release) => (
            <Card key={release.version} className="border border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">v{release.version}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Expected: {release.estimatedDate}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    In Development
                  </span>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-2">Planned Features</p>
                  <ul className="space-y-2">
                    {release.plannedFeatures.map((feature) => (
                      <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="migration" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Migration Guides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">From v1.0 to v1.1</h4>
                <p className="text-sm text-muted-foreground mb-3">No breaking changes. Simply update to the latest version.</p>
                <Button variant="outline" size="sm">
                  View Guide
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-2">From v1.1 to v1.2</h4>
                <p className="text-sm text-muted-foreground mb-3">Minor plugin API updates required for some plugins.</p>
                <Button variant="outline" size="sm">
                  View Guide
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-2">From v0.x to v1.0</h4>
                <p className="text-sm text-muted-foreground mb-3">Major changes. Complete migration guide available.</p>
                <Button variant="outline" size="sm">
                  View Detailed Migration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version Selector */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Download Previous Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {['1.2.0', '1.1.5', '1.1.0', '1.0.0'].map((version) => (
              <Button key={version} variant="outline" className="gap-2 justify-start">
                <Download className="w-4 h-4" />
                v{version}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
