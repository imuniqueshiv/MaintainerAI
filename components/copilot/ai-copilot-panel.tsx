'use client'

import { useState } from 'react'
import { X, Send, Plus, Pin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useCopilot } from '@/hooks/use-copilot'
import { copilotActions, suggestedPrompts } from '@/lib/copilot-utils'
import type { CopilotAction } from '@/lib/copilot-utils'

export function AICopilotPanel() {
  const {
    isOpen,
    setIsOpen,
    conversations,
    activeConversationId,
    setActiveConversationId,
    currentConversation,
    addMessage,
    pinConversation,
    isStreaming,
  } = useCopilot()
  const [input, setInput] = useState('')

  const handleSendMessage = (content: string, action?: CopilotAction) => {
    if (!content.trim()) return
    addMessage(content, action)
    setInput('')
  }

  if (!isOpen) return null

  const pinnedConversations = conversations.filter((c) => c.isPinned)
  const recentConversations = conversations.filter((c) => !c.isPinned).slice(0, 5)

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">AI Copilot</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-48 border-r border-border overflow-y-auto bg-muted/30">
          {/* New Conversation */}
          <div className="p-3 border-b border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 justify-start"
              onClick={() => {
                setActiveConversationId(null)
                setInput('')
              }}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Pinned */}
          {pinnedConversations.length > 0 && (
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Pinned</p>
              <div className="space-y-1">
                {pinnedConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded truncate transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent */}
          {recentConversations.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Recent</p>
              <div className="space-y-1">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-1 group">
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`flex-1 text-left px-2 py-1.5 text-sm rounded truncate transition-colors ${
                        activeConversationId === conv.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {conv.title}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => pinConversation(conv.id)}
                    >
                      <Pin className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(input)
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(input)}
                    disabled={isStreaming || !input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Actions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {copilotActions.map((action) => (
                    <Card
                      key={action.action}
                      className="p-2 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => handleSendMessage(`Please ${action.description.toLowerCase()}`, action.action)}
                    >
                      <p className="text-xs font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Suggested Prompts */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Prompts</p>
                {suggestedPrompts.map((section) => (
                  <div key={section.category} className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">{section.category}</p>
                    <div className="space-y-1">
                      {section.prompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full text-left text-xs p-2 rounded bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground flex items-center justify-between group"
                        >
                          <span>{prompt}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
