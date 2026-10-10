// The brief builder on /build: keeps the picked parts in the order they were picked, shows
// them on the pile with a rough price, keeps an unsent draft in this browser, opens
// ready-made from a link, and turns the whole thing into an email from the visitor (or text
// to copy, or a link to send a partner first).
import { estimate, isPartId, priceRange } from '../data/parts';

type Pick = { id: string; name: string; color: string; ink: string; print: string };
type Scene = {
  update(picks: Pick[]): void;
  cheer(): void;
  snapshot(title: string, parts: { name: string; color: string }[], footer: string): Promise<Blob | null>;
};

const form = document.getElementById('brief') as HTMLFormElement | null;
const stage = document.getElementById('build-stage');
if (form) {
  const words = JSON.parse(document.getElementById('brief-words')!.textContent!) as Record<string, string> & { lang: 'en' | 'es' };
  const boxes = [...form.querySelectorAll<HTMLInputElement>('input[name="part"]')];
  const about = form.querySelector<HTMLTextAreaElement>('textarea[name="about"]')!;
  const name = form.querySelector<HTMLInputElement>('input[name="name"]')!;
  const note = form.querySelector<HTMLElement>('[data-note]')!;
  /** The same message beside the parts, where a visitor who pressed Send in the sidebar will see it. */
  const partsNote = form.querySelector<HTMLElement>('[data-note-parts]');
  const count = document.querySelector<HTMLElement>('[data-count]')!;
  const list = document.querySelector<HTMLElement>('[data-list]')!;
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  const range = document.querySelector<HTMLElement>('[data-range]');
  const rangeNote = document.querySelector<HTMLElement>('[data-range-note]');
  const lotNote = document.querySelector<HTMLElement>('[data-lot-note]');
  const KEY = 'bricks:brief';
  let order: string[] = [];
  /** Text this page wrote into the description (a "something like X" link). A later link may
   *  replace it; anything the visitor typed, it leaves alone. */
  let prefill = '';
  /** The project that line names, so it can be lettered again in this page's language. */
  let likeName = '';
  /** The lot built on the home page, as its #lot= code, when the brief started there. */
  let lot = '';
  let scene: Scene | null = null;

  const pick = (id: string): Pick => {
    const box = boxes.find((b) => b.dataset.id === id)!;
    return { id, name: box.value, color: box.dataset.color!, ink: box.dataset.ink!, print: box.dataset.print! };
  };
  const chosen = (group: string) => form.querySelector<HTMLInputElement>(`input[name="${group}"]:checked`);
  const choose = (group: string, id: unknown) => {
    const radio = typeof id === 'string' && [...form.querySelectorAll<HTMLInputElement>(`input[name="${group}"]`)].find((r) => r.dataset.id === id);
    if (radio) radio.checked = true;
  };
  const setParts = (ids: string[]) => {
    order = [...new Set(ids)].filter((id) => boxes.some((b) => b.dataset.id === id));
    for (const b of boxes) b.checked = order.includes(b.dataset.id!);
  };
  const lotUrl = () => `${location.origin}${words.home}#lot=${lot}`;

  // An unsent draft from an earlier visit comes back.
  try {
    const draft = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (draft) {
      setParts(Array.isArray(draft.order) ? draft.order : []);
      choose('stage', draft.stage);
      choose('when', draft.when);
      about.value = draft.about ?? '';
      name.value = draft.name ?? '';
      prefill = draft.prefill ?? '';
      likeName = draft.like ?? '';
      lot = typeof draft.lot === 'string' ? draft.lot : '';
      // The line the page wrote follows the page's language; one the visitor edited stays as it is.
      if (likeName && about.value === prefill) about.value = prefill = words.like.replace('{x}', () => likeName);
    }
  } catch { /* no saved draft, or storage is blocked: start fresh */ }

  // A link can open the brief ready-made, and what it says wins over the draft. The site's own
  // links put it in the query (?parts=website,store&stage=idea&when=month&like=Plazuela&lot=…);
  // a brief sent to a partner puts it in the #fragment, which can also carry what was written,
  // and which browsers never send to the server.
  const query = new URLSearchParams(location.search);
  const frag = new URLSearchParams(location.hash.slice(1));
  const KEYS = ['parts', 'stage', 'when', 'about', 'like', 'lot'];
  const param = (k: string) => frag.get(k) ?? query.get(k);
  const fromPartner = KEYS.some((k) => frag.has(k));
  if (fromPartner || KEYS.some((k) => query.has(k))) {
    const listed = param('parts');
    if (listed !== null) setParts(listed.split(',').map((s) => s.trim()).filter(isPartId));
    choose('stage', param('stage'));
    choose('when', param('when'));
    const written = frag.get('about');
    if (written !== null) {
      about.value = written;
      prefill = likeName = '';
    }
    const like = param('like');
    if (like && (!about.value || about.value === prefill)) {
      about.value = prefill = words.like.replace('{x}', () => like);
      likeName = like;
    }
    const code = param('lot');
    if (code !== null && /^[\w-]*$/.test(code)) lot = code;
    if (fromPartner) document.querySelector<HTMLElement>('[data-shared]')?.removeAttribute('hidden');
    // It's in the draft now, so a reload keeps any changes rather than reapplying the link.
    history.replaceState(history.state, '', location.pathname);
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        order, stage: chosen('stage')?.dataset.id, when: chosen('when')?.dataset.id, about: about.value, name: name.value,
        prefill: about.value === prefill ? prefill : '', like: about.value === prefill ? likeName : '', lot,
      }));
    } catch { /* fine: the draft just won't outlive the page */ }
  }

  /** The rough price for what's picked, as the sidebar shows it and the email repeats it. */
  const rough = () => {
    if (!order.length) return null;
    const e = estimate(order);
    return { ...e, text: priceRange(e.from, e.to, words.lang) };
  };

  function render() {
    const picks = order.map(pick);
    count.textContent = picks.length === 0 ? words.none : picks.length === 1 ? words.one : words.many.replace('{n}', String(picks.length));
    list.replaceChildren(...picks.map((p) => {
      const li = document.createElement('li');
      const brick = document.createElement('span');
      brick.className = 'brick';
      brick.style.setProperty('--c', p.color);
      li.append(brick, p.name);
      return li;
    }));
    if (empty) empty.hidden = picks.length > 0;
    const r = rough();
    if (range) range.textContent = r ? r.text : '';
    if (rangeNote) {
      rangeNote.textContent = r
        ? words.roughNote.replace('{low}', String(r.low)).replace('{high}', String(r.high)).replace('{rate}', words.rate)
        : words.roughNone;
    }
    if (lotNote) {
      lotNote.hidden = !lot;
      lotNote.querySelector<HTMLAnchorElement>('[data-lot-link]')!.href = lotUrl();
    }
    scene?.update(picks);
    save();
  }

  form.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.name === 'part') {
      const id = input.dataset.id!;
      order = input.checked ? [...order.filter((x) => x !== id), id] : order.filter((x) => x !== id);
      note.textContent = '';
      note.classList.remove('is-error');
      if (partsNote) partsNote.textContent = '';
    }
    render();
  });
  form.addEventListener('input', save);

  function compose() {
    const picks = order.map(pick);
    const lines = [words.greeting, '', words.intro, ''];
    if (picks.length) lines.push(`${words.parts}: ${picks.map((p) => p.name).join(', ')}`);
    const r = rough();
    if (r) lines.push(words.roughLine.replace('{range}', r.text));
    const s = chosen('stage')?.value, w = chosen('when')?.value;
    if (s) lines.push(`${words.stage}: ${s}`);
    if (w) lines.push(`${words.when}: ${w}`);
    if (lot) lines.push(words.lotLine.replace('{url}', lotUrl()));
    if (about.value.trim()) lines.push('', `${words.about}:`, about.value.trim());
    if (name.value.trim()) lines.push('', name.value.trim());
    const subject = picks.length ? `${words.subject}: ${picks.map((p) => p.name).join(', ')}` : words.subject;
    return { subject, body: lines.join('\n') };
  }
  const ready = () => {
    if (order.length || about.value.trim()) return true;
    note.textContent = words.error;
    note.classList.add('is-error');
    if (partsNote) partsNote.textContent = words.error;
    boxes[0].focus();
    return false;
  };
  const say = (text: string) => {
    note.textContent = text;
    note.classList.remove('is-error');
  };
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ready()) return;
    const { subject, body } = compose();
    location.href = `mailto:${words.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say(words.opened);
    scene?.cheer();
    import('./rain2d').then((m) => m.rain(28));
  });

  // A picture of the pile, to attach: there is no attaching from a mailto link.
  const picture = form.querySelector<HTMLButtonElement>('[data-save-brief]');
  picture?.addEventListener('click', async () => {
    if (!scene) return;
    const blob = await scene.snapshot(words.picture, order.map(pick), 'chrisrosso.dev');
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: words.file });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say(words.saved);
  });

  form.querySelector('[data-copy-brief]')?.addEventListener('click', async () => {
    if (!ready()) return;
    const { subject, body } = compose();
    await copy(`${subject}\n\n${body}`);
    say(words.copied);
    scene?.cheer();
  });

  // The whole brief as a link, for whoever else has a say: on a phone through the share sheet,
  // elsewhere copied. Their name stays out of it: whoever sends it signs it.
  form.querySelector('[data-share-brief]')?.addEventListener('click', async () => {
    if (!ready()) return;
    const p = new URLSearchParams();
    if (order.length) p.set('parts', order.join(','));
    const s = chosen('stage')?.dataset.id, w = chosen('when')?.dataset.id;
    if (s) p.set('stage', s);
    if (w) p.set('when', w);
    if (about.value.trim()) p.set('about', about.value.trim());
    if (lot) p.set('lot', lot);
    const url = `${location.origin}${location.pathname}#${String(p).replace(/%2C/g, ',')}`;
    if (navigator.share && matchMedia('(hover: none)').matches) {
      try {
        await navigator.share({ title: words.shareTitle, text: words.shareText, url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    await copy(url);
    say(words.shared);
  });

  render();

  // The pile is three.js: it loads once the browser is idle, so the form never waits for it.
  if (stage) {
    const load = () => import('./build-scene').then(({ mount }) => {
      scene = mount(stage, (id) => {
        const box = boxes.find((b) => b.dataset.id === id);
        if (box) box.checked = false;
        order = order.filter((x) => x !== id);
        render();
      });
      scene?.update(order.map(pick));
      if (scene && picture) picture.hidden = false;
    });
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 });
    else setTimeout(load, 200);
  }
}
