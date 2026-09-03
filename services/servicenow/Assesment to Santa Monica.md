# Moveworks → ServiceNow Migration Readiness Assessment

**Sample Report — Fictionalized Composite Environment**

Prepared by: **Cali Live Play LLC** · Version 1.0 · August 2026

Client: **Northgate Financial Group** (fictional) · ~7,500 employees · Moveworks tenant live since 2023 · ServiceNow ITSM Pro, Washington DC-family release

> **About this sample.** The methodology in this document comes from real production engineering — Moveworks Agent Studio plugin development, both live-agent handoff builds (Deep-Link and Message Brokering) into Service Operations Workspace, knowledge ingestion pipelines, and contact-center voice integration — delivered for the City of Santa Monica by the practice lead. **[TG REVIEW: confirm with the City that naming them in marketing materials is cleared before publishing.]** It is applied here to a fictionalized composite environment: all company names, plugin names, metrics, instance references, and personnel are illustrative, because client environments — including this one — stay confidential. A real engagement runs on the timeline fixed in your Statement of Work and produces this document scoped to your environment.

*Confidential — prepared for the named client only. Do not redistribute.*

---

## 1. Executive Summary

Northgate operates 23 Moveworks Agent Studio plugins serving ~9,400 conversations per quarter across IT and HR. Following ServiceNow's acquisition of Moveworks (closed December 2025) and the consolidation of the conversational front door into the combined ServiceNow offering, Northgate's Moveworks renewal in **Q3 2027** is the natural forcing function: the migration should complete before that date to avoid a renewal negotiated without leverage.

**Verdict: for Northgate, the numbers favor migrating — three waves over approximately 20 weeks, retiring 7 of 23 plugins outright.** Both paths were priced; staying standalone is a legitimate outcome for estates with different renewal timing or license posture — the stay / migrate / negotiate analysis is in §8. The estate is healthier than it looks — roughly a third of the plugins carry near-zero traffic or are superseded by native Now Assist capability, so the real migration surface is 16 plugins, of which only 3 are genuinely complex.

**Top three risks identified:**

1. **Conversation-memory semantics change silently.** Moveworks' Semantic Working Memory (~7,000 tokens of active context) and 24-hour conversation-context window have no exact equivalent in the target stack. Multi-turn plugins that rely on the reasoner "remembering" earlier answers will behave differently after migration unless redesigned. This is a behavioral regression that functional testing misses and users notice.
2. **The live-agent handoff decision is a licensing decision.** Northgate's in-chat handoff (user stays in Teams while a service-desk agent responds from Service Operations Workspace) depends on the Virtual Agent API (`sn_va_as_service`), an ITSM Pro entitlement. Northgate holds ITSM Pro, so the recommended path is Message Brokering — but the fallback Deep-Link pattern should be built first regardless, because it is the rollback position if brokering fails during cutover (§6).
3. **Knowledge ingestion must be re-plumbed, not migrated.** The two `ms_graph` ingestion pipelines (SharePoint page catalog + document-library extraction) that feed answer quality today do not carry over. AI Search indexing of the same sources is a Wave 0 workstream; skipping it produces a bot that migrates its plugins but forgets its knowledge.

**Effort band: 610–840 hours** across foundation, plugin rebuilds, parity testing, and cutover (§10). **[TG REVIEW: confirm hour bands match your delivery rate before first client use]**

Recommended sequence: Wave 0 foundation (ingestion + handoff + test harness) → Wave 1 quick wins (6 Tier-1 plugins) → Wave 2 core estate (7 Tier-2) → Wave 3 complex rebuilds (3 Tier-3), decommission, hypercare.

---

## 2. Plugin Estate Inventory

Inventory sourced from Agent Studio export, the Logs app (90-day window, filtered by plugin Root UUID), and stakeholder interviews. Provenance uses Moveworks marketplace states: **Install** (packaged agent deployed as-is), **Build** (template + integration guide, completed in-house), **Custom** (built from scratch in Agent Studio).

| # | Plugin | Provenance | External systems | 90-day convos | Owner |
|---|--------|-----------|------------------|---------------|-------|
| 1 | PTO Accruals Lookup | Custom | UKG WFM Pro | 1,840 | HRIS |
| 2 | Shift Swap Request | Custom | UKG WFM Pro | 610 | HRIS |
| 3 | Payroll Calendar FAQ | Custom | — (knowledge) | 420 | HRIS |
| 4 | IT Ticket Status | Install | ServiceNow | 1,205 | IT SD |
| 5 | Create IT Ticket | Install | ServiceNow | 980 | IT SD |
| 6 | Password Reset | Install | Okta | 1,410 | IT Sec |
| 7 | Access Request | Build | SailPoint ISC | 640 | IT Sec |
| 8 | Software Provisioning | Custom | ServiceNow + Jira | 505 | IT SD |
| 9 | VPN Troubleshooter | Custom | — (knowledge) | 390 | IT SD |
| 10 | Distribution List Mgmt | Custom | MS Graph | 285 | IT SD |
| 11 | Laptop Refresh Eligibility | Custom | ServiceNow (CMDB) | 240 | IT AM |
| 12 | Benefits Enrollment FAQ | Custom | — (knowledge) | 460 | HR |
| 13 | Onboarding Buddy | Build | ServiceNow HR | 210 | HR |
| 14 | Guest Wi-Fi Access | Custom | — (form) | 180 | IT Net |
| 15 | Printer Support | Custom | — (knowledge) | 95 | IT SD |
| 16 | Org Chart Lookup | Custom | MS Graph | 310 | HR |
| 17 | Expense Report Status | Custom | SAP Concur | 155 | Finance |
| 18 | License Renewal Reminder | Custom | ServiceNow (SAM) | 88 | IT AM |
| 19 | Meeting Room AV Help | Custom | — (knowledge) | 41 | IT AV |
| 20 | Badge Access Request | Custom | Facilities app | 36 | Facilities |
| 21 | Outage Notification Optin | Custom | — (campaign) | 22 | IT SD |
| 22 | New Hire Campaign | Custom | — (campaign) | 12 | HR |
| 23 | Knowledge Search | Install | SharePoint (ms_graph) | 1,270 | IT SD |

Structural notes captured during inventory: publish-order dependency chains (HTTP Action → Compound Action → Conversational Process) were mapped per plugin and are preserved in the raw export (Appendix B); three plugins (#1, #2, #8) use APIthon custom scripts inside Compound Actions; five use custom Data Types with imported JSON schemas; two (#7, #8) use dynamic resolvers.

---

## 3. Complexity Triage

Each surviving plugin is scored 0–2 on nine dimensions drawn from Agent Studio's actual complexity drivers. Full scoring matrix in Appendix A; tier thresholds: **Tier 1** = 0–5, **Tier 2** = 6–11, **Tier 3** = 12+.

**Scoring dimensions:**

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| DSL surface | None / simple render | String & time functions | Strict-typed collections (`$FILTER`, `MAP`, `SORT`, `COALESCE`) |
| APIthon usage | None | Single helper script | Multi-step orchestration logic |
| Resolver type | None | Static (declared in Input Mapping) | Dynamic (context-driven, multi-app) |
| Custom Data Types | None | One imported schema | Multiple schemas / cross-referenced |
| HTTP connector fan-out | Zero or one system | One system, multiple actions | Multiple external systems |
| Auth model | None / platform-native | Standard OAuth client-credentials | Non-standard grant (e.g., ROPC) or token choreography |
| Launch-rule scoping | All users | Department / group DSL rule | Conditional multi-rule audience |
| Content activities | Plain text | Knowledge / links | Forms with slot validation policies |
| Multi-turn dependence | Single-shot | Occasional follow-ups | Relies on working-memory across turns |

**Tier distribution of the 16 surviving plugins:**

| Tier | Count | Plugins | Character |
|---|---|---|---|
| Tier 1 | 6 | #3, #9, #12, #14, #16, #23→AI Search | Knowledge/FAQ or single-lookup; near-mechanical rebuild |
| Tier 2 | 7 | #4, #5, #6, #10, #11, #13, #17 | Single-system transactions, standard auth, forms |
| Tier 3 | 3 | #1+#2 (consolidated), #7, #8 | Multi-system, APIthon, dynamic resolvers, non-standard auth |

**Worked example — Tier 3, "PTO Accruals Lookup" (#1):** scores 2 on DSL surface (`$FILTER` over accrual collections with the strict-typing constraint — a single-element array is still a List, and the working reference pattern is `data.accrual_category.value`, not the object shorthand), 2 on auth (Auth0 `password-realm` ROPC grant against the UKG tenant), 1 on APIthon, 1 on Data Types, 1 on multi-turn. Total 13 → Tier 3. The rebuild is not a transliteration: the DSL collection logic moves to Flow/transform logic, and the ROPC token flow needs a scripted OAuth profile on the ServiceNow side (§7).

---

## 4. Kill List & Consolidation

Seven plugins should not be migrated. Retiring them cuts ~30% of nominal migration scope at zero user impact:

| Plugin | Disposition | Rationale |
|---|---|---|
| #15 Printer Support | Retire → KB article | 95 convos/quarter, all deflectable to a single KB page surfaced by AI Search |
| #18 License Renewal Reminder | Retire → native | Superseded by scheduled Flow + Now Assist proactive notification |
| #19 Meeting Room AV Help | Retire → KB | 41 convos/quarter |
| #20 Badge Access Request | Retire → catalog item | Volume doesn't justify conversational surface; standard catalog request suffices |
| #21 Outage Notification Opt-in | Retire → native | Subscription handled by platform notification preferences |
| #22 New Hire Campaign | Retire → native | Campaign functionality replaced by HR journeys on-platform |
| #23 Knowledge Search | Retire → AI Search | Not rebuilt as a plugin at all — this is the ingestion re-plumb (§5, Wave 0) |

**Consolidation:** #1 PTO Accruals + #2 Shift Swap share the UKG connector, auth flow, and audience. Rebuild as **one** UKG Workforce agent with two intents — one credential alias, one token-management implementation, one test suite instead of two.

Net migration estate: **16 plugins → 15 build units** (after consolidation), of which 3 are Tier 3.

---

## 5. Parity Map

Per-tier target mapping and the gaps that will not announce themselves:

| Source construct | Target construct | Parity gap |
|---|---|---|
| Plugin (NL trigger + description) | AI Agent (instructions + discovery) | Trigger behavior differs: Moveworks' Reasoning Engine selects plugins on description keywords; target-side discovery/instruction tuning is a distinct skill. Descriptions do not port verbatim — each needs rewrite and trigger regression testing (§9). |
| Conversational Process (activities → slots → decision policies) | Agent instructions + Flow logic | Decision-policy DSL (if/then switches) maps to flow branching; slot validation policies + validation descriptions must be re-expressed and re-tested per slot. |
| Compound Action + APIthon | Flow / subflow + script steps | APIthon (Python subset) does not port; logic rewrites into Flow logic or script includes. DSL/mapper operations that outperformed APIthon in Moveworks have different perf characteristics on-platform. |
| HTTP Action / HTTP Connector | IntegrationHub REST step + Connection & Credential alias | Mechanical for standard OAuth; non-standard grants need custom profiles (§7). |
| Semantic Working Memory (~7k tokens) + 24h conversation context | Target session/context model | **No exact equivalent.** Plugins scored 2 on multi-turn dependence (#1, #7, #8) must be redesigned to carry state explicitly (slots → flow variables / stored context) rather than relying on reasoner memory. Data Bank per-execution scratch space maps cleanly to flow-scoped variables and is not a risk. |
| Launch Rules (audience DSL) | User criteria | Rule-by-rule translation; the DSL boolean form (e.g., `IF (user.email_addr == …) THEN 1.0 ELSE 0.0`) becomes user-criteria records. Audit each — launch rules are also the rollback mechanism during cutover (§9). |
| ms_graph ingestion pipelines (site catalog + file extraction) | AI Search connectors + index | Re-index from source, not transfer. Answer-quality regression testing against a golden question set is mandatory before Wave 1 cutover, because knowledge answers are the highest-traffic surface (#23: 1,270 convos/quarter). |

---

## 6. Live-Agent Handoff Architecture

The highest-stakes design decision in the migration, and the one with a hard licensing dependency. Northgate's requirement: a user mid-conversation with the assistant in Microsoft Teams escalates to a human, and a service-desk agent works the chat from Service Operations Workspace (SOW), routed through Advanced Work Assignment (AWA).

Both viable patterns were built and proven in a lab environment during this assessment's methodology development. The decision matrix:

| Criterion | Path A — Deep-Link | Path B — Message Brokering |
|---|---|---|
| Licensing prerequisite | AWA + Virtual Agent chat (`com.glide.awa`, `com.glide.cs.chatbot`) — no additional SKU | Virtual Agent API (`sn_va_as_service`) — **ITSM Pro entitlement** **[TG REVIEW: verify current SKU packaging at engagement time]** |
| User surface | Bot hands the user a URL (`/$sn-va-web-client-app.do?sysparm_live_agent_only=true`); chat continues in browser | User never leaves Teams; Moveworks brokers messages both directions |
| Context payload | Query parameters + interaction record; bot transcript attached via API, not native | Richer context passing (Context Bender configuration); conversation continuity in-thread |
| Transcript continuity | Break at handoff (two artifacts to stitch) | Continuous thread visible to agent |
| Failure behavior | Degrades gracefully — URL either opens or doesn't; AWA queue behavior fully deterministic | More moving parts: token chain, message auth, outbound connection; relay failures are mid-conversation and harder to diagnose |
| Build effort | Low — AWA chain + one deflection URL + display labels | Moderate — brokering config, token/auth choreography, per-channel testing |
| Operational complexity | Low | Moderate; requires runbook for relay-failure triage |
| Best fit | Fallback / rollback position; orgs without Pro | Primary path where Pro is held and in-Teams UX is a requirement |

**Recommendation for Northgate:** ITSM Pro is held → **build Path B (Message Brokering) as primary, but build Path A first.** Deep-Link is a one-day build once the AWA chain exists, it validates the entire routing spine independently of brokering, and it is the designated rollback if brokering misbehaves during cutover.

**The AWA chain both paths share** (this is where handoffs actually fail, and it must be built and verified in order): Chat service channel (OOB) → dedicated queue with **`max_wait_time` explicitly set** — a queue created with `00:00:00` silently rejects work items and presents as "handoff does nothing"; set a real value (e.g., `00:05:00`) → assignment rule scoped to the Chat channel → assignment eligibility bound to the agent group → agents holding `awa_agent` + `interaction_agent` roles with SOW access → at least one agent Available (the bot's escalation affordance is gated on live presence).

**Coexistence note:** this architecture governs the **migration window**, while Moveworks remains the front door and agents work in SOW. Post-migration, when the ServiceNow-native assistant is the front door, escalation becomes a native Virtual Agent → live agent transfer and the brokering machinery retires. Budget it as interim infrastructure with a decommission date, not permanent estate.

**Adjacent channel (out of scope, flagged):** Northgate's contact center voice channel can also terminate in SOW via CTI/OpenFrame integration, unifying chat and voice on the same AWA backbone. Separate workstream; assessed on request.

---

## 7. Integration & Auth Remap

Every external system the plugin estate touches, with its credential disposition. Secrets currently live in Moveworks' connector configuration; all of them move to the ServiceNow credential store under Connection & Credential aliases, and the cutover plan must include credential rotation (treat migration as an exposure event and rotate on principle).

| System | Current auth (Moveworks connector) | Target implementation | Complexity |
|---|---|---|---|
| UKG WFM Pro | Auth0 **`password-realm` (ROPC)** grant against UKG tenant | No out-of-box fit: scripted OAuth token acquisition (script include or IH custom step) + credential alias; token caching/refresh semantics differ from Moveworks' connector and must be load-tested | **High** |
| Okta | OAuth 2.0 client credentials | IntegrationHub spoke / REST step + alias | Low |
| SailPoint ISC | OAuth 2.0 client credentials | REST step + alias; access-request payload mapping re-validated | Medium |
| ServiceNow (self) | Moveworks service account | Native — plugin logic becomes on-platform logic; service account retires | Low |
| Jira Cloud | OAuth 2.0 | Spoke / REST step + alias | Low |
| MS Graph (Dist. lists, org chart) | App registration, application permissions | REST step + alias; permission scopes re-consented under new app registration | Medium |
| MS Graph (ingestion pipelines) | ms_graph connector (site catalog + file extraction) | **Not remapped — replaced** by AI Search connectors (§5, Wave 0) | Medium |
| SAP Concur | OAuth 2.0 | REST step + alias | Low |

**Worked example — UKG token flow (the Tier-3 driver in plugin #1/#2):** the ROPC grant means the integration authenticates *as a user identity*, not a client. On the Moveworks side this was one connector setting; on-platform it becomes a deliberate design: where the credential lives, how the token is cached, what happens on realm-endpoint failure, and how the `$FILTER`-based accrual-category selection re-expresses as transform logic against the same response schema (reference pattern `data.accrual_category.value` — the strict-typing lesson: the collection is a List even at length one, and the target-side transform must respect the same shape). This single integration is why the consolidated UKG agent carries a 40–70h estimate rather than 16–28h.

---

## 8. Licensing Delta

Structural view — rows are capabilities Northgate uses today; columns are what entitles them after migration. **[TG REVIEW: SKU names and packaging shift frequently — re-verify each row against current ServiceNow packaging at every engagement. Structure is stable; labels are not.]** This report identifies entitlement gaps only; it does not quote license pricing — dollar figures for ServiceNow entitlements come from the client's ServiceNow account team.

| Capability in use today | Moveworks entitlement | Target entitlement | Northgate status |
|---|---|---|---|
| Conversational assistant in Teams | Moveworks subscription | Now Assist / ServiceNow-native front door SKU | Entitled path exists; confirm seat model |
| Custom agents / plugins | Agent Studio (included) | AI Agent capability on-platform; partner/AI features may consume **Assists** (consumption unit) | Confirm Assist pool sizing vs. 9,400 convos/quarter |
| Live-agent brokering in Teams | Moveworks live-agent skill | Virtual Agent API (`sn_va_as_service`) — ITSM Pro | **Held** |
| AWA routing to SOW | n/a (ServiceNow-side) | ITSM Pro (held) | Held |
| Knowledge answers from SharePoint | ms_graph ingestion (included) | AI Search + connectors | Confirm connector entitlement |
| Proactive notifications / campaigns | Moveworks campaigns | Platform notifications / HR journeys | Covered by retirements (§4) |

**Commercial timing finding:** the Moveworks renewal (Q3 2027) should be treated as the migration deadline, not a checkpoint. Completing cutover one quarter before renewal converts the renewal conversation from "we have no alternative" to "we need a short bridge, if anything." The consumption-based components (Assists) are the line item to model carefully — plugin-heavy traffic that was flat-rate under Moveworks may become metered.

**The fork — stay / migrate / negotiate.** Three commercially legitimate outcomes, priced side by side:

*Stay.* ServiceNow states Moveworks continues as a standalone product; contracts are honored and Agent Studio keeps shipping. The costs of staying are trajectory costs: the roadmap, support (Now Support), and pricing now run through ServiceNow, standalone pricing faces bundle pressure at each renewal, and non-ServiceNow integrations receive quieter investment. Staying is not standing still — new plugin development continues in Agent Studio, and this practice builds those plugins with clients who stay.

*Migrate.* The cost is §10's roadmap plus the licensing delta above; the payoff is arriving at the renewal needing nothing, with the conversational front door on the platform receiving the innovation investment.

*Negotiate.* This report's numbers are renewal leverage either way: a priced, credible migration plan converts "we have no alternative" into a negotiating position, whether the outcome is a better standalone price, a bundle, or a short bridge to cutover.

---

## 9. Testing & Cutover

**Contract-parity harness (the core QA asset).** Every Moveworks HTTP Action's request/response contract is captured as a version-controlled collection (Bruno) and executed in CI (GitHub Actions) against **both** sides: the legacy Moveworks action and the rebuilt IntegrationHub/REST implementation. A plugin is migration-eligible only when its contract suite passes green on the target side. This converts "does the rebuild work?" from opinion to a pipeline gate — and the same suites become permanent regression coverage after Moveworks retires.

**Behavioral parity — golden conversations.** Contract tests prove the API layer; they do not prove the conversation. Each surviving plugin gets a golden-transcript set (5–15 canonical conversations, including the multi-turn cases flagged in §5) replayed against the target agent, with special attention to trigger fidelity: the #1 post-migration complaint pattern is "the bot stopped understanding X," which is a discovery/instruction tuning issue, not an integration failure. Trigger regression is tested with a paraphrase battery per plugin.

**Platform config testing:** ATF suites for the on-platform artifacts (flows, catalog interactions, user criteria, AWA chain), so instance upgrades post-migration don't silently break the estate.

**Pilot & rollback mechanics.** Cutover per wave, not big-bang. For each wave: (1) target agents enabled for a pilot cohort via user criteria mirroring the old launch-rule audience; (2) the legacy Moveworks plugin's launch rule simultaneously **narrowed** to the inverse audience — launch rules are the rollback lever: widening one rule restores the old path in minutes with no deployment; (3) one-week soak per wave watching deflection rate, handoff rate, trigger-miss reports, CSAT; (4) legacy plugin disabled, not deleted, until Wave 3 decommission.

**Hypercare:** two weeks post-Wave 3 with daily triage of trigger-miss and handoff-failure logs, then formal decommission of the Moveworks tenant ahead of renewal.

---

## 10. Sequenced Roadmap & Effort Estimates

| Wave | Weeks | Scope | Hours |
|---|---|---|---|
| **Wave 0 — Foundation** | 1–3 | Entitlement confirmation; AI Search ingestion re-index + golden-question validation; AWA chain build; Deep-Link path live; Message Brokering build + failure-mode runbook; contract-harness scaffold in CI | 100–140 |
| **Wave 1 — Quick wins** | 4–7 | 6 Tier-1 plugins (6–10h each) + golden transcripts + pilot/soak | 60–90 |
| **Wave 2 — Core estate** | 8–14 | 7 Tier-2 plugins (16–28h each) incl. credential remaps + pilot/soak | 130–200 |
| **Wave 3 — Complex** | 15–20 | 3 Tier-3 units (40–70h each) incl. consolidated UKG agent, multi-turn redesigns; decommission; hypercare | 150–230 |
| **Cross-cutting** | 1–20 | Parity testing operation, cutover management, stakeholder comms, PM (~15%) | 170–180 |
| **Total** | ~20 weeks | | **610–840** |

Dependencies that order the waves: ingestion re-index precedes everything user-facing (knowledge is the highest-traffic surface); the handoff build precedes Wave 1 (every migrated plugin needs a working escalation path from day one); the UKG consolidation lands last because it carries the highest redesign content and benefits from patterns proven in Waves 1–2.

---

## Appendix A — Triage Rubric (full definitions)

The nine dimensions in §3 with scoring anchors, applied per plugin in the raw matrix (delivered as a spreadsheet alongside this report). Dimension design note: the rubric scores *rebuild* complexity, not runtime complexity — a high-traffic simple plugin stays Tier 1; a low-traffic plugin with ROPC auth and APIthon is Tier 3 regardless of volume. Traffic drives the kill list; structure drives the tier.

## Appendix B — Raw Inventory Export

Delivered as: Agent Studio export (plugins, conversational processes, compound actions, HTTP actions with publish-order dependency mapping), Logs-app traffic extract (90-day, per Root UUID), connector/credential register. **[TG REVIEW: define your export tooling/checklist before first engagement — this is the Day-1 data request list.]**

## Appendix C — Glossary

**AWA** Advanced Work Assignment — ServiceNow's routing engine (service channel → queue → assignment rule → eligibility → agent). **APIthon** Moveworks' Python-subset scripting inside Compound Actions. **Assists** ServiceNow's consumption unit for generative/agentic AI features. **Context Bender** Moveworks configuration governing what context passes to the live-agent system at handoff. **Deep-Link handoff** Escalation pattern where the bot hands the user a URL opening ServiceNow's own chat client, routed via AWA. **ITSM Pro** ServiceNow package tier gating (among others) the Virtual Agent API. **Launch Rule** Moveworks audience-scoping rule on a plugin; the rollback lever during cutover. **Message Brokering** Escalation pattern where Moveworks relays messages between the user's chat surface and the ServiceNow agent. **ROPC / password-realm** OAuth Resource Owner Password Credentials grant — authenticates as a user identity; used by the UKG integration. **Semantic Working Memory** Moveworks' ~7k-token active conversation context passed to the reasoner. **SOW** Service Operations Workspace — the agent-facing workspace where escalated chats are worked.

---

*Sample report ends. A scoped engagement delivers this document against your environment — on the timeline fixed in your Statement of Work, with the findings presented live to your CEO/CIO. Fee computed by estate size at eberteogam.github.io/migrate. Book the readiness call: [[BOOKING_URL]] · [[EMAIL]] · © 2026 Cali Live Play LLC*
