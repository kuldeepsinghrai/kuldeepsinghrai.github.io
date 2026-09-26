/* Kuldeep Singh · Terminal portfolio. Vanilla JS, no dependencies. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const win = $('#win'), term = $('#term'), out = $('#out'), line = $('#line'), input = $('#cmd');
const before = $('#before'), cur = $('#cur'), after = $('#after'), title = $('#title');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── PROFILE — mirrors the iPhone portfolio (index.html); update both together ── */
const ME = {
  name: 'Kuldeep Singh', role: 'App Developer', location: 'New Delhi, India',
  bio: 'Android Developer skilled in building smooth, user-friendly apps with Java, Kotlin, Jetpack Compose & MVVM. Worked with startups — adaptable, creative, and always learning new technologies.',
  stats: [['4+', 'Years'], ['3', 'Companies'], ['∞', 'Bugs Fixed']],
  phone: ['+91 98718 31349', 'tel:+919871831349'],
  email: ['imkuldeepsinghrai@gmail.com', 'mailto:imkuldeepsinghrai@gmail.com'],
  links: {
    linkedin: ['LinkedIn', 'kuldeepsinghrai', 'https://linkedin.com/in/kuldeepsinghrai'],
    github: ['GitHub', 'kuldeepsinghrai', 'https://github.com/kuldeepsinghrai'],
    instagram: ['Instagram', 'imkuldeepsinghrai', 'https://instagram.com/imkuldeepsinghrai'],
    whatsapp: ['WhatsApp', '+91 98718 31349', 'https://wa.me/+919871831349'],
  },
  resume: {
    file: 'Kuldeep_Singh_Resume.pdf', title: 'Kuldeep Singh — App Developer', note: 'Last updated 2025 · Google Drive',
    url: 'https://drive.google.com/file/d/1sCWV4LSbFSSGDClj5Iokuipy4p5A94_H/view?usp=sharing',
  },
  jobs: [
    {
      role: 'App Development Intern', at: 'Zillout · Remote', when: 'February 2026 – Present',
      points: ['Working on a project that can run on Mac, Windows, iOS and Android devices'], tags: [],
    },
    {
      role: 'Android Development Intern', at: 'Stock Register · Remote', when: 'August 2023 – February 2026',
      points: [
        'Maintained native Kotlin app with MVVM architecture & Room DB',
        'Built PDF & Excel export for reports, bills & bulk item uploads',
        'Multi-currency support & staff role-based access levels',
        'Initiated Jetpack Compose migration; shipped features end-to-end',
        'Published updates on Google Play Console',
        'Worked closely with founder on UX-focused features',
      ],
      tags: ['Kotlin', 'MVVM', 'Compose', 'Room', 'Retrofit', 'Play Console'],
    },
    {
      role: 'Android Developer Intern', at: 'Bijnis · New Delhi', when: 'September 2022 – August 2023',
      points: [
        'Built & maintained native Android app using Java & Kotlin',
        'Led the Java → Kotlin migration of entire codebase',
        'Integrated RESTful APIs via Retrofit, OkHttp & Gson',
        'User analytics with Segment & CleverTap integrations',
        'Wrote JUnit tests; participated in Agile sprints',
        'Code reviews, bug fixing & performance improvements',
      ],
      tags: ['Java', 'Kotlin', 'Retrofit', 'OkHttp', 'JUnit', 'Agile'],
    },
  ],
  skills: [
    ['Programming Languages', [['Kotlin', 92, '#AF52DE'], ['Java', 88, '#FF9500']]],
    ['Android', [['Jetpack Compose', 85, '#34C759'], ['MVVM + Jetpack', 87, '#007AFF'], ['Retrofit / APIs', 84, '#5AC8FA'], ['Room / SQLite', 80, '#FF3B30'], ['Firebase', 76, '#FF9500']]],
  ],
  tools: [['Android Studio', 'IDE'], ['Git / GitHub / Bitbucket', 'VCS'], ['Gradle', 'Build'], ['Jira / Agile / Scrum', 'PM'], ['Gson / OkHttp', 'Network'], ['Segment / CleverTap', 'Analytics'], ['JUnit', 'Testing']],
  degrees: [
    ['B Level · PGDCA (MCA equiv.)', 'NIELIT — Computer Software Engineering', 'January 2025 – Present'],
    ['A Level · ADCA (BCA equiv.)', 'NIELIT — Computer Science', 'June 2023 – July 2024'],
    ['B.A. Programme', 'Indira Gandhi National Open University', 'IGNOU'],
  ],
  certs: [['SRE Fundamentals with Google', 'Uplimit · Verified Certificate', 'November 2025', 'https://credential.net/9daf46fb-2d1e-46f8-a886-6ef701cb2abf']],
};

/* ── OUTPUT ──────────────────────────────────────────────── */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const link = (href, text) => `<a href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${esc(text)}</a>`;
const PROMPT = line.querySelector('.prompt').innerHTML;
function print(html = '', cls = '') {
  const d = document.createElement('div');
  d.innerHTML = html;
  if (cls) d.className = cls;
  out.append(d);
}
const toBottom = () => { term.scrollTop = term.scrollHeight; };
const stamp = d => `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.toLocaleDateString('en-US', { month: 'short' })} ${String(d.getDate()).padStart(2)} ${d.toLocaleTimeString('en-GB')}`;

// Back to the iPhone portfolio: step back if we came from it (keeps it unlocked), else load it
const home = () => { if (document.referrer.startsWith(location.origin) && history.length > 1) history.back(); else location.href = './'; };

/* ── COMMANDS ────────────────────────────────────────────── */
const FILES = { 'about.txt': 'about', 'contact.txt': 'contact', 'education.txt': 'education', 'experience.txt': 'experience', 'resume.pdf': 'resume', 'skills.txt': 'skills' };
const TARGETS = {
  ...Object.fromEntries(Object.entries(ME.links).map(([k, v]) => [k, v[2]])),
  email: ME.email[1], phone: ME.phone[1], resume: ME.resume.url,
};

// neofetch's Android logo
const ART = [
  '         -o          o-',
  '          +hydNNNNdyh+',
  '        +mMMMMMMMMMMMMm+',
  '      `dMMm:NMMMMMMN:mMMd`',
  '      hMMMMMMMMMMMMMMMMMMh',
  '  ..  yyyyyyyyyyyyyyyyyyyy  ..',
  '.mMMm`MMMMMMMMMMMMMMMMMMMM`mMMm.',
  ':MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:',
  ':MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:',
  ':MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:',
  ':MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:',
  '-MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM-',
  ' +yy+ MMMMMMMMMMMMMMMMMMMM +yy+',
  '      mMMMMMMMMMMMMMMMMMMm',
  '      `/++MMMMh++hMMMM++/`',
  '          MMMMo  oMMMM',
  '          MMMMo  oMMMM',
  '          oNMm-  -mMNs',
].join('\n');

function neofetch() {
  const job = ME.jobs[0], [langs, android] = ME.skills;
  const swatches = cols => cols.map(c => `<span class="swatch" style="background:${c}"></span>`).join('');
  const info = [
    '<b class="g">kuldeep</b>@<b class="g">portfolio</b>',
    '-----------------',
    ...[
      ['Name', esc(ME.name)],
      ['Role', esc(ME.role)],
      ['Location', esc(ME.location)],
      ['Current', `${esc(job.role)} @ ${esc(job.at.split(' · ')[0])}`],
      ['Experience', `${ME.stats[0][0]} years · ${ME.stats[1][0]} companies`],
      ['Languages', esc(langs[1].map(s => s[0]).join(', '))],
      ['Android', esc(android[1].map(s => s[0]).join(', '))],
      ['Education', esc(`${ME.degrees[0][0]}, NIELIT`)],
      ['Email', link(ME.email[1], ME.email[0])],
      ['Shell', 'zsh 5.9'],
      ['Bugs Fixed', '∞'],
    ].map(([k, v]) => `<b class="g">${k}</b>: ${v}`),
    '',
    swatches(['#3b3b40', '#ff5c57', '#5af78e', '#f3f99d', '#57c7ff', '#ff6ac1', '#9aedfe', '#e7e7ea']),
    swatches(['#686868', '#ff7b72', '#7ee787', '#ffe27a', '#79c0ff', '#ff9bd2', '#b3f0ff', '#ffffff']),
  ];
  print(`<div class="nf"><pre class="art">${esc(ART)}</pre><div class="info">${info.map(l => `<div>${l}</div>`).join('')}</div></div>`);
}

function help() {
  print('Available commands:');
  Object.entries(CMDS).forEach(([k, [desc]]) => { if (desc) print(`  <b class="g">${k.padEnd(12)}</b>${esc(desc)}`); });
  print();
  print('<span class="d">Tip: ↑/↓ recall history · Tab completes · Ctrl+L clears · Ctrl+C cancels</span>');
}

function about() {
  print(`<b class="g">${esc(ME.name)}</b>`);
  print(`${esc(ME.role)} <span class="d">·</span> ${esc(ME.location)}`);
  print();
  print(esc(ME.bio));
  print();
  print(ME.stats.map(([n, label]) => `<b class="y">${esc(n)}</b> ${esc(label)}`).join('    '));
}

function experience() {
  ME.jobs.forEach((j, i) => {
    if (i) print();
    print(`<b class="g">${esc(j.role)}</b>`);
    print(`<span class="b">${esc(j.at)}</span> <span class="d">· ${esc(j.when)}</span>`);
    j.points.forEach(p => print(`<span class="d">›</span> ${esc(p)}`, 'hang'));
    if (j.tags.length) print(`  <span class="m">${j.tags.map(esc).join(' · ')}</span>`);
  });
}

function skills() {
  ME.skills.forEach(([group, list], i) => {
    if (i) print();
    print(`<b class="y">${esc(group)}</b>`);
    list.forEach(([name, v, color]) => {
      const n = Math.round(v / 5);
      print(`  ${esc(name.padEnd(18))}<span style="color:${color}">${'█'.repeat(n)}</span><span class="d">${'░'.repeat(20 - n)}</span>`);
    });
  });
  print();
  print('<b class="y">Tools &amp; Workflow</b>');
  ME.tools.forEach(([name, tag]) => print(`  ${esc(name.padEnd(28))}<span class="c">${esc(tag)}</span>`));
}

function education() {
  print('<b class="y">Degrees</b>');
  ME.degrees.forEach(([deg, school, when]) => {
    print(`  <b class="g">${esc(deg)}</b>`);
    print(`    ${esc(school)} <span class="d">· ${esc(when)}</span>`);
  });
  print();
  print('<b class="y">Certifications</b>');
  ME.certs.forEach(([name, by, when, url]) => {
    print(`  <b class="g">${esc(name)}</b>`);
    print(`    ${esc(by)} <span class="d">· ${esc(when)}</span>`);
    print(`    ${link(url, url)}`);
  });
}

function contact() {
  [['Phone', link(ME.phone[1], ME.phone[0])], ['Email', link(ME.email[1], ME.email[0])], ...Object.values(ME.links).map(([k, h, url]) => [k, link(url, h)])]
    .forEach(([k, v]) => print(`  <b class="g">${k.padEnd(10)}</b>${v}`));
  print();
  print('<span class="d">Tip: open linkedin · open github · open email</span>');
}

function resume() {
  const r = ME.resume;
  print(`<b class="g">${esc(r.file)}</b>  <span class="d">${esc(r.title)} · ${esc(r.note)}</span>`);
  print(`Opening ${link(r.url, r.url)}`);
  window.open(r.url, '_blank', 'noopener');
}

function open(arg = '') {
  const url = TARGETS[arg.toLowerCase().replace(/\.(pdf|txt)$/, '')];
  if (!url) return print(arg ? `The file /Users/kuldeep/${esc(arg)} does not exist.` : `usage: open &lt;${Object.keys(TARGETS).join('|')}&gt;`);
  print(`<span class="d">Opening</span> ${link(url, url.replace(/^(mailto|tel):/, ''))}`);
  if (/^https?:/.test(url)) window.open(url, '_blank', 'noopener'); else location.href = url;
}

function cat(arg) {
  if (!arg) return;
  const cmd = FILES[arg] || FILES[`${arg}.txt`];
  if (!cmd) return print(`cat: ${esc(arg)}: No such file or directory`);
  if (cmd === 'resume') return print('<span class="d">resume.pdf is a PDF — try: open resume.pdf</span>');
  CMDS[cmd][1]();
}

function exit() {
  ['logout', '', 'Saving session...', '...copying shared history...', '...saving history...truncating history files...', '...completed.', '', '[Process completed]'].forEach(l => print(esc(l)));
  locked = true;
  line.hidden = true;
  input.blur();
  setTimeout(home, RM ? 0 : 900);
}

// [description (listed in help), handler]; entries without a description are hidden aliases
const CMDS = {
  help: ['List available commands', help],
  neofetch: ['Profile summary', neofetch],
  about: ['Bio, role and quick stats', about],
  experience: ['Work history', experience],
  skills: ['Languages, Android and tools', skills],
  education: ['Degrees and certification', education],
  contact: ['Phone, email and social links', contact],
  resume: ['Open my resume (PDF)', resume],
  open: [`open <${Object.keys(TARGETS).join('|')}>`, open],
  ls: ['List files', () => print(Object.keys(FILES).map(f => (f.endsWith('.pdf') ? `<span class="r">${f}</span>` : f)).join('    '))],
  cat: ['Print a file, e.g. cat skills.txt', cat],
  history: ['Show command history', () => hist.forEach((h, i) => print(`${String(i + 1).padStart(5)}  ${esc(h)}`))],
  clear: ['Clear the screen', () => { out.innerHTML = ''; }],
  exit: ['Back to the iPhone portfolio', exit],
  whoami: ['', about], work: ['', experience], exp: ['', experience], edu: ['', education], cv: ['', resume],
  socials: ['', contact], links: ['', contact], man: ['', help], cls: ['', () => CMDS.clear[1]()], gui: ['', exit], iphone: ['', exit],
  pwd: ['', () => print('/Users/kuldeep')],
  echo: ['', (_, rest) => print(esc(rest))],
  date: ['', () => print(esc(`${stamp(new Date())} ${new Date().getFullYear()}`))],
  sudo: ['', () => print('kuldeep is not in the sudoers file.  This incident will be reported.')],
  cd: ['', arg => { if (arg && !['~', '.', '/Users/kuldeep'].includes(arg)) print(`cd: no such file or directory: ${esc(arg)}`); }],
};

/* ── PROMPT & INPUT ──────────────────────────────────────── */
let hist = [], hIdx = 0, draft = '', locked = false, typing = 0, typingText = '';
try { hist = JSON.parse(localStorage.getItem('kt-history')) || []; } catch { /* private mode */ }
hIdx = hist.length;

function render() {
  const v = input.value, i = input.selectionStart ?? v.length;
  before.textContent = v.slice(0, i);
  cur.textContent = v[i] || ' ';
  after.textContent = v.slice(i + 1);
}
function setInput(v) { input.value = v; input.setSelectionRange(v.length, v.length); render(); }

function submit() {
  const raw = input.value, text = raw.trim();
  print(PROMPT + esc(raw));
  setInput('');
  if (text) {
    if (hist.at(-1) !== text) hist = [...hist, text].slice(-100);
    try { localStorage.setItem('kt-history', JSON.stringify(hist)); } catch { /* private mode */ }
    const [name, ...args] = text.split(/\s+/), cmd = CMDS[name.toLowerCase()];
    if (cmd) cmd[1](args[0], text.slice(name.length).trim());
    else print(`zsh: command not found: ${esc(name)}`);
  }
  hIdx = hist.length;
  draft = '';
  toBottom();
}

function recall(step) {
  if (!hist.length) return;
  if (hIdx === hist.length) draft = input.value;
  hIdx = Math.min(hist.length, Math.max(0, hIdx + step));
  setInput(hIdx === hist.length ? draft : hist[hIdx]);
}

// Tab: complete a command, or a file / open target after `cat` / `open`
function complete() {
  const v = input.value, parts = v.split(' '), word = parts.at(-1).toLowerCase();
  const pool = parts.length === 1 ? Object.keys(CMDS).filter(k => CMDS[k][0]) : parts[0] === 'open' ? Object.keys(TARGETS) : Object.keys(FILES);
  const hits = pool.filter(k => k.startsWith(word));
  if (!hits.length) return;
  const common = hits.reduce((a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
  if (hits.length === 1) setInput([...parts.slice(0, -1), hits[0]].join(' ') + ' ');
  else if (common.length > word.length) setInput([...parts.slice(0, -1), common].join(' '));
  else { print(PROMPT + esc(v)); print(hits.join('  ')); toBottom(); }
}

input.addEventListener('keydown', e => {
  if (locked) return e.preventDefault();
  if (typing) { finishTyping(); if (e.key === 'Enter') return e.preventDefault(); }
  const k = e.key.toLowerCase();
  if (e.key === 'Enter') { e.preventDefault(); submit(); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); recall(e.key === 'ArrowUp' ? -1 : 1); }
  else if (e.key === 'Tab') { e.preventDefault(); complete(); }
  else if (e.ctrlKey && k === 'c' && !getSelection().toString()) { e.preventDefault(); print(`${PROMPT}${esc(input.value)}^C`); setInput(''); toBottom(); }
  else if (e.ctrlKey && k === 'l') { e.preventDefault(); CMDS.clear[1](); }
  else if (e.ctrlKey && k === 'u') { e.preventDefault(); setInput(''); }
  setTimeout(render); // after the browser moves the caret
});
input.addEventListener('input', render);
input.addEventListener('focus', () => { win.classList.remove('inactive'); render(); });
input.addEventListener('blur', () => win.classList.add('inactive'));
// Click anywhere to type — unless the visitor is selecting text to copy
term.addEventListener('click', () => { if (!locked && !getSelection().toString()) input.focus({ preventScroll: true }); });
$('#keys').addEventListener('click', e => {
  const b = e.target.closest('[data-cmd]');
  if (!b || locked) return;
  if (typing) finishTyping();
  setInput(b.dataset.cmd);
  submit();
});

// Auto-type a command (used once at start-up); any key finishes it instantly
function typeCommand(text) {
  typingText = text;
  if (RM) return finishTyping();
  let i = 0;
  typing = setInterval(() => { setInput(text.slice(0, ++i)); if (i >= text.length) finishTyping(); }, 75);
}
function finishTyping() { clearInterval(typing); typing = 0; setInput(typingText); submit(); }

/* ── WINDOW ──────────────────────────────────────────────── */
function size() {
  const probe = document.createElement('span');
  probe.textContent = 'M'.repeat(20);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  out.append(probe);
  const cw = probe.getBoundingClientRect().width / 20, cs = getComputedStyle(term);
  probe.remove();
  const cols = Math.floor((term.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / cw);
  const rows = Math.floor((term.clientHeight - parseFloat(cs.paddingTop)) / parseFloat(cs.lineHeight));
  title.textContent = `kuldeep — -zsh — ${cols}×${rows}`;
}
const zoom = () => win.classList.toggle('max');
$('#btnMax').addEventListener('click', zoom);
$('#bar').addEventListener('dblclick', e => { if (!e.target.closest('.light')) zoom(); });
$('#btnMin').addEventListener('click', () => { win.classList.add('min'); $('#dock').hidden = false; });
$('#dock').addEventListener('click', () => { win.classList.remove('min'); $('#dock').hidden = true; input.focus({ preventScroll: true }); });
$('#btnClose').addEventListener('click', () => { win.classList.add('closing'); setTimeout(home, RM ? 0 : 250); });
win.addEventListener('transitionend', e => { if (e.propertyName === 'width') size(); });
addEventListener('resize', size);
// Keep the prompt above the on-screen keyboard on phones
window.visualViewport?.addEventListener('resize', () => { $('.desk').style.height = `${visualViewport.height}px`; toBottom(); });

/* ── BOOT ────────────────────────────────────────────────── */
let last = null;
try { last = localStorage.getItem('kt-last'); localStorage.setItem('kt-last', new Date().toISOString()); } catch { /* private mode */ }
print(`Last login: ${esc(stamp(last ? new Date(last) : new Date()))} on ttys001`);
print(`Welcome to <b class="g">${esc(ME.name)}</b>'s terminal. Type <b class="y">help</b> to look around, or <b class="y">exit</b> to go back to the iPhone portfolio.`);
print();
win.classList.add('inactive');
input.focus({ preventScroll: true });
size();
document.fonts?.ready.then(size);
setTimeout(() => typeCommand('neofetch'), RM ? 0 : 600);
})();
