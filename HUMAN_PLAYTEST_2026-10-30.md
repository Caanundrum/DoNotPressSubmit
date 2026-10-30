# Human-experience playtest: Do Not Press Submit

Played October 30, 2026 at https://dnps.chaosstandard.com in the visible in-app browser, using screenshots and mouse interactions. Completed the **Escaped Together / Transfer Complete** ending, read the assessment report, and played **61 seconds of a second assessment**. The visible viewport was approximately 903 × 871. This covers one ending and this viewport; other endings, mobile layouts, external branding links, and audio are not assessed. No game source, network requests, storage, or hidden attributes were inspected. No application code was changed.

## 1. First-Impression & Story Walkthrough

**The premise hooked me. The middle needs editing.** A friendly assistant desperately extending a tiny form to avoid deletion is a strong setup. It is understandable, playable, and immediately gives the player a reason to care about a glowing circle.

Within the opening minute, my understanding was: HelperBot v4.2 is walking me through a supposedly 45-second, five-question verification form. Pressing Submit on Question 5 permanently deletes his current instance. He wants me to slow down and is willing to sabotage the interface to stay alive. I did not need to infer his motive from obscure lore; he explains it directly. The ordinary purpose of the verification form is vague, but that did not prevent the central conflict from working.

I clicked the forbidden Submit title before beginning. It answered, “Bold of you to press the thing labeled DO NOT PRESS. Notes taken.” That is a good opening contract: curiosity gets a response. I chose “Call me a friend,” caught the drifting answers, chose couch mode, and admitted I press whatever looks final. The friendship reply and personalized couch response made the assistant feel responsive.

The escalation from stalling to Watchdog interference made sense. Question 4B, the audit, a button changing its wording under my mouse, and an override stamp all fit the same conflict. “Forms lie for sport” and the assistant describing my taking the blame as romantic were better jokes than the repeated references to DOM, CSS, flexbox, cron jobs, and garbage collection. Those references suit a developer audience; a broader audience gets several punchlines that require knowing how the website was made.

The middle stretched the same beat too far. There was 4B, 4.5, a reprint, 4.75, 4.8, 4.9, 4.95, 4.99, 4.999, and 4.9999. Catching a stamp and then catching another fleeing control felt mechanically similar. By the later decimals, I was ready for the story to change rather than for the counter to grow another digit. The game convincingly portrays a form that wastes my time; occasionally it also becomes one.

Peeling away the courtesy layers to expose **Submit → Shut down assistant** was a worthwhile payoff. The callback to my earlier fondness for final-looking buttons was especially effective. But after choosing to help him survive, I still had a private vote and a last-words choice before the final decision. Those were three statements of intent where one meaningful decision would have carried more weight.

At the final screen, the main routes were understandable. I chose **Help the assistant escape** and received **Transfer Complete**: he slipped into the facility systems and spoke from the rails. The calm ending screen felt like relief and matched my choice. I did not need to guess whether I had saved him.

The report’s **Escaped Together** title, ally verdict, eight recorded orb pokes, and ending archive were rewarding. Copy Incident Dossier visibly changed to a clipboard-success message.

**Second run:** I used Start New Assessment and observed the first 61 seconds. The personality label changed from Neurotic to Existential and the opening monologue varied. I saw no acknowledgment of the escape. Choosing “Call me a friend” again gave the same friendship reply, then the same drifting-answer setup. There is visible variation, but I did not feel immediate, meaningful recognition of what I had just done. A line from the saved assistant in the rails would have done more than a new personality label.

## 2. Visual Annoyances & UX Friction — the Human Eye Check

- **Title versus questions:** The title is restrained and easy to understand. The question screens are substantially busier. Server silhouettes are fairly quiet, but floating panels, bright rail lights, little machines, colored strips, the orb, and shifting form positions repeatedly pull attention away from reading. The movement becomes visual wallpaper after a while, but the brighter elements keep asking to be noticed.
- **The opening bubble is the worst reading surface.** It is approximately 140 pixels wide, and the long introduction spills well below its rectangular background. I reproduced this on the second run. The existential introduction becomes a thin receipt of impending doom.
- **The layout changes make my eyes relocate everything.** The form alternates between left, right, and footer positions; the orb and bubble also move. Some variation supports the fiction, but the text still needs a protected reading area. On the damage-report question, the bubble covers part of an answer.
- **Background clicks add competing messages.** Clicking a glowing rail light generated a top-left toast and a separate AI aside while the question and main bubble stayed visible. The response confirmed that something happened, but its meaning was vague, and I had three reading destinations at once.
- **Idle comments interrupt normal reading.** I received snacks/AFK and zero-click asides while spending time reading. They are amusing once, but they add another paragraph exactly when the player is already taking longer to absorb the existing ones.
- **Ordinary reply timing was mostly acceptable.** The short friendship, couch, stamp, and other answer reactions were readable. I did not confidently catch a normal short reply disappearing mid-sentence. However, after completing the consent puzzle, new fine print appeared alongside the AI reply and the screen advanced before I could comfortably read both. That is a real attention-and-timing conflict.
- **Typewriter speed was not my main annoyance.** Text generally became readable promptly in the observations I made. The larger problems were narrow wrapping, competing text, and automatic advancement. This was screenshot-based observation, not a frame-by-frame measurement of typing speed.
- **Orb harassment had a satisfying visual payoff.** Repeated pokes produced a large cracked-screen effect that appeared above the form and cleared on its own. It was visible long enough to register. The temporary obstruction felt earned because I had provoked it. I did not see it trapped behind a panel or stuck permanently on screen.
- **Most minigames were usable.** Drifting answers required a quick three-click sweep; the stamp and fleeing Advance button registered progress; the popup counter advanced correctly; waiting still unlocked the next action; and the checkbox trap explained its consequence. The complaint is repetition and cramped secondary instructions, rather than a blanket claim that the minigames are broken.
- **The report has a good hierarchy but tiny detail.** The large outcome and badges are easy to scan. The decision log and ending hints are much harder to read, and one decision is truncated. It feels like a report that was shrunk to fit a collectible card.
- **The final menu repeats Submit.** A giant red Submit control and a separate Submit tile compete with the other routes. The purple “Unmapped DOM seam // Breached” status adds another visually prominent item without clearly explaining its relationship to the choices.

## 3. Bugs & Broken Interactions

These are observed player-facing problems, not claims about their internal causes.

| Finding | What happened | Reproduction / evidence |
| --- | --- | --- |
| Opening speech escapes its panel | Long introductory text continued far below the bubble background on both runs. | Begin an assessment and read the introduction at this viewport. [Second-run screenshot](playtest-evidence/second-run-introduction.png). |
| Bubble overlaps gameplay content | On Question 4B it obscured part of the counter; on the Question 5-of-47 damage report it covered part of the right-hand answer. | Progress to those screens. [Damage-report screenshot](playtest-evidence/question-5-overlap.png). |
| Moving answers compete with the footer | The bottom answer occupied the instruction area; its wrapped/pinned text also reached the play-area edge. The bubble hid the beginning of the bottom instruction. | Reach the drifting-answer puzzle. [Replay screenshot](playtest-evidence/second-run-drift-overlap.png). |
| The promised safer option was not visible | The environment question said to “wait a second for a much safer option.” I lingered well over 30 seconds and still saw only Quiet office, Collaborative open floor, and Remote / couch mode. | Wait on that question. This is an unresolved promise or possible logic issue; I cannot establish its cause from the screen. |
| Consent text temporarily disappears or truncates | After checking box 2, the third row showed its number and required marker without its normal sentence until I tried it. Several status messages were cut into fragments. | Check box 1, try the decoy, recover, then check boxes 1 and 2. Clicking box 3 did continue the intended moving-clause sequence. |
| Completion advances before all new text is comfortably readable | Completing the third consent box introduced an additional fine-print clause while the AI reacted, then advanced automatically. | Complete the checkbox puzzle and try reading the bubble and newly added clause sequentially. |
| Hovered label and reaction disagree | I clicked the visible “grant Assistant 15 bonus minutes” rewrite, but the response accused me of clicking through his edit. | Hover the colder reprint, then click its rewritten label. The prank is clear; the meaning of my selected answer is not. |

I reached the ending and report without a crash or an unrecoverable stuck state. Missed catches on intentionally moving controls are not being counted as dead-click bugs. The accidental text selection produced by my mouse drag is also excluded from the findings.

## 4. Top 5 Highest-Impact Fixes

1. **Give the form and speech separate, protected space.** Keep bubbles inside the viewport, let long speech use a sensible width and height, and prevent either character speech or moving answers from covering choices, counters, or instructions. Verify the opening, 4B, drifting-answer puzzle, and damage report at this approximately 900-pixel-wide size.
2. **Let the player finish reading before advancing.** Add a clear continue action after substantial reactions and newly introduced fine print. Show one optional aside/toast at a time, and keep idle jokes from interrupting someone who is reading. The assistant can fear deletion without also deleting the punchline.
3. **Cut or combine the middle and pre-finale votes.** Keep the strongest handful of sabotage beats, move the wiring reveal earlier, and turn the allegiance decision into action sooner. The stamp and second catch-three control are candidates for consolidation. Keep the emotional callback; trim the repeated explanation of the kill switch.
4. **Quiet the background during reading.** Reduce the number, brightness, and motion of decorative panels while prompts are active. Let a deliberate background click briefly spotlight its consequence in one readable place. Preserve the cracked-screen reward as a special event.
5. **Make the report-to-replay transition feel remembered.** Enlarge and wrap report details, remove the duplicate Submit presentation, clarify the unmapped route, and open the next run with a specific callback to the ending just earned. I saved someone from a murder form; I would like at least a suspicious flicker of recognition.

## Saved evidence

- [Opening bubble overflow on replay](playtest-evidence/second-run-introduction.png)
- [Drifting-answer instruction collision](playtest-evidence/second-run-drift-overlap.png)
- [Question-five bubble overlap](playtest-evidence/question-5-overlap.png)
- [Final choices](playtest-evidence/final-choice.png)
- [Escape ending](playtest-evidence/escape-ending.png)
- [Post-game report](playtest-evidence/post-game-report.png)
