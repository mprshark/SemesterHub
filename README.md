<div align="center">
  <img src="./public/logo.png" alt="SemesterHub Logo" width="120" />

  # SemesterHub

  **A high-performance, Neobrutalist class resource portal.**

  [**View Live Demonstration**](https://your-cloudflare-link.pages.dev) 
  <br />
  
  <br />
  <img src="./public/screenshot.png" alt="SemesterHub UI Screenshot" width="800" style="border-radius: 8px; border: 4px solid #000; box-shadow: 8px 8px 0 #000;" />
  <br />
</div>

<br />

## 📖 Overview

SemesterHub is a robust, community-driven web application architected to centralize university class resources. It eliminates the friction of scattered messaging groups by providing a single source of truth for syllabi, past examination papers, laboratory practicals, and peer-reviewed class notes.

## ✨ Core Features

- 📚 **Unified Syllabus Data Architecture:** Instant, structured access to unit breakdowns, examination grading weights, and recommended literature.
- ⚡ **Real-Time Client Search:** Zero-latency client-side filtering by course code or nomenclature without page reloads.
- ☁️ **Community Cloud Storage:** Secure, asynchronous file uploads allowing students to directly distribute PDFs via the Supabase CDN.
- 💬 **Real-Time WebSocket Chat:** An anonymous, floating "Panic Chat" interface powered by Supabase Realtime subscriptions.
- 🎨 **Neobrutalist Design System:** High-contrast aesthetics built entirely with Vanilla CSS variables and fluid typography (`clamp()`) for absolute mobile responsiveness.

## 🛠️ Technical Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/) 
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend Infrastructure:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Realtime & Storage:** Supabase Realtime WebSockets & Public CDN
- **Deployment:** Cloudflare Pages

## 🤝 Contributing

SemesterHub operates under an open-source model. Contributions from the student community are highly encouraged. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-syllabus`)
3. Commit your modifications
4. Open a Pull Request for review

---
<div align="center">
  <i>Engineered for efficiency.</i>
</div>
