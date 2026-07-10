export type CopilotAction =
  | 'repository-chat'
  | 'ask-repository'
  | 'generate-issue'
  | 'review-pr'
  | 'explain-code'
  | 'generate-labels'
  | 'generate-documentation'
  | 'generate-changelog'
  | 'suggest-contributors'
  | 'find-duplicates'
  | 'generate-roadmap'
  | 'generate-release-notes';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: CopilotAction;
  timestamp: Date;
  isPinned?: boolean;
}

export interface CopilotConversation {
  id: string;
  title: string;
  messages: CopilotMessage[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

export const copilotActions: { label: string; action: CopilotAction; icon: string; description: string }[] = [
  { label: 'Repository Chat', action: 'repository-chat', icon: 'MessageCircle', description: 'Chat about your repository' },
  { label: 'Ask Repository', action: 'ask-repository', icon: 'HelpCircle', description: 'Ask questions about code' },
  { label: 'Generate Issue', action: 'generate-issue', icon: 'FileText', description: 'Create issues with AI' },
  { label: 'Review PR', action: 'review-pr', icon: 'GitBranch', description: 'Get PR review suggestions' },
  { label: 'Explain Code', action: 'explain-code', icon: 'Code', description: 'Understand code snippets' },
  { label: 'Generate Labels', action: 'generate-labels', icon: 'Tag', description: 'Auto-generate issue labels' },
  { label: 'Generate Documentation', action: 'generate-documentation', icon: 'BookOpen', description: 'Create documentation' },
  { label: 'Generate Changelog', action: 'generate-changelog', icon: 'History', description: 'Create release notes' },
  { label: 'Suggest Contributors', action: 'suggest-contributors', icon: 'Users', description: 'Find potential contributors' },
  { label: 'Find Duplicates', action: 'find-duplicates', icon: 'AlertCircle', description: 'Find duplicate issues' },
  { label: 'Generate Roadmap', action: 'generate-roadmap', icon: 'Map', description: 'Create project roadmap' },
  { label: 'Generate Release Notes', action: 'generate-release-notes', icon: 'Rocket', description: 'Create release notes' },
];

export const suggestedPrompts: { category: string; prompts: string[] }[] = [
  {
    category: 'Repository',
    prompts: [
      'What are the main issues in this repository?',
      'Suggest improvements for code quality',
      'What are the most critical PRs?',
    ],
  },
  {
    category: 'Issues',
    prompts: [
      'Help me prioritize these issues',
      'Generate labels for new issues',
      'Find duplicate issues',
    ],
  },
  {
    category: 'Pull Requests',
    prompts: [
      'Review this PR for security issues',
      'Check for performance problems',
      'Suggest test coverage improvements',
    ],
  },
  {
    category: 'Documentation',
    prompts: [
      'Generate API documentation',
      'Create contributing guide',
      'Write changelog for version 2.0',
    ],
  },
];

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
