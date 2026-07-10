'use client'

import { useState } from 'react'
import {
  Bell,
  Lock,
  User,
  GitBranch,
  Zap,
  Shield,
  Save,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: GitBranch },
  { id: 'ai-settings', label: 'AI Settings', icon: Zap },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'advanced', label: 'Advanced', icon: Shield },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [hasChanges, setHasChanges] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                placeholder="Your name"
                className="mt-2"
                onChange={() => setHasChanges(true)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                className="mt-2"
                onChange={() => setHasChanges(true)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Bio
              </label>
              <Textarea
                placeholder="Tell us about yourself"
                className="mt-2"
                onChange={() => setHasChanges(true)}
              />
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Email Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your repositories
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                onChange={() => setHasChanges(true)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Issue Comments
                </p>
                <p className="text-sm text-muted-foreground">
                  Notify when someone comments on issues
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                onChange={() => setHasChanges(true)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">PR Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Notify when pull requests need review
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                onChange={() => setHasChanges(true)}
              />
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    Connected as @octocat
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">GitLab</p>
                  <p className="text-sm text-muted-foreground">
                    Not connected
                  </p>
                </div>
                <Button size="sm">Connect</Button>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Slack Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates in Slack
                  </p>
                </div>
                <Button size="sm">Connect</Button>
              </div>
            </div>
          </div>
        )

      case 'ai-settings':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">
                AI Model
              </label>
              <Select defaultValue="gpt4">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                AI Temperature
              </label>
              <Input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="mt-2"
                onChange={() => setHasChanges(true)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Controls creativity level (0 = precise, 100 = creative)
              </p>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Auto-generate suggestions
                </p>
                <p className="text-sm text-muted-foreground">
                  Automatically suggest improvements
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                onChange={() => setHasChanges(true)}
              />
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="p-4 border border-border rounded-lg bg-secondary/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enhance your account security with 2FA
                  </p>
                  <Button size="sm" className="mt-3">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium text-foreground mb-3">
                Active Sessions
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-border rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Chrome on macOS
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active 2 hours ago
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">
                API Token
              </label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="password"
                  value="••••••••••••••••••••••••"
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg bg-destructive/10">
              <p className="font-medium text-foreground mb-2">
                Danger Zone
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Irreversible actions that cannot be undone
              </p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left text-sm font-medium ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {settingsSections.find((s) => s.id === activeSection)?.label}
                </CardTitle>
                {hasChanges && <span className="text-xs text-primary">
                  Unsaved changes
                </span>}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderSection()}
              <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                <Button onClick={() => setHasChanges(false)} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setHasChanges(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
