# Game Safety Coach

Build the "Game Evaluation" flow for a marketplace of vetted soft-skills games for K-12 educators (focus: grades 6-8). This is the admin/platform side. Other teammates are building the educator browse side and the game-maker upload side in the same app, so keep to the shared data contract below.

SHARED DATA CONTRACT
- games: id, title, maker_name, skill (negotiation | public_speaking | conversation | collaboration | conflict_resolution), grade_band, duration_minutes, format (solo | pairs | whole_class), description, status
- game status values, exactly: draft, submitted, in_review, approved, approved_with_notes, needs_changes
- evaluations: id, game_id, attempt_number, status, overall_result, created_at
- findings: id, evaluation_id, category, severity (must_fix | should_fix | suggestion), title, evidence, why_it_matters, suggested_fix, resolved
- Educators only ever see games with status approved or approved_with_notes.

THE FLOW (maker perspective)
1. Submit: a game in "submitted" status shows a big "Start safety check" button.
2. Live evaluation screen: six checks run in parallel and tick off one by one with a friendly progress animation. Target total time feels like ~5 minutes; show a "about 4 min left" estimate. Checks:
   1. Content safety (hate, violence, sexual content, profanity, self-harm themes)
   2. Age fit (reading level, themes, tone vs claimed grade band)
   3. Privacy and data (personal info collected, accounts required, trackers)
   4. Ads and spending (ads, in-app purchases, manipulative design)
   5. Contact and social (open chat, user-generated content, outbound links)
   6. Learning fit (clear soft-skill objective, no stereotypes or bias, accurate duration)
3. Result screen shows one of three outcomes: Approved, Approved with notes, Needs changes. Headline copy is encouraging, like a coach ("Almost there, 2 things to fix"), never bureaucratic.
4. Findings list under the result: grouped by severity (Must fix, Should fix, Suggestion). Each finding card shows: title, category icon, evidence (quote or location in the game, e.g. "Level 3, NPC dialogue"), why it matters (one line), and suggested fix. Collapse details by default; show title + severity + evidence on the card.
5. Resubmit: "Fix and resubmit" button. On resubmit, only re-run the categories that had findings, so round two takes about a minute. Show attempt number.

HOW THE EVALUATION WORKS
- Use Lovable AI (or the built-in AI gateway) from a backend function. Run one focused call per category in parallel, each with its own rubric, returning structured JSON: findings with severity, evidence, why_it_matters, suggested_fix, and a confidence score.
- Every finding must include evidence. Drop any finding without it.
- Add a verification pass on flagged findings only: a second call asks "is this a real problem?" and drops false alarms.
- Any must_fix finding with low confidence shows a "Sent to human reviewer" tag instead of an automatic verdict. Make this visible, since it supports the trust story.
- Overall result logic: any must_fix = needs_changes; else any should_fix or suggestion = approved_with_notes; else approved.
- For demo reliability, if the AI call fails or times out, fall back to the seeded evaluation results below so the demo never breaks.

SEED DATA (two games)
1. "Haggle Hero" by Bright Byte Studio. Negotiation, grades 6-8, 15 min, pairs. Status: approved_with_notes. Findings:
   - should_fix, Age fit: Level 3 dialogue runs above the 7th-grade reading level (evidence: "Level 3, merchant counter-offer text").
   - should_fix, Contact and social: optional "Learn more" link leaves the game to an external site (evidence: "End screen, footer link").
   - suggestion, Learning fit: stated duration is 15 min but playtest pacing suggests 20.
2. "Comeback Kings" by Snap Studio. Public speaking, grades 6-8, 20 min, whole_class. Status: needs_changes. Findings:
   - must_fix, Content safety: insult-based humor targets appearance and weight (evidence: "Round 2, 'roast' prompt cards 4 and 7").
   - should_fix, Privacy and data: leaderboard asks for first name and school name (evidence: "Join screen").
   - suggestion, Learning fit: add a reflection step that connects banter to respectful disagreement.

DESIGN (Duolingo-inspired)
- Colors: primary green #58CC02 (pressed #58A700), blue #1CB0F6, red #FF4B4B, orange #FF9600, yellow #FFC800, neutral grays #E5E5E5 and #AFAFAF, text #4B4B4B, white backgrounds.
- Font: Nunito (rounded), bold headings.
- Large rounded corners (16px+), chunky buttons with a thick darker bottom border that depresses on click, generous whitespace, one main idea and one primary button per screen, short copy, big friendly icons paired with short labels.
- Status colors: Approved = green, Approved with notes = yellow/orange, Needs changes = red. Severity chips use the same palette.
- Don't overload screens. The result screen shows the outcome and top findings first; everything else is collapsed.

Build the maker submission list (showing the two seeded games and their statuses), the live evaluation screen, the result screen with findings, and the resubmit flow. Make it a working demo.

## Demo: sample game uploads

Two small single-page web games live in [`sample-games/`](sample-games) for demoing the upload flow (Submit a game → Upload → Details → Safety check → Result):

| File | Game | What the safety check should find |
| --- | --- | --- |
| [`haggle-hero.zip`](sample-games/haggle-hero.zip) | Negotiation, grades 6-8, pairs, 15 min | Should fix: Level 3 merchant dialogue reads above 7th grade (`game.js`). Should fix: "Learn more" link leaves the game (`index.html`, found by the rules scan). Suggestion: pacing suggests 20 minutes, not 15. Result: **approved with notes (Live)**. |
| [`comeback-kings.zip`](sample-games/comeback-kings.zip) | Public speaking, grades 6-8, whole class, 20 min | Must fix: roast cards 4 and 7 mock weight and appearance (`game.js`). Should fix: join screen asks for first name and school name (`index.html`, found by the rules scan). Suggestion: add a reflection step. Result: **needs changes (Draft)**. |

To demo: open **Submit a game**, drop one of the zips, tick the permission box, check the suggested details, add a "Hosted at" link, and start the safety check. For Comeback Kings, use **Fix now and resubmit** and upload the file again to show that only the flagged categories are re-checked.

Uploads are read in the browser only: files are never run, rendered, stored or uploaded. Only the extracted text and the rules-scan results are sent to the evaluation, and the app keeps just the game details, the findings, a SHA-256 fingerprint of the file and the review date.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/28b788f5-6f40-4f95-a66a-4c5e898a2e70).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
