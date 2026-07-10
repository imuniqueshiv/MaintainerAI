import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { HeroSection } from '@/components/marketing/hero-section'
import { OpenSourceSection } from '@/components/marketing/open-source-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { DashboardPreviewSection } from '@/components/marketing/dashboard-preview-section'
import { OssExperienceSection } from '@/components/marketing/oss-experience-section'
import { CommunitySection } from '@/components/marketing/community-section'
import { TechStackSection } from '@/components/marketing/tech-stack-section'
import { BuiltForSection } from '@/components/marketing/built-for-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'
import '@/components/marketing/marketing-animations.css'

export const metadata: Metadata = {
  title: 'MaintainerAI — AI-powered operating system for GitHub maintainers',
  description:
    'Open-source AI platform for GitHub maintainers. Triage issues, review PRs, measure repository health, automate workflows, and self-host with Docker.',
  alternates: {
    canonical: '/',
  },
}

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <main id="main-content">
        <HeroSection />
        <OpenSourceSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <OssExperienceSection />
        <CommunitySection />
        <TechStackSection />
        <BuiltForSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
