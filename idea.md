# Safe Travel ID — SIH 2025 Pitch Deck

---

## Slide 2 — IDEA TITLE  
**Proposed Solution (Describe your Idea/Solution/Prototype)**  

### Detailed explanation of the proposed solution  
- **Safe Travel ID**: a unified tourist safety platform with blockchain-secured Digital ID, real-time monitoring, and rapid SOS routed to authorities.  

### How it addresses the problem  
- Fast, reliable help (**SOS + case handling**)  
- Proactive risk prevention (**Personalized Safety Index**)  
- Language bridge (**Cross-Language Translation**)  
- Trusted trip sharing (**Companion Mode**)  

### Innovation and uniqueness of the solution  
- On-chain attestations for **trust** (Hyperledger Fabric)  
- **Realtime backend** (Convex)  
- **Pluggable translation / IoT hooks**  
- **Geo-fenced safe hubs with panic routing**  
- **Contextual scam alerts**  

✅ Covers: Safety Index, Translation, Companion Mode, Panic Routing, Scam Alerts, IoT extensibility  

---

## Slide 3 — TECHNICAL APPROACH  

### Technologies to be used  
- **Frontend**: React + Vite + TypeScript, Tailwind + Shadcn UI, Framer Motion  
- **Backend/DB**: Convex (real-time queries/mutations/actions, storage, cron), indexed queries (`withIndex`)  
- **Auth**: Convex Auth (phone OTP via Twilio SMS, E.164 validation, throttling)  
- **Chain**: Hyperledger Fabric (on-chain profile + wallet verification)  
- **Maps**: Google Maps embeds (default) / AlphaEarth AI map model (optional)  
- **Weather**: Open-Meteo  

### Methodology & process (flows)  
- **Core data model**:  
  - users, touristProfiles, itineraries, alerts, eFirs, cases, messages, notifications, advisories, deviceSignals, safetyScores, locationHistory, auditLogs, phoneOtps  
- **New tables**:  
  - `shareLinks` (Companion Mode)  
  - `safetyReports` (Anonymous Reporting)  
  - `safeHubs` (Safe Zones & Routing)  

**Key Flows**:  
1. OTP login → create/attach Digital ID → optional wallet link  
2. Itinerary + geofences → GPS/IoT monitoring → **Safety Index computation**  
3. SOS (tap/voice/offline queue) → alert → case auto-created → cross-language translation  
4. **Companion Mode** → expiring tokenized link (revocable, auto-expires)  
5. **Anonymous Reporting** → heatmaps + scam alerts  
6. **Safe-zone routing** during SOS → nearest verified hub  
7. **Post-incident NPS feedback** → analytics dashboard trends  

### Security-by-design  
- Role-based authorization (tourist, police, officials, admin)  
- OTP throttling + E.164 validation  
- PII in Convex; hashes/attestations on-chain  
- Tokenized, time-limited share links (coarse location for companions)  
- Audit logs for sensitive ops  

✅ Covers: Voice SOS, Companion Mode, Anon Reporting, Panic Routing, NPS feedback, IoT hook as future  

---

## Slide 4 — FEASIBILITY AND VIABILITY  

### Feasibility  
- **Already implemented**: Phone OTP login, Digital ID, SOS with location, advisories, weather, case board, CSV export  
- **New features** align with schema-first, serverless Convex; incremental rollout  

### Challenges & risks  
- OTP delivery variance  
- GPS permissions/accuracy  
- Translation reliability  
- Spam in anonymous reports  
- Model calibration (Safety Index)  

### Mitigations  
- Resend throttling + fallback channel  
- HTTPS + manual share + accuracy flags  
- Pluggable translation with fallback  
- IP-hash/device throttling + moderation  
- Transparent weights + continuous tuning  

✅ Covers: risks & mitigations across OTP, GPS, spam, translation, AI scoring  

---

## Slide 5 — IMPACT AND BENEFITS  

### Potential Impact  
- **Tourists**: Safety Index, hands-free SOS, safe-zone routing, translation, scam alerts, reassurance (Companion Mode)  
- **Officials**: Faster triage with context, crowdsourced intel, measurable NPS  
- **Destinations**: Safer reputation, policy informed by hotspot/scam analytics  

### Benefits  
- **Social**: Reduced harm, faster response  
- **Economic**: Increased tourist confidence, lower operational costs  
- **Operational**: Coordinated workflows, exportable analytics, extensible **IoT hook for wearables**  

✅ Covers: Social, Economic, Operational impacts  

---

## Slide 6 — RESEARCH AND REFERENCES  

- **Convex (Realtime DB & functions)**: [docs](https://docs.convex.dev)  
- **Convex Auth + Anonymous Provider**: [docs](https://docs.convex.dev/auth)  
- **Twilio Messaging & E.164**: [SMS](https://www.twilio.com/docs/sms) | [E.164](https://www.twilio.com/docs/glossary/what-e164)  
- **Hyperledger Fabric**: [docs](https://hyperledger-fabric.readthedocs.io)  
- **Web Speech API (voice SOS)**: [MDN](https://developer.mozilla.org/docs/Web/API/Web_Speech_API)  
- **Geolocation API**: [MDN](https://developer.mozilla.org/docs/Web/API/Geolocation_API)  
- **Google Maps Embed**: [docs](https://developers.google.com/maps/documentation/embed)  
- **AlphaEarth AI map model (optional)**: integrate if public SDK available  
- **Open-Meteo API**: [docs](https://open-meteo.com)  
- **OWASP MASVS (mobile security)**: [mas.owasp.org](https://mas.owasp.org)  

✅ Covers: all research areas (identity, OTP, blockchain, geolocation, speech/voice, security)  

---

## ✅ Cross-check: Does this tick all features?  
- Safety Index ✔  
- Voice SOS + Offline Queue ✔  
- Trusted Companion Mode ✔  
- Cross-Language Translation ✔  
- Anonymous Safety Reporting ✔  
- Geo-fenced Safe Zones & Panic Routing ✔  
- Fraud/Scam Prevention Alerts ✔  
- IoT Hook (wearables) ✔ (future-ready)  
- Post-Incident NPS Feedback ✔
- E-Fir Automation ( forgot about it )

👉 Yes — every unique feature we brainstormed is in. 🎯
