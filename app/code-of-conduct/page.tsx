'use client'

import { AlertCircle, Heart, Shield, Users, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CodeOfConductPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Code of Conduct</h1>
        <p className="text-lg text-muted-foreground">
          Our commitment to a respectful and inclusive community
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Heart, title: 'Respectful', desc: 'Treat everyone with respect' },
          { icon: Shield, title: 'Safe', desc: 'Maintain a harassment-free space' },
          { icon: Users, title: 'Inclusive', desc: 'Welcome all perspectives' },
        ].map((value) => {
          const Icon = value.icon
          return (
            <Card key={value.title} className="border border-border">
              <CardContent className="pt-6 text-center space-y-2">
                <Icon className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Content */}
      <Card className="border border-border">
        <CardContent className="pt-6 prose dark:prose-invert max-w-none">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-3">Our Pledge</h2>
              <p className="text-muted-foreground">
                We are committed to providing a welcoming and inspiring community for all. This Code of Conduct outlines expectations for participation in the MaintainerAI community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Expected Behavior
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Use welcoming and inclusive language
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Be respectful of differing opinions, viewpoints, and experiences
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Accept constructive criticism gracefully
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Focus on what is best for the community
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Show empathy towards other community members
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Unacceptable Behavior
              </h2>
              <p className="text-muted-foreground mb-3">The following behaviors are considered harassment and are unacceptable:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Harassment or discrimination based on protected characteristics
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Violent threats or language directed against another person
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Unwelcome sexual advances or attention
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Publishing others&apos; private information without consent
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Other conduct which could reasonably be considered inappropriate
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Reporting
              </h2>
              <p className="text-muted-foreground">
                If you experience or witness behavior that violates this Code of Conduct, please report it to conduct@maintainerai.dev. All reports will be kept confidential and reviewed promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Enforcement</h2>
              <p className="text-muted-foreground">
                Community leaders will enforce this Code of Conduct fairly and consistently. Those who violate the Code of Conduct may be temporarily or permanently banned from community participation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Attribution</h2>
              <p className="text-muted-foreground">
                This Code of Conduct is adapted from the Contributor Covenant, version 2.0, available at https://www.contributor-covenant.org/version/2/0/code_of_conduct.html
              </p>
            </section>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border border-border bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about our Code of Conduct?
          </p>
          <Button>Contact Us</Button>
        </CardContent>
      </Card>
    </div>
  )
}
