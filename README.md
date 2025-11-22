# ServiceNow Incident Summariser (AI-Powered)
### Automate incident triage & handover with OpenAI GPT models

This repository contains a complete ServiceNow implementation of an **Incident Summariser**, powered by OpenAI's Chat Completion API.  
It extracts key information from an Incident record (short description, description, comments, work notes, CI, priority, state, timeline) and generates a clean, structured summary for handover, escalations, or major incident bridges.

---

## 🚀 Features

- One-click **"Generate Summary"** UI Action on Incident form  
- Clean **human-readable summary**, formatted with newlines  
- Works without requiring ServiceNow Now Assist licensing  
- Resilient to malformed HTML (uses plain text output)  
- Scope-safe: all components run in **Global**  
- Summary displayed in a dedicated **UI Page modal**

---

## 🧩 Architecture Components

| Component | Type | Purpose |
|----------|------|---------|
| `IncidentSummarizerUtils` | Script Include | Fetch data, build prompt, call OpenAI API |
| `IncidentSummarizerAjax` | Client-callable Script Include | Simple GlideAjax wrapper |
| `Generate Incident Summary` | UI Action | Button shown on Incident form |
| `incident_summary_viewer` | UI Page | Renders formatted summary |
| OpenAI REST Message | Integration | ChatCompletion API call |

---

## 📂 Source Code

See `src/` folder for full implementation.

---

## 🧠 Prompt Design

The model prompt ensures consistent structure:

