# Command Inbox

> **One command center for your digital life.**

Command Inbox is an AI-powered productivity workspace designed to bring services like **Gmail** and **Google Calendar** into one place. Instead of jumping between different apps to find information or complete simple tasks, the goal is to give users a single interface where they can **see, search, and act on their connected services through natural language**.

---

## 🚀 What is Command Inbox?

Modern productivity is fragmented.

Your emails live in Gmail.  
Your meetings live in Google Calendar.  
Important information is scattered across conversations, notifications, and different applications.

**Command Inbox** is being built to solve that fragmentation.

The core idea is simple:

> **Tell Command Inbox what you need, and let it figure out where the information lives and what needs to be done.**

For example:

```text
"What meetings do I have tomorrow?"

"Show me my recent emails."

"Did I receive anything important today?"

"What is my schedule for this afternoon?"
```

The long-term vision is to turn Command Inbox into a **personal command layer over the user's digital workspace**.

---

# ✨ Current Features

## 📥 Unified Inbox

Command Inbox currently connects to the user's email service and brings emails into its own interface.

Users can view their emails without having to leave the Command Inbox workspace.

The inbox/dashboard is intended to become the central place for information coming from multiple connected services.

---

## 📧 Gmail Integration

Gmail integration is currently implemented through **Corsair**.

The current setup allows a user to authenticate and connect their Gmail account, after which email data can be retrieved and displayed inside Command Inbox.

### Current flow

```text
User
  ↓
Command Inbox
  ↓
Corsair
  ↓
Gmail OAuth
  ↓
Connected Gmail Account
  ↓
Email Data
  ↓
Command Inbox Inbox / Dashboard
```

The OAuth setup currently uses **manual OAuth authentication**, which resolved the previous connection/authentication issues encountered during development.

---

## 📅 Google Calendar Integration

Google Calendar is part of the connected-services architecture and is intended to provide the same unified experience for calendar information.

The goal is to allow Command Inbox to understand both:

```text
Email + Calendar
```

rather than treating them as completely separate applications.

This enables future commands such as:

```text
"What do I have scheduled tomorrow?"

"When am I free this week?"

"Show me the emails related to my meetings."

"Do I have anything scheduled after my 3 PM meeting?"
```

---

# 🤖 AI Assistant

Command Inbox includes an AI assistant designed to act as the user's natural-language interface to their connected services.

Instead of forcing the user to navigate through multiple screens, the assistant should understand intent and use the appropriate connected service to retrieve the required information.

Conceptually:

```text
User Request
     ↓
AI Assistant
     ↓
Understand Intent
     ↓
Choose Relevant Service
     ↓
Call Connected Service
     ↓
Process Result
     ↓
Return Useful Answer
```

For example:

```text
User:
"What emails did I get today?"

        ↓

AI understands:
Service = Gmail
Task = Retrieve today's emails

        ↓

Gmail via Corsair

        ↓

AI summarizes / presents results
```

The assistant is being designed around **actions and information retrieval**, rather than simply being a generic chatbot.

---

# 🔌 Corsair Integration

Command Inbox uses **Corsair** as the connection layer between the application and external services.

This provides a cleaner architecture where Command Inbox does not need to implement every third-party integration completely from scratch.

Current integrations being worked with include:

- Gmail
- Google Calendar
- GitHub

The architecture is intended to make additional integrations easier to add later.

Conceptually:

```text
                  ┌───────────────┐
                  │ Command Inbox │
                  └───────┬───────┘
                          │
                       Corsair
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
       Gmail          Calendar         GitHub
```

---

# 🔐 Authentication

Command Inbox uses **Better Auth** for application authentication.

This keeps user authentication separate from third-party service authentication.

There are therefore two distinct concepts:

### Application Authentication

```text
User
 ↓
Better Auth
 ↓
Command Inbox Account
```

### Connected Service Authentication

```text
Command Inbox
 ↓
Corsair
 ↓
OAuth
 ↓
Gmail / Calendar / Other Service
```

Keeping these responsibilities separate makes the architecture easier to reason about and extend.

---

# 🏗️ Architecture

The project currently follows a modular architecture built around:

```text
Frontend
   │
   ├── Dashboard
   ├── Inbox
   └── AI Assistant
          │
          ↓
       Backend
          │
          ├── Authentication
          │      └── Better Auth
          │
          └── Integrations
                 └── Corsair
                       ├── Gmail
                       ├── Calendar
                       └── GitHub
```

The exact architecture will continue to evolve as more actions and integrations are added.

---

# 🛠️ Tech Stack

The project is currently being developed using modern web technologies.

### Core

- **TypeScript**
- **React / Next.js**
- **Node.js**
- **PostgreSQL**
- **Drizzle ORM**

### Authentication

- **Better Auth**

### Integrations

- **Corsair**
- Gmail
- Google Calendar
- GitHub

### Development

- **pnpm**
- **Docker** for local infrastructure where required

---

# 📌 Current Project Status

Command Inbox is currently in the **early working-product stage**.

The most important foundation has been established:

- [x] Project foundation
- [x] Application authentication with Better Auth
- [x] Database setup
- [x] Corsair integration
- [x] Gmail OAuth connection
- [x] Gmail data retrieval
- [x] Emails appearing inside Command Inbox
- [x] Inbox/dashboard foundation
- [x] AI assistant architecture
- [ ] Complete AI command/action layer
- [ ] Calendar experience
- [ ] Cross-service actions
- [ ] Advanced search
- [ ] Automation
- [ ] Production hardening

The project is no longer just a UI prototype — it has a working connection to a real external service.

---

# 🗺️ Roadmap

## Phase 1 — Foundation

**Status: Mostly complete**

- [x] Authentication
- [x] Database
- [x] Gmail connection
- [x] OAuth flow
- [x] Basic inbox
- [x] Corsair integration
- [x] Initial AI assistant

---

## Phase 2 — Make the Assistant Useful

The next major goal is turning the assistant from a conversational interface into an actual **command interface**.

Examples:

```text
"Show me emails from today."

"Find the email from my professor."

"What meetings do I have tomorrow?"

"Show unread emails."

"Find emails containing 'project'."
```

The assistant should:

1. Understand the request.
2. Determine which service is required.
3. Call the appropriate tool.
4. Process the result.
5. Present the information clearly.

---

## Phase 3 — Actions

The assistant should eventually be able to perform actions, not just retrieve information.

Examples:

### Gmail

```text
"Mark this email as read."

"Archive this email."

"Reply to this email."

"Send an email to Alex."

"Star this email."
```

### Calendar

```text
"Create a meeting tomorrow at 4 PM."

"Move my 3 PM meeting to 5 PM."

"Cancel my meeting with Alex."

"Add a reminder for Friday."
```

Actions should require appropriate confirmation where necessary, especially for destructive or externally visible operations.

---

# 🔎 Phase 4 — Universal Search

One of the most valuable features could be a **cross-service search layer**.

Instead of searching Gmail and Calendar independently:

```text
"Find everything related to the BlockForm project."
```

Command Inbox could search across connected services and return:

```text
📧 Emails
📅 Calendar events
💬 Future integrations
📄 Documents
```

This moves Command Inbox from being an inbox replacement toward becoming a **unified information layer**.

---

# 🧠 Phase 5 — Context-Aware AI

The assistant can eventually understand relationships between information.

For example:

```text
"What's my meeting with Rahul about?"
```

The system could potentially:

1. Find the calendar event.
2. Identify relevant participants.
3. Search related emails.
4. Summarize the context.
5. Present everything together.

Instead of simply answering:

> "You have a meeting at 3 PM."

it could eventually answer:

> "You have a 3 PM meeting with Rahul about the project. The latest related email was yesterday, where you discussed the API integration."

This is where the product starts becoming significantly more powerful.

---

# ⚡ Phase 6 — Automations

A future version could allow users to create personal workflows.

For example:

```text
"When I receive an email from my college,
add it to my important inbox."
```

or:

```text
"Every morning, summarize my important emails
and tell me what meetings I have today."
```

or:

```text
"If a meeting is scheduled,
find related emails and prepare a summary."
```

This would turn Command Inbox into a **personal productivity automation layer**.

---

# 🔗 Future Integrations

The architecture can eventually expand beyond Gmail and Calendar.

Potential integrations include:

- Slack
- Notion
- GitHub
- Google Drive
- Todoist
- Linear
- Discord
- Microsoft Outlook
- Microsoft Teams
- Other productivity and communication services

The long-term goal is not to build another version of every individual application.

It is to connect them.

---

# 🎯 Long-Term Vision

The ultimate vision for Command Inbox is:

> **A single AI command center that understands your digital workspace and helps you act across it.**

Instead of:

```text
Gmail → search
Calendar → check schedule
Notion → find notes
GitHub → check issue
Slack → search conversation
```

the experience becomes:

```text
              COMMAND INBOX

        "What's important today?"
                    ↓
        ┌──────────────────────┐
        │ AI understands       │
        │ the user's context   │
        └──────────┬───────────┘
                   ↓
       ┌───────────┼───────────┐
       ↓           ↓           ↓
     Gmail      Calendar     GitHub
       ↓           ↓           ↓
       └───────────┼───────────┘
                   ↓
             Unified Answer
```

The user should not need to think about **which application contains the information**.

They should only need to think about **what they want to accomplish**.

---

# 🔒 Security & Privacy Goals

As Command Inbox becomes more deeply integrated with users' services, security will become increasingly important.

Future work should include:

- Secure OAuth token handling
- Minimal required permissions
- Clear connected-account management
- Safe handling of sensitive email/calendar data
- Confirmation before destructive actions
- Strong authorization boundaries
- Secure webhook handling
- Audit logging for important actions
- Clear data retention policies

The application should always follow the principle of:

> **Only access what is necessary to perform the requested task.**

---

# 🧪 Development Philosophy

Command Inbox is being built incrementally.

The approach is:

```text
Build
 ↓
Connect to a real service
 ↓
Test with real data
 ↓
Fix the architecture
 ↓
Add the next capability
 ↓
Repeat
```

The priority is not to build every feature immediately.

The priority is to establish a strong foundation and gradually turn it into something genuinely useful.

---

# 📈 Current Focus

The immediate focus is to move from:

> **"I can connect Gmail and display emails."**

to:

> **"I can actually use Command Inbox to manage my digital work through natural language."**

The next milestones should therefore focus on:

1. Making the AI assistant reliably retrieve information.
2. Adding Gmail commands.
3. Completing Calendar integration.
4. Adding safe write actions.
5. Improving the unified dashboard.
6. Building cross-service search.
7. Adding automation capabilities.

---

# 🤝 Contributing

Command Inbox is currently primarily a personal development project.

As the project matures, contribution guidelines, issue templates, and development documentation can be added here.

---

# 📜 License

License information will be added as the project approaches a public release.

---

## 🌱 From Prototype to Personal Command Center

Command Inbox started as an idea to bring productivity services together.

It is gradually becoming something more ambitious:

**an AI interface between the user and their digital world.**

The goal isn't to create another app that users have to constantly manage.

The goal is to make the user's existing tools **feel like one system**.
