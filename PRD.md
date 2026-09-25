# Product Requirements Document (PRD)

## Job Tracker Pro

### Document Control

| Field | Value |
|---|---|
| **Product Name** | Job Tracker Pro |
| **Product Owner / Lead Developer** | Muhammad Dzaki Arrozaq |
| **Date** | September 2026 |
| **Status** | Draft / Ideation → Implemented (v1) |
| **UI Language** | Bahasa Indonesia |
| **Documentation Language** | English |

---

## 1. Executive Summary

The job hunting process today is rarely linear. A single job seeker may simultaneously apply to
private corporations, register for government recruitment programs, and compete for selective
academy programs — each with a completely different selection pipeline.

**Job Tracker Pro** is a web-based job application tracker that lets a user monitor recruitment
processes through an interactive **Kanban board**, customize the selection **pipeline** dynamically
per application track, and keep track of the exact **documents** (CV/Portfolio) used for each
application. The project also serves as a **flagship portfolio piece** to demonstrate full-stack
software engineering skills.

---

## 2. Goals & Success Metrics

### 2.1 User Goals
- Provide full visibility into application status across many institutions/companies.
- Provide document/asset management so users never send the wrong CV version again.

### 2.2 Business / Portfolio Goals
- Demonstrate mastery of a modern stack (Next.js, TypeScript, PostgreSQL, Drizzle ORM).
- Demonstrate understanding of complex relational database architecture and UI/UX optimization.

### 2.3 Success Metrics
- Lighthouse score > 90 for performance and accessibility.
- Kanban card movement has **no visual lag** (optimistic UI updates).
- Analytics dashboard reflects real conversion/interview-lead-time data derived from actual
  stage-history events (not static numbers).

---

## 3. Functional Requirements

### 3.1 Custom Pipeline Management (Core Feature)
Users can create or pick a pipeline template, because not every recruitment process has the same
flow. Shipped with 3 seeded system templates:

- **Corporate Track:** Applied → HR Interview → Technical Interview → Offering → Hired/Rejected.
- **Government Track (CPNS):** Pendaftaran Administrasi → Seleksi Kompetensi Dasar (SKD) →
  Seleksi Kompetensi Bidang (SKB) → Pemberkasan → Lulus.
- **Academy Track:** Profile Screening → Portfolio Review → Logic Test → Final Interview.

Users may also build fully **custom pipelines** with an arbitrary number of ordered stages, and tag
each stage as `normal`, `interview`, `offer`, `hired`, or `rejected` so the system can automatically
compute the application's outcome and analytics.

### 3.2 Interactive Kanban Board
- Visual board showing applications as cards grouped into stage-based columns.
- **Drag-and-drop** support (via `@dnd-kit`) to move a card between columns, updating the
  application's current stage with an optimistic UI update and a server action persisting the change.
- Clicking a card opens a **detail modal**: company name, position, job posting link, salary
  expectation, special notes, stage history, and the list of attached documents.
- A pipeline switcher lets the user view the board scoped to one pipeline/track at a time.

### 3.3 Document Versioning & Asset Tracking
- Users can save documents as links (PDF CV hosted elsewhere, portfolio deck URL, etc.) tagged by
  type (CV, Portfolio, Cover Letter, Certificate, Other).
- Users can attach/detach one or more documents to/from a specific application (many-to-many).
- Use case: ensure the user remembers that for Company A they used "CV Fullstack v2", while for an
  academy application they used "Deck Portofolio Digilab".

### 3.4 Analytics Dashboard
- Total active vs rejected vs offer vs hired applications.
- Average time (in days) from application date to reaching an interview-tagged stage.
- Conversion rate (percentage of applications that reached an interview stage or further).
- Visual breakdown by pipeline/track and a trend chart of applications submitted over time.

### 3.5 Applications List/Table View
- Sortable/filterable table of all applications (by pipeline, outcome, search by company/position).
- Full CRUD: create, edit, archive/delete applications.

### 3.6 Authentication
- Email/password registration & login (credentials provider), with the architecture ready to enable
  Google/GitHub OAuth as soon as OAuth credentials are configured in the environment.
- Session-based route protection for all application data (multi-tenant: each user only sees their
  own data).

---

## 4. Non-Functional Requirements

- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand (client state for the
  Kanban board), `@dnd-kit` for drag-and-drop, Recharts for data visualization.
- **Backend & Database:** PostgreSQL, Drizzle ORM, Next.js Server Actions for all mutations.
- **Authentication:** NextAuth.js (Auth.js v5) — Credentials provider always on; Google/GitHub
  providers auto-enabled when their environment variables are present.
- **Responsiveness:** Full desktop experience (Kanban drag-and-drop); mobile gets a fully readable,
  usable table/list-first experience with touch-friendly stage select instead of drag-and-drop.

---

## 5. Data Architecture (High-Level Model)

1. **users** — authentication & profile data.
2. **pipelines** — selection templates (CPNS, Corporate, Academy, custom, ...).
3. **pipeline_stages** — ordered stages inside a pipeline (order, type, interview flag, color).
4. **applications** — the core entity: position, company, salary expectation, pipeline reference,
   current stage, computed outcome.
5. **application_stage_history** — timestamped record of every stage an application entered, used to
   power analytics (time-to-interview, funnel).
6. **documents** — files/links (CV, portfolio, etc.).
7. **application_documents** — join table connecting many documents to many applications.

---

## 6. Release Roadmap

- **Phase 1 — MVP:** Authentication, CRUD companies/positions (table/list view), one standard
  pipeline (Applied, Interview, Rejected).
- **Phase 2 — Core Experience:** Kanban board with drag-and-drop, dynamic custom pipeline builder.
- **Phase 3 — Portfolio & Analytics:** Document versioning relations, statistics dashboard with
  charts.

> **Implementation status:** All three phases above are implemented in this codebase as v1.

---

## 7. Out of Scope (v1)

- Real file uploads/binary storage (documents are tracked as external links/URLs for now).
- Team/collaborative workspaces (multi-user shared boards).
- Email/browser notifications and reminders.
- Native mobile app (mobile is handled via responsive web only).
