# Video Script — Customer Support Ticket Triage & Routing Agent

**Length:** 5–8 minutes · **Style:** screen recording + voiceover · first-person, speak naturally.
**Before you record:** open n8n with the workflow loaded, have the form URL ready in a second tab, and have `sample_input.json` open to copy the message from. Speak slightly slower than feels natural.

> `[ON SCREEN: ...]` = what to show. **SAY:** = read this out loud, word for word.

---

## 0:00–0:45 — The problem and the user

`[ON SCREEN: your face cam or the n8n canvas zoomed out so the whole workflow is visible]`

**SAY:**
"Hi, I'm [your name]. In this video I'll walk through an agentic workflow I built in n8n.
It's a Customer Support Ticket Triage and Routing Agent.
Here's the problem. Imagine a small company with one shared support inbox.
Tickets come in as messy, free-form text, and they just pile up.
A human has to read each one, figure out the category, judge how urgent or angry the customer is, decide which team should handle it, and write a reply.
That's slow, it's inconsistent, and the angry, high-value customers wait in the same line as the simple questions.
My users are the support team, and the customers who are waiting for a reply.
This workflow automates the boring mechanical part, while keeping a human in control of the risky decisions."

---

## 0:45–1:30 — Problem-to-workflow breakdown

`[ON SCREEN: slowly pan across the workflow left to right]`

**SAY:**
"Instead of treating this as one big AI prompt, I broke the job into clear steps.
First, take in the ticket from a form.
Then use AI to understand it — classify it, and extract the key details.
Then switch to deterministic code to score how urgent it is and route it to the right team.
Then a rule decides if a human needs to approve it.
Then AI writes a personalised reply.
And finally, we send the email and log the ticket to a sheet.
So it's: AI for understanding and writing, and plain code for every control decision.
That separation is the core idea of the whole design."

---

## 1:30–3:30 — Walk through the nodes and connections

`[ON SCREEN: click each node as you name it so its panel opens, then close it]`

**SAY:**
"Let me walk through the nodes.

This first one is the **Support Ticket Form**. It's the trigger.
`[click it]` It collects the customer's name, email, the ticket message, and an optional product area.

Next is **Validate Input**. `[click it]`
This is my first piece of error handling. It's a simple rule: if the message is empty, we send it down a safe fallback path instead of crashing. Otherwise we continue.

Now the first AI step — **Classifier**. `[click it]`
Its only job is to read the message and return strict JSON: a category — Billing, Technical, Account, or General — and a sentiment.
`[point to the Output Parser sub-node]` This little node attached underneath forces that JSON structure, so I always get clean, predictable fields.

Then the second AI step — **Extractor**. `[click it]`
It pulls out a short summary, a few keywords, and what the customer actually wants. Again, forced into JSON.

Now the important deterministic node — **Priority Scorer**. `[click it, scroll the code]`
This is plain JavaScript, no AI. It takes the category, the sentiment, and scans the message for urgency words like 'refund', 'urgent', 'down', and 'ASAP'.
It adds those up into a score from zero to a hundred, and labels it High, Medium, or Low.
I kept this as code on purpose, so the priority is always repeatable and explainable.

Next, **Route by Category** — this is a Switch. `[click it]`
It sends the ticket down the branch for the right team — Billing, Tech, Account, or General. The branches then merge back together.

Then **Escalation Check** — an IF node. `[click it]`
The rule is: if priority is High, OR sentiment is negative, send it to a human first.

That human step is **Human Approval**. `[click it]`
It uses Gmail's 'Send and Wait for Approval'. It emails a support lead with Approve and Disapprove buttons, and it actually pauses the workflow until they click.

Then the third AI step — **Response Writer**. `[click it]`
It drafts a warm, personalised acknowledgement email, using the summary and the priority.

Finally, **Send Acknowledgement** emails that reply to the customer, and **Log to Google Sheets** saves the whole ticket as a row. `[click each]`"

---

## 3:30–5:30 — Run it with the sample input

`[ON SCREEN: click "Test workflow", then switch to the form tab]`

**SAY:**
"Let me run it. I'll click Test workflow, then open the form."

`[ON SCREEN: fill the form — name 'Priya Sharma', a real email you can check, and paste the sample message]`

**SAY:**
"I'll submit a realistic ticket. The customer says she was charged twice for her subscription, she wants a refund urgently, and she's clearly upset.
I'll submit it."

`[ON SCREEN: switch back to n8n; nodes light up green one by one]`

**SAY:**
"Watch the nodes run.
The Classifier tagged it as Billing, with negative sentiment. `[click Classifier output]`
The Extractor pulled out the summary and the keywords. `[click Extractor output]`
The Priority Scorer gave it eighty-seven out of a hundred — that's High. `[click Priority Scorer output, point to priority_score and priority_level]`
The Switch routed it to the Billing Team.
And because it's High and negative, the Escalation Check sent it for human approval."

`[ON SCREEN: open the approval email, click Approve]`

**SAY:**
"Here's the approval email. I'll click Approve.
Now the workflow resumes."

`[ON SCREEN: show the customer's inbox with the acknowledgement, then the Google Sheet with the new row]`

**SAY:**
"And here's the result. The customer gets a personalised email — it greets her by name, restates her issue, names the Billing Team, and promises a fast update because it's high priority.
And here in the Google Sheet, the ticket is logged — category, priority, team, timestamp. A clean audit trail."

---

## 5:30–7:00 — Where AI, where deterministic, and why

`[ON SCREEN: highlight the 3 AI nodes, then the code/switch/IF nodes]`

**SAY:**
"Let me be explicit about the design.
AI is used in exactly three places: classify, extract, and write the reply.
I used AI there because those are language and judgement tasks — understanding messy human text and writing a natural response.
Everything else is deterministic code.
The priority score is code. The routing is code. The escalation rule is code. The validation is code.
I did that on purpose. I never want to ask the model 'how urgent is this' and get a different answer every time.
Control decisions — scoring, thresholds, routing, who gets a human — have to be reliable and auditable.
So the pattern is simple: AI for understanding, code for control.
And for safety, every AI node retries and then continues on failure, and the code node fills in safe defaults — so one bad AI call never breaks the whole run."

---

## 7:00–8:00 — Limitations, improvements, and my contribution

`[ON SCREEN: back to the full canvas]`

**SAY:**
"A few honest limitations.
The AI can misread sarcasm — which is exactly why routing and escalation are deterministic, and why angry tickets get a human.
Right now input is one form submission, and the priority weights are hand-tuned, not learned.
For improvements, I'd ingest real email, add a knowledge-base lookup so the reply can suggest an actual fix, and push tickets into a real system like Zendesk or Jira.
Finally — this is my own individual submission. I designed and built all of it:
the problem framing, the three AI agents and their prompts, the deterministic scorer and routing, the escalation logic, the human approval step, and the integrations.
Thanks for watching."

`[ON SCREEN: end recording]`

---

### Quick recording checklist
- [ ] Workflow imported and credentials added (so it actually runs on camera).
- [ ] Form URL open in a second tab; sample message copied.
- [ ] An email inbox you can show for both the approval click and the customer reply.
- [ ] The Google Sheet open to show the logged row.
- [ ] Keep it between 5 and 8 minutes; it's fine to pause and re-record sections.
- [ ] Export/upload to Google Drive (or Loom) and set sharing to "anyone with the link".
