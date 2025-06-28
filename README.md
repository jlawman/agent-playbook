# Agent Playbook CLI 🤖

Transform your ideas into comprehensive AI agent playbooks using AI-guided discovery.

<p align="center">
  <a href="https://www.npmjs.com/package/agent-playbook"><img src="https://img.shields.io/npm/v/agent-playbook.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/agent-playbook"><img src="https://img.shields.io/npm/dm/agent-playbook.svg" alt="npm downloads"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue" alt="TypeScript">
</p>

## ✨ Features

- **AI-Powered Discovery**: Leverages Claude or Gemini AI to ask targeted questions about your agent concept
- **Structured Workflow**: Three rounds of increasingly specific questions to refine your vision
- **Quick Number Selection**: Press 1-9 to instantly select answers, 0 for custom input, 's' to skip
- **Agent Playbooks**: Generates comprehensive playbooks including behavior patterns, capabilities, and implementation details
- **File Structure Generation**: Creates an optimal project structure with all necessary files and directories
- **Session Management**: Save and resume sessions, never lose your progress
- **Beautiful CLI**: Intuitive interface with colors, progress indicators, and clear navigation
- **Export Options**: Export to Markdown or JSON for easy sharing and processing

## 🎯 How It Works

1. **Initial Idea**: Start with your agent concept
2. **Discovery Questions**: Answer 3 rounds of AI-generated multiple-choice questions
   - Round 1: General requirements and audience
   - Round 2: User experience and differentiation  
   - Round 3: Technical implementation details
3. **Agent Playbook**: AI generates a comprehensive agent playbook
4. **File Structure**: Creates an optimal project structure
5. **Export**: Save as Markdown or JSON for your team

## 📦 Installation

```bash
npm install -g agent-playbook

# Or run directly with npx
npx agent-playbook
```

## 🚀 Quick Start

```bash
# Start interactive mode
agent-playbook

# Start with an idea
agent-playbook new --idea "Customer service AI agent"

# Resume a session
agent-playbook resume

# List all sessions
agent-playbook list
```

## 📖 Commands

### `agent-playbook new`
Start a new agent playbook session.

Options:
- `-i, --idea <idea>` - Start with a predefined idea
- `-s, --skip-questions` - Use default configuration

### `agent-playbook resume`
Resume a previous session from where you left off.

### `agent-playbook list`
Display all your sessions with their status and last update time.

### `agent-playbook export [sessionId]`
Export a session to markdown or JSON format.

Options:
- `-f, --format <format>` - Export format: `markdown`, `json`, or `both`

### `agent-playbook clean`
Remove old sessions to free up space.

Options:
- `-d, --days <days>` - Keep sessions newer than this many days (default: 30)
- `-f, --force` - Skip confirmation prompt

### `agent-playbook config [action]`
Manage configuration and API keys.

Actions:
- `reset` - Reset all settings to defaults
- `keys` - Manage API keys

## ⚙️ Configuration

### API Keys

Set your API keys as environment variables:

```bash
export ANTHROPIC_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here
```

Or let the CLI prompt you and save them securely.

### Session Options

During setup, you can configure:
- **Number of questions per round** (2-8 for first round, 2-6 for subsequent)
- **Answer choices per question** (2-6 options)
- **AI provider** (Anthropic Claude or Google Gemini)

## 📁 Output Example

### Generated Agent Playbook
```markdown
# Customer Service AI Agent

## Executive Summary
An intelligent customer service agent that handles inquiries, provides support, and escalates complex issues...

## Core Capabilities
1. Natural Language Understanding
2. Multi-turn Conversations
3. Issue Resolution
...
```

### Generated File Structure
```
customer-service-agent/
├── src/
│   ├── agents/
│   │   ├── CustomerServiceAgent.ts
│   │   ├── ConversationHandler.ts
│   │   └── IssueResolver.ts
│   ├── services/
│   │   ├── ai-service.ts
│   │   └── knowledge-base.ts
│   └── handlers/
│       ├── index.ts
│       └── escalation.ts
├── package.json
└── README.md
```

## 🔒 Privacy & Security

- API keys are stored locally in your system's config directory
- Sessions are saved locally in `~/.agent-playbook/sessions/`
- No data is sent to external servers except AI API calls
- You can clear all data with `agent-playbook config reset`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

---

<p align="center">Made with Claude Code for Claude Code</p>