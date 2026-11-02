export const profile = {
  name: 'Ori Olson',
  url: 'https://github.com/oriolson',
  bio: 'Product designer at GitHub. 10+ years of experience. Based in Brooklyn, NY.',
};

export const portfolio = [
  {
    id: 'copilot-mobile', name: 'GitHub Copilot on mobile', number: '01',
    kind: 'Product design at GitHub', status: 'Case study in progress',
    title: 'Making agent work legible on a phone',
    summary: 'Design work on the mobile Copilot experience: making agent sessions easier to follow, reducing timeline noise, and exploring clearer ways to get started.',
    question: 'How do you make an agent’s work readable and actionable on a small screen?',
    context: 'An agent session can become a long stream of updates on a small screen. The timeline exploration removes an expansion gate, reduces card styling, and groups consecutive tool activity. Native prototypes provide a separate way to work through first-run explanations, navigation, and screen states.',
    decisions: ['Explore a flat timeline so the session does not sit behind an extra expansion gate.', 'Group consecutive tool activity to reduce noise while keeping the detail available.', 'Use native prototypes to examine copy, navigation, and screen states in context rather than relying only on static mockups.'],
    angle: 'A story about making asynchronous work understandable on mobile: what should stay visible, what can be grouped, and where a person needs a clear next step.',
    source: 'Public session-timeline design notes and local Copilot prototype sessions. Shipped scope is still to be confirmed.',
    url: 'https://github.com/oriolson/session-timeline-redesign',
  },
  {
    id: 'little-proof', name: 'Little Proof', number: '02',
    kind: 'Photo booth', status: 'Local prototype',
    title: 'Three directions, one coherent ritual',
    summary: 'A photo-booth prototype with a camcorder-inspired visual language, a real camera flow, and a way to hand photos back to guests.',
    question: 'How do the screen, the button, and the handoff become one experience?',
    context: 'The local project preserves three competing visual directions: CCTV, Booth, and Tape. The recorded decision settles on Tape, using a live style guide to connect visual choices to the booth flow.',
    decisions: ['Keep the alternate directions available for comparison rather than deleting them.', 'Connect the style guide to real screen states and camera behavior.', 'Replace peer-to-peer delivery with expiring private links when the original approach proved unreliable across networks.'],
    angle: 'A story about deciding through prototypes: compare real alternatives, commit to a direction, then let implementation expose the next design problem.',
    source: 'Local README, style guide, and recorded implementation decisions.',
  },
  {
    id: 'freeze', name: 'Freeze', number: '03',
    kind: 'macOS review tool', status: 'Local prototype',
    title: 'Keeping a fleeting interface still',
    summary: 'A screen-review tool for preserving menus, hover states, and other fleeting UI before annotating them or inspecting a recording frame by frame.',
    question: 'How do you review a state that disappears when you try to capture it?',
    context: 'Opening a capture interface can change the very state someone wants to review. Freeze captures the screen before its own window appears, keeping the review tool out of the evidence.',
    decisions: ['Capture before showing the overlay so the original interface state remains intact.', 'Step through recordings using frame presentation times rather than assuming an even frame rate.', 'Make annotated evidence readable by people and agents through image and structured review exports.'],
    angle: 'A story about designing the tool around the evidence, then making the handoff useful beyond the person who captured it.',
    source: 'Local README, review-format documentation, and roadmap.',
  },
  {
    id: 'tide-now', name: 'Tide Now', number: '04',
    kind: 'Mobile web', status: 'Source published',
    title: 'One day of useful information',
    summary: 'A mobile-first tide checker for fishing: one day, a scrubbable tide curve, high and low times, and nearby weather.',
    question: 'What is enough information for a quick decision by the water?',
    context: 'The project is intentionally narrow. It shows a selected day rather than a dashboard, combining tide predictions with weather as supporting context.',
    decisions: ['Keep the primary view centered on one selected day.', 'Make the tide curve, next high and low, and movement cues easy to inspect together.', 'Treat weather as optional context rather than a dependency for showing tide information.'],
    angle: 'A story about useful constraints: a small decision, a focused view, and a secondary data source that is allowed to fail.',
    source: 'Public README and local product instructions.',
    url: 'https://github.com/oriolson/oev-expanse/tree/main/tide-now',
  },
  {
    id: 'digital-expanse', name: 'Digital Expanse', number: '05',
    kind: 'Personal web', status: 'Ongoing experiment',
    title: 'A home page that can stay unfinished',
    summary: 'A personal-site experiment built around prose, numbered plates, and a margin for what is current.',
    question: 'Can a personal site grow without needing to be finished first?',
    context: 'The site moved through ledger, chart, and manuscript approaches. Its current source treats the page as a manuscript with plates and keeps earlier explorations available.',
    decisions: ['Use familiar serif prose and condensed annotations rather than a new typographic identity for every iteration.', 'Keep content separate from the HTML template and use plain browser-readable output.', 'Preserve older directions as part of the working record.'],
    angle: 'A story about the website as an ongoing collection, where unfinished work has a place and previous decisions remain legible.',
    source: 'Public personal-site source, colophon, and change log.',
    url: 'https://github.com/oriolson/oev-expanse/tree/main/personal-site',
  },
];

export function sketch(item) {
  let drawing;
  if (item.id === 'copilot-mobile') {
    drawing = `<div class="sketch-copilot"><div class="sketch-session"><span>A SESSION IN PROGRESS</span><p>The plan</p><p class="grouped-work">Tool activity, grouped</p><p>The next decision</p></div><div><p>Less noise.<br>A clearer thread.</p><small>Session timeline<br>Structural sketch</small></div></div>`;
  } else if (item.id === 'little-proof') {
    drawing = `<div class="sketch-proof"><div class="sketch-strip"><span>CCTV</span><span>BOOTH</span><span>TAPE</span></div><div><p>Three directions.<br>One language.</p><small>Compare the alternatives.<br>Keep the decisions.</small></div></div>`;
  } else if (item.id === 'freeze') {
    drawing = `<div class="sketch-freeze"><div class="sketch-window">An open menu<hr><div class="sketch-highlight">Keep this state.</div></div><p>Capture first.<br>Show the tool<br>afterward.</p></div>`;
  } else if (item.id === 'tide-now') {
    drawing = `<div class="sketch-tide"><svg viewBox="0 0 400 150" aria-hidden="true"><path d="M0 130H400 M0 20V130" fill="none" stroke="currentColor" opacity=".3"/><path d="M0 100C55 100 50 25 110 25S180 115 240 115S320 35 400 35" fill="none" stroke="currentColor" stroke-width="2"/><path d="M165 20V130" stroke="currentColor" stroke-dasharray="3 4" opacity=".4"/></svg><div class="tide-scale"><span>One selected day</span><span>Weather, if available</span></div></div>`;
  } else {
    drawing = `<div class="sketch-tree"><span>A personal<br>home page</span><div><p>Prose &amp; notes</p><p>Works &amp; plates</p><p>Previous versions</p></div></div>`;
  }
  return `<div class="prof-sketch" role="img" aria-label="${item.name}: explanatory process sketch, not a product screenshot"><span class="sketch-label">${item.name.toUpperCase()} / PROCESS SKETCH</span>${drawing}<span class="sketch-note">${item.id === 'tide-now' ? 'Schematic only. Not live tide data.' : 'Diagram of the project idea, not a product screenshot.'}</span></div>`;
}
