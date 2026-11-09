# 1000 Monkeys — Project Doc

Nov 9, 2026 · @Doug

## Summary

1000 Monkeys is a simple, comfortable reader for your own work. You read your draft like a finished book, jot notes and make light edits as you go, and the changes sync back to Notion or Google Docs, or save to your 1000 Monkeys library.

Feedback is the upgrade. A free account can share a piece with up to two readers for simple reactions and notes. The paid tier opens full beta rounds: more readers, triage, version history, and the features nobody else has, like intent vs. reception.

**The name.** It comes from the old line about monkeys at typewriters eventually writing Shakespeare. Here the readers are the monkeys, helping a story get written. It began as a fictional publisher I invented for a logo assignment in design school, and it's the imprint I plan to publish Ethereal Fairytales under: 1000 Monkeys Publishing Co.

## Problem

Reading your own draft the way a reader would is one of the best revision tricks there is. The tooling for it is held together with tape.

- **Writers already hack it together.** One writer converts drafts to EPUB and sends them to Apple Books, because the draft reads like a different book there and can't be edited, only lightly marked up ([source](https://edan.substack.com/p/dispatch-28-flashbacks-revision-and/comments)). Scrivener users follow guides to push drafts to a Kindle or Kobo and revise from the highlights ([source](https://kirkville.com/how-to-revise-the-draft-of-your-scrivener-project-on-an-ebook-reader/)).
- **The round trip is the broken part.** Highlights get stuck on the e-reader. Notes are carried back by hand.
- **Versions pile up as copies.** My own setup: chapters live in Notion toggles, and old versions lived in nested toggles until exporting got too painful to keep doing it.
- **Beta feedback scatters.** Email threads, Word files, chat messages. Nothing ties a reader's reaction to the sentence it's about.

## Who it's for

Writers are the customer. Everyone else is someone the writer brings along.

| Who | What they need | Pays? | Phase |
| --- | --- | --- | --- |
| **Writers revising** (primary) | Read the draft like a finished book, mark problems in place, get notes back to where they write | Yes | 1–2 |
| **Beta readers** | A pleasant reading experience with no account, and quick ways to react | No | 2 |
| **Illustrators** | See the manuscript, drop sketches into art slots, see them land on the page | No | 2 |
| **Public readers** (someday) | Read published work directly from the author | Maybe | 3 |

I'm user #1. If it doesn't earn a permanent spot in my own revision routine, it doesn't ship to anyone else.

## Principles

It has to feel simple even when it isn't. Every new feature will try to break these, so they're written down first.

1. **The page is the home screen.** Reading is always the default state.
2. **Everything else is one tap behind the page.** Settings, feedback, versions, sharing.
3. **No dashboards.** Feedback shows up in the margin, next to the text it's about.
4. **The author is a reader too.** One reader with different permissions, not two apps that drift apart.
5. **Readers never write to the manuscript.** The author approves everything that reaches the source doc.
6. **The free version stays useful.** Local, private, unlimited reading, the way it works today.

## Experience

Great UX is the product. Writing for yourself and giving feedback should both feel easy, fun and rewarding. If it feels like work, beta readers drift away and I stop using it myself.

**The bar**

- **Easy.** Any reaction takes one gesture and under a second. No menus, no forms, no account.
- **Fun.** Reactions have a little life to them: a heart that pops, a margin mark that warms up as readers respond.
- **Rewarding.** Readers see their notes matter. Authors see what's working, not only what's broken.

### Gestures

| Gesture | Where | What it does |
| --- | --- | --- |
| Tap left or right edge, or swipe | Page mode | Turn the page |
| Tap the middle | Anywhere | Show or hide controls |
| Double-tap a paragraph | Text | Like it; a heart pops in the margin |
| Long-press | Text | Select the sentence; drag handles to adjust |
| Tap a margin mark | Margin | Open that paragraph's reactions and notes |
| End-of-chapter card | Chapter end | One-tap rating, optional note, then straight into the next chapter |

Double-tap has a cost: single taps must wait a beat to see if a second one is coming. Keep page-turn edges instant by not listening for double-taps there, and tune the timing on real phones.

### Custom text selection

Native selection on iPhone is fiddly: tiny handles, a system menu in the way, page swipes fighting the drag. A custom layer can do better, and the web pieces now exist in every major browser.

- **Sentence-first.** Long-press selects the whole sentence, the natural unit of feedback, and handles snap to word boundaries. `Intl.Segmenter` splits text into sentences and words in Chrome 87+, Firefox 125+ and Safari 14.1+ ([source](https://web.dev/blog/intl-segmenter?hl=en)).
- **Finding the touch point.** `caretRangeFromPoint` maps a finger position to a spot in the text. It's non-standard but supported in Safari on iOS ([source](https://docs.w3cub.com/dom/document/caretrangefrompoint)).
- **Drawing it.** The CSS Custom Highlight API paints selections and highlights without changing the text's markup. Safari on iOS has supported it since 17.2 ([source](https://caniuse.com/mdn-api_css_highlights_static)).
- **Our own bar, not the system menu.** A selection opens one row: reactions, add a note, suggest an edit.
- **Native stays available** for copying, VoiceOver, and anyone who prefers it. Custom selection must never break accessibility.

### Reactions

- **A small fixed set** so they add up into something readable: Loved, Funny, Confused, Dragging, Lost me.
- **Double-tap is Loved.** The others live in the selection bar and on margin marks.
- **Chapter likes** come from the end-of-chapter card.
- **Reward, don't gate.** Notes are always optional. Some beta tools lock the next chapter until readers leave feedback; this one never does.

### Making it rewarding

- **Close the loop.** When the author accepts a note, the reader gets a small thank-you: "Doug used your suggestion in chapter 3." I suspect this does more for reader engagement than any other feature.
- **Show what's working.** A loved-passages view for the author, so a beta round isn't just a list of problems.
- **Light progress for readers.** How far they've read and how many reactions they've left. No streaks, no nagging.
- **A finish moment.** A short thank-you from the author at the end, then the closing questions.

### Feel

- **Quick, small animations** on reactions (a heart pop, a warming margin mark). Lottie is a natural fit. Respect Reduce Motion.
- **Fast and calm.** Opens instantly, works offline, saves locally first and syncs in the background. No spinners while reading.
- **Haptics need a native app.** iOS Safari has never supported the web vibration API, and the switch-element workaround stopped working in iOS 26.5 ([source](https://rapidtoolset.com/en/tool/ios-haptics-tester)). Real haptics are a good argument for a native wrapper later.
- **First run for readers.** A shared link opens straight to chapter one. One short hint shows the three gestures, then gets out of the way.

### UX teardown (to do)

Compare reading and feedback flows in Kindle, Apple Books, Medium, Wattpad, Readwise Reader and the beta tools in the competitive overview. Focus on how a reaction gets made, how selection feels on a phone, and what keeps people coming back.

## Roles and surfaces

Both roles open in the same reading view. The author just has extra layers they can switch on.

### Author, by device

| Device | Main jobs | Not for |
| --- | --- | --- |
| **Phone** | Read your own work, react to it, triage feedback (swipe to accept or dismiss), fix typos | Real drafting |
| **Tablet** | Everything on phone, plus a feedback panel beside the text and light editing | Admin work |
| **Desktop** | Full editor, feedback in a side column, inviting readers, setting up rounds, comparing versions | Nothing ruled out |

### Reader

Mostly on a phone. The gesture sets the scope, so nobody picks from a menu.

| Gesture | Scope | What they can leave |
| --- | --- | --- |
| Long-press and select | Sentence or phrase | Reaction, note, or suggested edit |
| Tap the margin | Paragraph | Reaction or note |
| End-of-chapter card | Chapter | One quick rating, optional note |
| Closing questionnaire | Whole book | Answers to questions the author wrote ahead of time |

Readers don't need an account. Each one gets a personal link, so their notes come back with their name on them and they never see a sign-up screen.

## Structure

The story and the feedback on it live in two separate trees. A round never copies text: it points at a slice of one work, pinned to a version. There's only ever one chapter 4, and notes can follow the text forward as it changes.

&#91;embedded content: structure · the story and the feedback on it\]

A round points at the work rather than holding a copy, and every note anchors to a single passage.

We call the scoped review a **round** rather than a project. Writers already say "beta round," and "project" tends to swallow everything. A saved pool of readers is a **troop**, because that's what a group of monkeys is called.

### Decisions to make early

- **Passages get permanent IDs from day one.** Notes, reactions, Notion block sync, variants and art slots all hang off them. Adding stable IDs later is painful.
- **Every piece of feedback carries four tags:** round, version, reader and passage. Those four make every later view possible (by reader, by chapter, outdated vs. current) without restructuring.
- **Roles are set per work.** Someone can be a reader on one story, an editor on another and an illustrator on a third.
- **Reader history across rounds,** visible only to the author: who finishes, who's sharp on dialogue, who reads fast. Useful for building troops, but kept light so it never feels like grading people.
- **The free limit lives per round.** A round with up to two readers is free. Troops and bigger rounds are the paid tier.
- **One source per work.** A work links to one Notion page, one Google Doc, or is native. Mixing sources inside one work gets messy fast.

**Keep the structure out of sight.** Rounds start from the reader, not a form: select chapter 4 or a few passages, tap "Get feedback," pick readers or a troop. Most people never see Series or Troops until they need them.

## Core features

### Sources

- **Notion** first, since that's where my stories live. One-way sync: edit in Notion, the reader updates.
- **Google Docs** next.
- **Native docs** with a light editor, so the product isn't fully dependent on another platform. The editor should feel like the reader grew a cursor: same type, same page, no toolbar maze.
- **Paste and PDF** stay, as they work today (PDF text extraction already filters running headers and footers).

One rule keeps sync sane: native docs are editable, synced docs are read-and-comment. Tiny fix-it edits (a typo) can write back one block at a time, and that's the limit.

### Versions

Every reading round saves a snapshot of the draft automatically. Old versions stay one tap away, and every note stays tied to the version it was written on. This replaces the nested-toggle habit that made exports painful.

### Feedback and triage

The app is the feedback inbox. The source doc only gets what the author decides to keep.

- **Margin heat.** Each paragraph gets a mark that darkens as more readers react. Tap it and the notes fan open.
- **Reactions first, notes second.** Loved this, confused, dragging, lost me. "6 confused, 2 loved" reads at a glance.
- **Merged duplicates.** Three readers fixing the same typo show up as one fix with a 3 on it.
- **Drop-off.** Where each reader stopped reading.
- **Accept, dismiss, or later.** Dismissed notes leave the margin. Accepting is the only thing that syncs.
- **Outdated notes.** When a paragraph is rewritten, notes on the old version get marked stale.
- **Filters** by reader, group, or round.
- **Blind by default.** Readers can't see each other's notes.

&#91;embedded content: feedback flow · 6 steps, 1 decision\]

Accepted notes and edits are the only thing that travels back to the source. Notes marked "later" wait in the inbox.

### What syncs back

| Destination | Accepted notes land as | Accepted edits land as | Limit |
| --- | --- | --- | --- |
| Native docs | Inline comments, full precision | Direct edits | None |
| Notion | A comment on the paragraph's block | Direct block edit | API can't start a thread on a highlighted phrase ([source](https://developers.notion.com/guides/data-apis/working-with-comments)) |
| Google Docs | Comments | Real Docs suggestions the author accepts in Docs | API support began rolling out Sept 30, 2026 ([source](https://workspaceupdates.googleblog.com/2026/09/programmatic-comment-and-suggestion.html)) |

### Kindle

**Later, only if people ask for it.** Getting a draft onto a Kindle is easy, but getting notes back is clunky, and that isn't the experience this product is aiming for. These notes are for when the time comes.

- **Delivery.** A Send to Kindle button builds an EPUB and emails it to the user's @kindle.com address, after they approve our sender once. Each resend lands as a separate copy with the same name, so titles carry a version label and old copies get deleted by hand ([source](https://bookmeister.pages.dev/en/articles/kxgpmghtor)).
- **Notes back.** Kindle has no API for highlights, and Amazon doesn't sync personal-document highlights to its cloud notebook ([source](https://docs.readwise.io/highlights/docs/importing-highlights/kindle)). Two manual routes work, the same ones Readwise uses:
  - Kindle phone or tablet app: email the document's notebook to a 1000 Monkeys inbox address.
  - Kindle e-reader: plug in by USB and upload My Clippings.txt, which logs every highlight, personal documents included.
- **Matching.** Every Kindle highlight carries its quoted text, so the quote anchoring planned for notes can put it back on the right paragraph.
- **Beta readers on Kindle** are possible but clunky: each would approve our sender and export their own notes. The web reader stays the main path for readers.
- **Other e-ink devices.** Android-based e-readers like Boox can run the web reader directly, with full sync.

## Differentiators

Most of the feedback features above are table stakes now. These are the ones I didn't find elsewhere, or found only in part. The headline pair is intent vs. reception plus Variants.

| Feature | What it does | Who else does it | Phase |
| --- | --- | --- | --- |
| **Live source sync** | Read and collect feedback on the draft where it already lives | None of the beta tools reviewed. BetaBooks doesn't even import EPUB; you paste everything in ([source](https://aifictionlab.substack.com/p/i-looked-at-every-beta-reader-platform)) | 1 |
| **Intent vs. reception** | Author tags what a passage should do (funny, tense, gut-punch). Readers react blind. The app shows where they matched and where they missed | Not found | 2 |
| **Variants** | Blind split for openings, endings, big rewrites. Side-by-side pick for a title, a line, two illustrations | Done by hand by splitting beta groups ([source](https://indieauthormagazine.com/precision-marketing-for-authors-harness-the-power-of-advanced-a-b-testing/)). Textbook platform EdTech Books has chapter "flights" ([source](https://edtechbooks.org/userguide/flights)). Not found for fiction | 2 |
| **Skim detection** | Page-turn speed against the reader's own pace flags where they got bored but kept going | BetaReader.io tracks time per chapter and drop-off. Page-level skimming not found | 2 |
| **Illustration slots** | Art placeholders in the manuscript, an illustrator role, sketches landing in page mode where they'll fall | Not found | 2 |
| **Reading level per chapter** | Flags chapters that drift above a target age band, for kids' and middle-grade work | Not checked yet | 2 |

Variants come with a caveat: A/B tests need more readers than most authors have, so results are directional, not statistics ([source](https://www.jellybooks.com/about/authors/ab-testing?locale=en)).

## Competitive overview

The beta-reader tool market is small and slow-moving, and nobody syncs with where writers actually write. The closest threat is Reedsy Studio: free, with a real e-reader for beta previews, but only if you write in Reedsy.

| Product | What it is | Price | Where it falls short for this use |
| --- | --- | --- | --- |
| [Reedsy Studio](https://reedsy.com/studio/write-a-book) | Free writing app with shareable preview links for beta readers and a version timeline | Core free; 30-day history free, unlimited with Craft add-on | You have to write in Reedsy. Previews appear to be read-only ([review](https://blog.chapter.pub/reedsy-book-editor-review/)) |
| [BetaBooks](https://janefriedman.com/beta-management-services-compete-for-authors/) | Feedback manager since 2017, with To Do / Consider / Ignore triage | Free for 1 book and 3 readers; $14.99/mo after (older review) | Copy-paste only, no mobile apps, slow-moving ([source](https://aifictionlab.substack.com/p/i-looked-at-every-beta-reader-platform)) |
| [BetaReader.io](https://www.spotsaas.com/product/betareader-io/pricing) | Feedback plus the best analytics in the space: time per chapter, drop-off graphs, a reader marketplace | Free (1 manuscript, 3 readers); $9.99/mo; $49.99/mo (as of May 2026) | Reliability complaints and a stale Android app ([source](https://aifictionlab.substack.com/p/i-looked-at-every-beta-reader-platform)) |
| [StoryOrigin](https://StoryOriginApp.com/pricing) | Author marketing suite with a beta-copies module: chapter gating, questionnaires, blind comments | $10/mo or $100/yr | Beta is a side feature; inline comments capped at 240 characters |
| [Author's Haven](https://aifictionlab.substack.com/p/i-looked-at-every-beta-reader-platform) | Newest entrant: pen names, NDA gates, feedback categories, AI feedback analysis, emoji reactions | Free (1 book, 5 readers); $14.99/mo; $39.99/mo | Built around managing readers, not the reading experience or source sync. Comparison written by its founder |
| [Heybeta](https://janefriedman.com/beta-management-services-compete-for-authors/) | Beta management with chapter- and book-level feedback | About half BetaBooks' price (older review) | No inline comments at review time |
| [BookFunnel](https://cartmango.com/bookfunnel-pricing/) | Ebook delivery for ARCs and reader magnets | $30, $200, or $300/yr | Delivery only, no feedback |
| [Readest](https://readest.com/docs), Send to Kindle | Free readers with good typography and sync | Free | No path for notes back to the author |

**Table stakes** (already common): triage states, blind comments, chapter gating, surveys, emoji reactions, drop-off tracking, and now AI feedback summaries.

**Open lanes:** source sync, intent vs. reception, Variants for fiction, page-level skim detection, illustration slots.

## Phasing

&#91;embedded content: roadmap · 3 phases, 2 gates\]

Phase 1 is deliberately small. It only has to prove the round trip works in my own revision routine.

## Technical notes

The product version breaks the single-file rule on purpose. Sync, accounts and sharing need a small backend; the Cloudflare Worker already planned as a Notion proxy is a natural starting point.

- **Today:** one HTML file, localStorage, pdf.js for PDF text, measure-and-pack pagination for page mode.
- **Notion import:** top-level toggles become chapters. Nested toggles (my old versions) could import as history or be skipped.
- **Sync direction:** source to reader, one way. Only feedback the author accepts writes back.
- **Anchoring:** store each note's quoted text plus a few words on either side, along with the block ID. Notes find their place again after edits, and a missing quote marks the note outdated. This is the web-annotation approach tools like Hypothesis use.
- **Notion API:** comments attach to a whole block. It can reply to an existing phrase-level thread but can't start one ([source](https://developers.notion.com/guides/data-apis/working-with-comments)).
- **Google Docs API:** comments and suggested edits are supported, rolling out from Sept 30, 2026 ([source](https://workspaceupdates.googleblog.com/2026/09/programmatic-comment-and-suggestion.html)).
- **Offline reading:** keep it. Reedsy Studio is browser-only today and plans to make offline a paid feature ([source](https://reedsy.com/studio/write-a-book)).
- **Reader tracking** (drop-off, skim detection) is opt-in and disclosed up front. One review found BetaReader.io's tracking could feel like spying on readers ([source](https://janefriedman.com/beta-management-services-compete-for-authors/)).
- **Known issue:** in page mode, a paragraph taller than the screen overflows its page. It needs splitting inside paragraphs.

## Business model

The base product is free: a comfortable reader for your own work, plus personal editing tools. Sharing with more than two readers is the upsell. People won't pay for storage; they'll pay for the loop between reading, feedback and the manuscript.

| Tier | Includes | Price |
| --- | --- | --- |
| **Free** | The reader, personal notes and light edits, Notion and Google Docs sync or saving to your library, rounds with up to 2 readers for simple feedback | $0 |
| **Writer** | Bigger rounds, troops, triage and margin heat, version history | Test $8–10/mo, about $80/yr |
| **Later** | Variants, intent vs. reception, illustrator role, Kindle support if people ask | TBD |

Price anchors: BetaReader.io starts at $9.99/mo, StoryOrigin is $10/mo, Author's Haven Pro is $14.99/mo, and Reedsy Studio is free.

**Selling stays off the table for now.** If publishing ever happens, start with link-outs to the author's own Patreon, Ko-fi or Gumroad, which carries no payment risk. Stripe Connect only if people ask. It can create, file and deliver 1099s for a platform ([source](https://stripe.com/en-si/connect/1099)), though who's responsible for filing depends on who controls pricing ([source](https://support.stripe.com/questions/who-is-responsible-for-1099-tax-reporting-after-migrating-standard-connected-accounts)).

## Risks and open questions

The biggest risk is the one closest to home: this was built to get me writing again, and a product could eat that time instead.

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| **It eats writing time** | Sync, auth and billing are the kind of shiny work that crowds out the actual stories | Phase 1 is for me only. Move on only if I'm really using it |
| **Reedsy adds feedback to previews** | They're free and already have the e-reader | Lead with sync and the unique features, not the reader alone |
| **Platform APIs change** | Sync depends on Notion and Google | Native docs as the fallback home |
| **Tiny samples** | Variants with 12 readers is 6 vs. 6 | Present results as directional, never as winners |
| **Tracking feels creepy** | Readers quit if they feel watched | Opt-in, disclosed, aggregate views for the author |
| **Kids as readers** | For children's books, collecting data from kids under 13 brings in children's privacy rules (COPPA in the US) | Parents hold the account; no tracking on child readers; get proper advice before launch |

**Open questions**

- [ ] Should nested Notion toggles import as version history, or be skipped?
- [ ] Is 1000 Monkeys clear as a trademark and domain? A collaborative fiction site, One Million Monkeys Typing, used the same idea from 2007 to 2011 and called its users "monkeys" ([source](https://en.wikipedia.org/wiki/One_Million_Monkeys_Typing)). It's long offline, but worth knowing.
- [ ] Free accounts get sync and server storage. What cap keeps hosting costs sane?
- [ ] With the platform and the publishing imprint sharing a name, the terms need to say plainly that writers own their work.
- [ ] Do Reedsy previews collect any reader feedback today? Check hands-on.
- [ ] What's a "round": a fixed window of time, or one version of the draft?
- [ ] $8 or $10 for the Writer tier?

## Next steps

Start small and use it for real before building anything for anyone else.

- [ ] Notion sync for my Ethereal Fairytales page, with top-level toggles as chapters
- [ ] Highlight a passage, send it to Notion as a block comment
- [ ] Prototype sentence-first custom selection and double-tap likes, tested on a real iPhone
- [ ] Do one full revision pass on Hildur using only 1000 Monkeys
- [ ] Fix page-mode overflow for long paragraphs
- [ ] UX teardown: Kindle, Apple Books, Medium, Wattpad, Readwise Reader and the beta tools
- [ ] Run a small test round on the free tiers of Reedsy Studio, BetaBooks, BetaReader.io and StoryOrigin, with two friends as readers
- [ ] Talk to five writers who've run a beta round about what broke
- [ ] Check 1000 Monkeys trademark and domain availability

## Sources

- [Notion: Working with comments](https://developers.notion.com/guides/data-apis/working-with-comments)
- [Google Workspace Updates: comment and suggestion support in the Docs API](https://workspaceupdates.googleblog.com/2026/09/programmatic-comment-and-suggestion.html)
- [Stripe Connect: 1099 tax reporting](https://stripe.com/en-si/connect/1099)
- [Stripe: who is responsible for 1099 reporting](https://support.stripe.com/questions/who-is-responsible-for-1099-tax-reporting-after-migrating-standard-connected-accounts)
- [Reedsy Studio: features and FAQ](https://reedsy.com/studio/write-a-book)
- [Chapter.pub: Reedsy Studio review](https://blog.chapter.pub/reedsy-book-editor-review/)
- [The Indie Lab: beta reader platform comparison (May 2026)](https://aifictionlab.substack.com/p/i-looked-at-every-beta-reader-platform)
- [Spotsaas: BetaReader.io pricing](https://www.spotsaas.com/product/betareader-io/pricing)
- [StoryOrigin: pricing](https://StoryOriginApp.com/pricing)
- [StoryOrigin: beta copies](https://storyoriginapp.com/features/gather-beta-reader-feedback)
- [Jane Friedman: beta management services compared](https://janefriedman.com/beta-management-services-compete-for-authors/)
- [Indie Author Magazine: A/B testing for authors](https://indieauthormagazine.com/precision-marketing-for-authors-harness-the-power-of-advanced-a-b-testing/)
- [EdTech Books: Flights or A/B testing](https://edtechbooks.org/userguide/flights)
- [Jellybooks: A/B testing](https://www.jellybooks.com/about/authors/ab-testing?locale=en)
- [BookFunnel pricing in 2026](https://cartmango.com/bookfunnel-pricing/)
- [Readest documentation](https://readest.com/docs)
- [Edan's Substack: reading drafts as EPUBs](https://edan.substack.com/p/dispatch-28-flashbacks-revision-and/comments)
- [Revising a Scrivener draft on an ebook reader](https://kirkville.com/how-to-revise-the-draft-of-your-scrivener-project-on-an-ebook-reader/)
- [Readwise: importing Kindle highlights](https://docs.readwise.io/highlights/docs/importing-highlights/kindle)
- [Bookmeister: Send to Kindle guide](https://bookmeister.pages.dev/en/articles/kxgpmghtor)
- [Wikipedia: One Million Monkeys Typing](https://en.wikipedia.org/wiki/One_Million_Monkeys_Typing)
- [web.dev: Intl.Segmenter is now Baseline](https://web.dev/blog/intl-segmenter?hl=en)
- [W3cubDocs: caretRangeFromPoint](https://docs.w3cub.com/dom/document/caretrangefrompoint)
- [Can I use: CSS Custom Highlight API](https://caniuse.com/mdn-api_css_highlights_static)
- [RapidToolSet: iOS haptics tester and limits](https://rapidtoolset.com/en/tool/ios-haptics-tester)
