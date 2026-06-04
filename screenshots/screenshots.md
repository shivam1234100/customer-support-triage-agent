# Screenshots to capture

Take these and save them in this `screenshots/` folder with the exact filenames below.
They prove the workflow is real and working, and they make the GitHub repo submission-grade.
(PNG is fine. Crop out anything sensitive — blur real emails/API keys.)

| # | Filename | What to capture | Why it matters |
|---|----------|-----------------|----------------|
| 1 | `01-full-workflow.png` | The **whole workflow canvas**, zoomed to fit (Ctrl/Cmd + "Fit to screen"). All nodes and connections visible. | Shows the overall structure — the #1 grading item. |
| 2 | `02-form.png` | The **Support Ticket Form** as a customer sees it (open the form URL in a browser). | Proves the input/tool-use entry point. |
| 3 | `03-classifier-output.png` | The **Classifier (AI)** node panel after a run, showing the JSON output `{ category, sentiment }`. | Proves AI role #1 + structured output. |
| 4 | `04-extractor-output.png` | The **Extractor (AI)** node output `{ summary, issue_keywords, customer_intent }`. | Proves AI role #2 + structured output. |
| 5 | `05-priority-scorer.png` | The **Priority Scorer** Code node — show the code AND its output (`priority_score`, `priority_level`, `team_label`). | Proves the deterministic logic. |
| 6 | `06-switch-routing.png` | The **Route by Category** Switch node panel (the 4 rules) OR the canvas showing which branch lit up green. | Proves routing/branching. |
| 7 | `07-escalation-if.png` | The **Escalation Check** IF node showing the High/negative rule. | Proves the deterministic escalation threshold. |
| 8 | `08-human-approval-email.png` | The **approval email** in the inbox with Approve/Disapprove buttons (from the Send & Wait step). | Proves human-in-the-loop. |
| 9 | `09-customer-acknowledgement.png` | The **acknowledgement email** the customer received (the AI-written reply). | Proves AI role #3 + email tool use + the useful output. |
| 10 | `10-google-sheet-log.png` | The **Google Sheet** with at least one logged ticket row. | Proves the durable log / tool use. |
| 11 | `11-successful-run.png` | The canvas right after a full run — **all nodes green** end to end. | Proves the workflow actually works. |
| 12 *(optional)* | `12-fallback-missing-message.png` | Submit the form with an empty message (or run the false branch) to show the **Fallback: Missing Message** path. | Proves error handling/fallback. |

## Tips
- Run the workflow once with `sample_input.json` first, then grab #3–#11 from that single successful run.
- For #1 and #11, hide the node panels so the full graph is clean.
- Reference these images in your README or video description if you like, e.g. `![Full workflow](screenshots/01-full-workflow.png)`.
