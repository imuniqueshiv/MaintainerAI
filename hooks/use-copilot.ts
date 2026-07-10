'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CopilotConversation, CopilotMessage, CopilotAction } from '@/lib/copilot-utils'
import { generateMessageId, generateConversationId } from '@/lib/copilot-utils'

export function useCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<CopilotConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  // Listen for Ctrl+I keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId)
    : null

  const addMessage = useCallback(
    (content: string, action?: CopilotAction) => {
      if (!activeConversationId) {
        const newConvId = generateConversationId()
        const newConversation: CopilotConversation = {
          id: newConvId,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setConversations((prev) => [newConversation, ...prev])
        setActiveConversationId(newConvId)
      }

      const userMessage: CopilotMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        action,
        timestamp: new Date(),
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      )

      // Simulate AI response with streaming
      setIsStreaming(true)
      setTimeout(() => {
        const assistantMessage: CopilotMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content:
            'I understand you want to ' +
            action?.replace(/-/g, ' ') +
            '. Here are my suggestions...\n\n1. First, consider analyzing the impact\n2. Review related changes\n3. Test thoroughly before merging',
          timestamp: new Date(),
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : conv
          )
        )
        setIsStreaming(false)
      }, 1000)
    },
    [activeConversationId]
  )

  const pinConversation = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv))
    )
  }, [])

  const deleteConversation = useCallback((convId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== convId))
    if (activeConversationId === convId) {
      setActiveConversationId(conversations[0]?.id ?? null)
    }
  }, [activeConversationId, conversations])

  return {
    isOpen,
    setIsOpen,
    conversations,
    activeConversationId,
    setActiveConversationId,
    currentConversation,
    addMessage,
    pinConversation,
    deleteConversation,
    isStreaming,
  }
}
