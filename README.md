<div align="center">
    
# ⚡ CLYENTRA
### The Client Feedback Enforcer

![Typing SVG](https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=900&size=40&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=false&width=800&height=70&lines=Not+Creativity.+Accountability.;Eliminate+Revision+Hell.;Enforce+Client+Compliance.)

<p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://prisma.io"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"></a>
    <a href="https://groq.com"><img src="https://img.shields.io/badge/AI-Llama_3.3-f55036?style=for-the-badge&logo=openai&logoColor=white" alt="AI"></a>
</p>

[View Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 🚨 The Agency Problem

> *"I thought I told you to change this?"* — **Every Client, Ever.**

In the chaos of design agencies (like Figmenta), feedback is **fragmented**. It lives in:
- 📧 50-thread Email chains
- 💬 Slack DMs
- 📱 WhatsApp Voice Notes
- 📞 "Quick Calls"

**The result?** Designers miss things. Revisions pile up. Trust erodes. Money burns.

## ⚔️ The Solution: Clyentra

**Clyentra** is not a project management tool. It is a **Compliance Engine**. 

It uses **Llama 3.3 (70b-Versatile)** to deconstruct messy "Client Talk" into a rigid, non-negotiable checklist that must be cleared before work is submitted.

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=16&duration=2000&pause=2000&color=A1A1AA&center=true&vCenter=true&multiline=true&width=600&height=60&lines=%3E+Input%3A+Messy+Email+Rants;%3E+Output%3A+Structured+Tactical+Data" alt="Process Animation" />
</div>

---

## ⚡ Core Loops

### 1. 🧬 Feedback DNA Extraction
Paste *any* unstructured text. The AI stripes out the noise ("Hope you're well!", "Just a thought...") and extracts raw **Action Items** and **Questions**.

```mermaid
graph LR
    A[📩 Client Email] -->|Paste| B(⚡ AI Parser)
    B -->|Extract| C{Signals}
    C -->|Task| D[✅ Action Item]
    C -->|Question| E[❓ Clarification]
    C -->|Vibe| F[🎨 Sentiment Check]
    style B fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff
```

### 2. 🛡️ The Compliance Shield
Before sending a revision, the designer must "Commit" their work against the checklist.
- **AI Verification**: Checks if the designer's summary matches the client's requests.
- **Loop Prevention**: Detects if a client contradicts their *own* previous feedback.

---

## 🛠️ Cyber-Brutalist Stack

We deliberately chose a "Developer-First" aesthetic and stack to prioritize speed and reliability.

| Layer | Technology | Status |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | 🟢 Production |
| **Styling** | Tailwind CSS v4 | 🟢 Alpha |
| **Typography** | Space Grotesk / JetBrains Mono | 🟢 Custom |
| **Intelligence** | Groq SDK (Llama 3.3) | ⚡ <100ms Latency |
| **Data** | PostgreSQL + Prisma | 🔒 Strict Schema |
| **Animations** | Framer Motion | 🌊 60fps |

---

## 🚀 Installation Protocol

**01. Clone the Repository**
```bash
git clone https://github.com/RichardRajuChirayath/Client-Feedback-Enforcer.git
```

**02. Inject Dependencies**
```bash
npm install
```

**03. Configure Environment**
```bash
cp env.example .env
# Add your GROQ_API_KEY and DATABASE_URL
```

**04. Ignite Database**
```bash
npx prisma migrate dev --name init
```

**05. Launch System**
```bash
npm run dev
```

---

## 🔮 The "Smart Fallback" Architecture

Clyentra features a robust **"Anti-Crash"** system for its Inspiration Lab.

*   **Primary Path**: Direct Web Scraping (Puppeteer-lite approach) to read live site DOM.
*   **Defense Mechanism**: If a site blocks our bot (e.g., Stripe, Apple), the system **automatically** switches to "Knowledge Mode".
*   **Result**: The user *always* gets a strategy breakdown, even if the target site is fortified.

---

<div align="center">

**Built by [Richard Raju Chirayath](https://github.com/RichardRajuChirayath)**

*"Good design is non-negotiable. Compliance is mandatory."*

</div>
