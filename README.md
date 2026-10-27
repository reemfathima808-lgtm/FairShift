# FairShift · Decent Work Platform for UN SDG 8

> **FairShift makes shift work fairer, safer, and transparent for employee-intensive organisations that still run on paper registers, spreadsheets, and WhatsApp groups.**

---

## 📌 Problem

In employee-heavy industries—such as construction sites, university campuses, hospital support wards, and manufacturing plants—frontline workers frequently encounter:
- **Opaque pay & uncounted overtime:** Hours recorded on paper cards or registers get rounded down; overtime multiplier rules (1.5x / 2.0x) are rarely applied accurately.
- **Fear of raising complaints:** Workers worry that reporting safety hazards or supervisory unfairness will lead to retaliation, lost shifts, or termination.
- **Invisible fatigue & injury risk:** Back-to-back shifts and excessive weekly hours (&gt;48 hours) go unnoticed until an accident occurs.
- **No portable skill credentials:** When moving between contractors or job sites, skilled tradespeople have no tamper-proof record of their verified qualifications and experience.
- **Language and literacy barriers:** Many workers use low-end smartphones, have limited literacy, and speak regional languages (Hindi, Tamil, Telugu), rendering complex corporate portals inaccessible.

Employers simultaneously lack visibility into exhausted teams, fail to spot early attrition signals, and only learn of workplace grievances when catastrophic issues strike.

---

## 🎯 UN Sustainable Development Goal 8 Mapping

FairShift is directly aligned with official **UN SDG 8 (Decent Work and Economic Growth)** indicators:

| UN SDG 8 Target | Target Description | How FairShift Solves It |
| :--- | :--- | :--- |
| **Target 8.5** | Full and productive employment and decent work for all women and men, including equal pay for work of equal value. | Guaranteed itemized payslips with 1.5x overtime counting, transparent deductions, and "Explain My Pay" voice read-aloud in regional languages. |
| **Target 8.8** | Protect labour rights and promote safe and secure working environments for all workers, including precarious employment. | Voice-driven hazard reporting with photos, live status tracking (Reported → Under Review → Resolved), and proactive fatigue limit alerts. |
| **Target 8.2 & 8.6** | Diversification, technological upgrading, and youth vocational skills. | Tamper-evident, verified **Skill Passport** shareable via QR code so workers carry verifiable trade proof across employers. |

---

## 📱 TWO Separate Interfaces

### 1. Worker App (Mobile-First)
- **Ergonomic, large touch targets (≥48px)** and clean icon-first navigation.
- **Browser Web Speech API** voice dictation for reporting issues in mother tongues.
- **Text-to-Speech (TTS) read-aloud** button on key screens to bridge literacy barriers.
- **5 Core Hubs:**
  1. *My Shifts:* Clock in/out via Gate QR or GPS geofence with automatic overtime timer.
  2. *My Payslip:* Visual pay breakdown + multilingual voice explanation.
  3. *Report Safety:* Voice or text hazard description + camera photo + status tracking.
  4. *Anonymous Review:* 100% confidential ratings of supervisors and conditions.
  5. *Skill Passport:* Digital credential with trade level, verified certificates, and QR export.

### 2. Employer / Admin Dashboard (Desktop-Friendly & Data-Rich)
- **Attendance & Overtime Trends:** Interactive pure SVG chart showing standard vs. overtime load.
- **Fatigue Action Center:** Flags workers logging &gt;48h weekly or turnaround rest &lt;11h with one-click roster adjustments.
- **Workplace Safety Action Center:** Review tickets, update status (Reported / Under Review / Resolved), and record physical engineering mitigations.
- **Transparent Attrition-Risk Engine:** Departmental score (0–100) with rule-based reasons shown openly (no black-box AI scores).
- **Aggregated Worker Sentiment:** Anonymized morale ratings without individual tracing.

---

## 🏭 Cross-Industry Use Cases

FairShift dynamically adapts terminology, shift schedules, and safety categories for 4 sectors:

1. **Construction Site (Metro Rail & Highrise):**
   - *Terminology:* Pier / Foundation Level · Foreman & Site Engineer · Site Shift
   - *Hazards:* Fall Risk & Scaffolding · Exposed High-Voltage Cable · Excavation Cave-in
2. **College / School Campus (Greenfield Engineering Campus):**
   - *Terminology:* Campus Wing / Hostel Block · Facilities Director · Campus Duty
   - *Hazards:* Chemical & Lab Fumes · Wet Floor / Staircase · Hostel Wiring & Fire Safety
3. **Hospital & Healthcare (Apex Care General Hospital):**
   - *Terminology:* Hospital Ward / ICU Unit · Nursing Superintendent · Duty Roster
   - *Hazards:* Needlestick & Biohazard Spill · Patient Transfer Strain · Overcrowded ER
4. **Factory & Manufacturing Plant (Precision Auto Components):**
   - *Terminology:* Plant Bay / CNC Workstation · Shop Floor Manager · Plant Shift
   - *Hazards:* Machine Guard Missing · Noise & Vibration · Forklift Crossings

---

## 📸 Interface Preview

```
+-----------------------------------------------------------------------------------+
|  [8] FairShift  |  Worker App  |  Employer Dashboard  |  How It Works  |  [Lang]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ WORKER MOBILE VIEW ]                      [ EMPLOYER DASHBOARD VIEW ]          |
|  +-------------------------------+           +---------------------------------+  |
|  | Ramesh Kumar (Scaffolder)     |           | KPI: 4 Active | 61h OT | 3 Flag |  |
|  | STATUS: ON DUTY (09:14:02)    |           |---------------------------------|  |
|  | [ OVERTIME ACTIVE - 1.5x ]    |           | Attendance & Overtime SVG Chart |  |
|  | [ Check Out Now (Square) ]    |           | [||||||||] [||||] [||||||||||]  |  |
|  |-------------------------------|           |---------------------------------|  |
|  | Net Pay: ₹27,725              |           | Fatigue Alert: 54h in 7 days    |  |
|  | [ (Speaker) Explain My Pay ]  |           | [ Enforce Rest Slot ]           |  |
|  |-------------------------------|           |---------------------------------|  |
|  | [Shifts] [Pay] [Safe] [Pass]  |           | Attrition-Risk: Scaffolding 72% |  |
|  +-------------------------------+           +---------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🌐 Voice & Regional Language Support

- **English** (`en`)
- **हिन्दी (Hindi)** (`hi`)
- **தமிழ் (Tamil)** (`ta`)
- **తెలుగు (Telugu)** (`te`)

Implemented via the browser Web Speech API (`SpeechSynthesis` & `SpeechRecognition`), with instant text read-aloud and speech dictation. Includes graceful fallback for environments without microphone access.

---

## 🔒 Security & Privacy

- **Zero Secret Exposure:** No hardcoded tokens or API credentials.
- **Cryptographic Anonymity:** Feedback submissions strictly scrub worker IDs, names, IP addresses, and device fingerprints. Timestamps are coarsened to calendar dates to prevent correlation attacks.
- **Zero Mock Telemetry:** No fake compiler tickers, no simulated latency tickers, and no hallucinated AI scoreboards.

---

## 🛠 Local Setup & Running

```bash
# 1. Clone repository
git clone <repo-url>
cd fairshift

# 2. Install dependencies
npm install

# 3. Start local development server (port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

---

## 🧪 Testing

FairShift includes an automated unit test suite with Vitest verifying core math and privacy algorithms:
- Shift hours & overtime calculations (8h standard threshold, 1.5x multiplier)
- Payslip gross pay, statutory deductions, and multilingual explanations
- Fatigue detection engine (&gt;48h weekly hours, consecutive work days, turnaround &lt;11h)
- Attrition risk rule scoring and root cause explanations
- Frontline feedback anonymisation & data sanitisation

```bash
# Run unit tests
npm test
```

---

## 🐳 Google Cloud Run Deployment

FairShift includes a multi-stage `Dockerfile` configured to compile the Vite application and serve it on `$PORT` (default 8080) for Google Cloud Run:

```bash
# 1. Build Docker image
docker build -t fairshift .

# 2. Run locally to test container
docker run -p 8080:8080 -e PORT=8080 fairshift

# 3. Deploy to Google Cloud Run
gcloud run deploy fairshift \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## 📜 License

Licensed under the Apache-2.0 License.
