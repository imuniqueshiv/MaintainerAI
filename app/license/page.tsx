'use client'

import { FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LicensePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">License</h1>
        <p className="text-lg text-muted-foreground">
          MaintainerAI is open source and licensed under the MIT License
        </p>
      </div>

      {/* License Summary */}
      <Card className="border border-border bg-gradient-to-r from-green-50/50 dark:from-green-900/10 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">MIT License Summary</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">You can use it freely</p>
                  <p className="text-xs text-muted-foreground">For personal, commercial, or any other purpose</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">You can modify it</p>
                  <p className="text-xs text-muted-foreground">Change, adapt, and build upon the code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">You can distribute it</p>
                  <p className="text-xs text-muted-foreground">Share your version with others</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">You must include the license</p>
                  <p className="text-xs text-muted-foreground">Include a copy of the MIT license with your distribution</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full License Text */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            MIT License Text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/30 p-6 rounded-lg font-mono text-xs text-foreground/70 space-y-4 max-h-96 overflow-y-auto">
            <p>MIT License</p>
            <p>Copyright (c) 2025 MaintainerAI Contributors</p>
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
              documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the
              rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
              persons to whom the Software is furnished to do so, subject to the following conditions:
            </p>
            <p>
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
              Software.
            </p>
            <p>
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
              COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
              OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Open Source Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            MaintainerAI includes code from these amazing open source projects:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Next.js', license: 'MIT' },
              { name: 'React', license: 'MIT' },
              { name: 'Tailwind CSS', license: 'MIT' },
              { name: 'shadcn/ui', license: 'MIT' },
              { name: 'Lucide Icons', license: 'ISC' },
              { name: 'Radix UI', license: 'MIT' },
            ].map((dep) => (
              <div key={dep.name} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">{dep.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{dep.license}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border border-border bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Want to contribute to MaintainerAI? We&apos;d love to have you on board!
          </p>
          <Button>View Contribution Guide</Button>
        </CardContent>
      </Card>
    </div>
  )
}
