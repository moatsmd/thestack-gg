'use client'

/* Native images are intentional: previews include local blobs and generated SVG data. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react'
import { BACKS, backDataUrl } from '@/lib/proxy-backs'
import { CardMap, FaceMode, isDoubleFaced, manifestCsv, normalizedList, parseDeck, physicalCount, reviewCards, selectEntries } from '@/lib/proxy-deck'
import { dollars, estimatePrinting, PRICE_CHECKED, PROVIDERS, ProviderId } from '@/lib/proxy-providers'
import s from './ProxyWorkshop.module.css'

const STORAGE = 'thestack-proxy-workshop-v1'
const SAMPLE = 'Commander\n1 Aesi, Tyrant of Gyre Strait\n\nDeck\n1 Sol Ring\n1 Arcane Signet\n1 Command Tower\n1 Cultivate\n1 Kodama\'s Reach\n1 Growth Spiral\n1 Beast Within\n1 Counterspell\n1 Negate\n1 Delver of Secrets\n1 Bala Ged Recovery // Bala Ged Sanctuary\n1 Fire // Ice\n12 Forest\n12 Island\n\nSideboard\n1 Nature\'s Claim'
type Settings = { sideboard: boolean; maybeboard: boolean; basics: boolean; copies: number; back: string; faces: FaceMode; provider: ProviderId }
const DEFAULTS: Settings = { sideboard: false, maybeboard: false, basics: true, copies: 1, back: 'obsidian', faces: 'reverse', provider: 'printmtg' }
const download = (name: string, body: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function SectionTitle({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className={s.sectionTitle}><span>{number}</span><div><h2>{title}</h2><p>{detail}</p></div></div>
}
function External({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>
}

export function ProxyWorkshop() {
  const [text, setText] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [ready, setReady] = useState(false)
  const [saveState, setSaveState] = useState('Draft stays in this browser')
  const [cards, setCards] = useState<CardMap>({})
  const [reviewed, setReviewed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [custom, setCustom] = useState<{ url: string; name: string; width: number; height: number; file: File } | null>(null)
  const [quotes, setQuotes] = useState<Record<string, { shipping: string; tax: string; printing: string }>>({})
  const controller = useRef<AbortController | null>(null)
  const importVersion = useRef(0)
  const customVersion = useRef(0)
  const deck = useMemo(() => parseDeck(text), [text])
  const entries = useMemo(() => selectEntries(deck.entries, settings.sideboard, settings.maybeboard, settings.basics), [deck.entries, settings.sideboard, settings.maybeboard, settings.basics])
  const count = physicalCount(entries, cards, settings.faces, settings.copies)
  const logicalCount = entries.reduce((sum, e) => sum + e.quantity, 0) * settings.copies
  const unmatched = entries.filter(e => !cards[e.key])
  const dfcCount = entries.filter(e => isDoubleFaced(cards[e.key])).reduce((sum, e) => sum + e.quantity, 0) * settings.copies
  const backName = settings.back === 'custom' ? custom?.name || 'Custom back (upload again)' : BACKS.find(b => b.id === settings.back)!.name
  const backUrl = settings.back === 'custom' ? custom?.url : backDataUrl(settings.back)
  const provider = PROVIDERS.find(p => p.id === settings.provider)!
  const valid = entries.length > 0 && deck.issues.length === 0 && count <= 10000
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(current => ({ ...current, [key]: value }))
  const updateText = (value: string) => {
    importVersion.current += 1
    controller.current?.abort(); setBusy(false); setCards({}); setReviewed(false); setProgress(0); setError(''); setMessage(''); setText(value)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) {
        const saved = JSON.parse(raw)
        if (typeof saved.text === 'string' && saved.text.length <= 100000) setText(saved.text)
        const p = saved.settings || {}
        setSettings({ sideboard: p.sideboard === true, maybeboard: p.maybeboard === true, basics: p.basics !== false,
          copies: Number.isInteger(p.copies) && p.copies >= 1 && p.copies <= 5 ? p.copies : 1,
          back: BACKS.some(b => b.id === p.back) ? p.back : 'obsidian', faces: p.faces === 'separate' ? 'separate' : 'reverse',
          provider: PROVIDERS.some(x => x.id === p.provider) ? p.provider : 'printmtg' })
        setSaveState('Draft restored · review names again before ordering')
      }
    } catch { setSaveState('Browser storage unavailable · download your plan to keep it') }
    setReady(true)
    return () => { controller.current?.abort(); importVersion.current += 1; customVersion.current += 1 }
  }, [])
  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE, JSON.stringify({ text, settings: { ...settings, back: settings.back === 'custom' ? 'obsidian' : settings.back } })); setSaveState('Draft saved in this browser · uploaded images are not saved') }
      catch { setSaveState('Could not save locally · download your plan to keep it') }
    }, 450)
    return () => clearTimeout(timer)
  }, [text, settings, ready])
  useEffect(() => () => { if (custom) URL.revokeObjectURL(custom.url) }, [custom])
  useEffect(() => { setQuotes({}) }, [count, settings.back, settings.faces])
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 8000)
    return () => clearTimeout(timer)
  }, [message])

  async function review() {
    controller.current?.abort()
    const abort = new AbortController(); controller.current = abort
    setBusy(true); setError(''); setProgress(0)
    const timeout = setTimeout(() => abort.abort('timeout'), 45000)
    try {
      const result = await reviewCards(deck.entries, abort.signal, setProgress)
      if (abort.signal.aborted) return
      setCards(result); setReviewed(true); setMessage('Card review finished. Check the review list for anything that needs attention.')
    } catch {
      if (abort.signal.reason === 'timeout') setError('Card lookup timed out. Your list is safe; try again.')
      else if (!abort.signal.aborted) setError('Could not reach Scryfall. Your list is safe; try again shortly.')
    } finally { clearTimeout(timeout); if (controller.current === abort) setBusy(false) }
  }
  async function importFile(file?: File) {
    if (!file) return
    if (file.size > 100000 || !/\.(txt|dec|dek)$/i.test(file.name)) { setError('Choose a plain-text .txt, .dec, or .dek deck list under 100 KB.'); return }
    const version = ++importVersion.current
    try { const value = await file.text(); if (version === importVersion.current) updateText(value) }
    catch { setError('This file could not be read. You can paste the list instead.') }
  }
  async function uploadBack(file?: File) {
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Choose a PNG or JPEG back under 8 MB.'); return }
    const version = ++customVersion.current
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      if (version !== customVersion.current) { URL.revokeObjectURL(url); return }
      setCustom({ url, name: file.name, width: img.naturalWidth, height: img.naturalHeight, file }); set('back', 'custom'); setError('')
    }
    img.onerror = () => { URL.revokeObjectURL(url); setError('This image could not be opened. Try another PNG or JPEG.') }
    img.src = url
  }
  async function downloadBack() {
    if (settings.back === 'custom' && custom) { download(custom.name, custom.file, custom.file.type); return }
    try {
      const img = new Image(); img.src = backDataUrl(settings.back); await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = 1500; canvas.height = 2100
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas')
      ctx.drawImage(img, 0, 0, 1500, 2100)
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('image')
      download(`thestack-${settings.back}-back.png`, blob, 'image/png')
      setMessage('Back artwork downloaded. Fit it to your printer’s bleed template before ordering.')
    } catch { setError('Could not export the back image. Please try again in another browser.') }
  }
  const list = normalizedList(entries, settings.copies)
  const quote = quotes[settings.provider] || { printing: '', shipping: '', tax: '' }
  const parseMoney = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 100000 ? Math.round(Number(value) * 100) : null
  const printing = settings.provider === 'mpc' ? parseMoney(quote.printing) : estimatePrinting(settings.provider, count)
  const shipping = parseMoney(quote.shipping), tax = parseMoney(quote.tax)
  const total = printing !== null && shipping !== null && tax !== null ? printing + shipping + tax : null
  function downloadPlan() {
    const data = { version: 1, createdAt: new Date().toISOString(), destination: 'United States', currency: 'USD', provider: provider.name,
      physicalCards: count, deckCopies: settings.copies, back: backName, doubleFaceMode: settings.faces,
      unverifiedNames: unmatched.map(e => e.name), importIssues: deck.issues, pricesChecked: PRICE_CHECKED,
      estimateCents: { printing, shipping, tax, total }, source: provider.source,
      notes: ['Setup plan only; not a completed order or print-ready front-image package.', 'Set versions and backs must be selected again in the provider. Confirm all proofs before paying.', ...provider.caveats],
      steps: provider.steps, deckList: list,
      frontBackChecklistCsv: manifestCsv(entries, cards, settings.faces, settings.copies, backName) }
    download('thestack-proxy-plan.json', JSON.stringify(data, null, 2), 'application/json')
    setMessage('Setup plan downloaded.')
  }

  return <div className={s.workshop}>
    <header className={s.hero}>
      <div><p className={s.eyebrow}>The Stack / Workshop No. 01</p><h1>Good decks.<br /><em>Made tangible.</em></h1><p className={s.intro}>From a deck idea to a table-ready plan. Check your list, find your finish, and know what you’re ordering.</p>
        <div className={s.heroMeta}><span>PROXY WORKSHOP</span><span>United States · USD</span><span>Early access</span></div>
        <a className={s.startLink} href="#deck">Prepare your deck <span aria-hidden="true">↓</span></a>
      </div>
      <div className={s.heroArt} aria-hidden="true"><img src={backDataUrl('verdant')} alt="" /><img src={backDataUrl('vellum')} alt="" /><img src={backDataUrl('obsidian')} alt="" /><span>YOUR NEXT GAME, IN THE MAKING</span></div>
    </header>
    <nav className={s.steps} aria-label="Workshop steps">{[['deck', '01', 'Your list'], ['backs', '02', 'The reverse'], ['printers', '03', 'The printer'], ['handoff', '04', 'Ready to order']].map(([id, num, label]) => <a key={id} href={`#${id}`}><span>{num}</span>{label}</a>)}</nav>

    <section id="deck" className={s.section}>
      <SectionTitle number="01" title="Start with your list" detail="Paste an export from your deck builder. Quantities, sections, and set numbers are welcome." />
      <div className={s.deckGrid}>
        <div><label className={s.label} htmlFor="deck-list">Deck list</label><textarea id="deck-list" spellCheck={false} maxLength={100000} value={text} onChange={e => updateText(e.target.value)} placeholder={'Commander\n1 Aesi, Tyrant of Gyre Strait\n\nDeck\n1 Sol Ring (CMM) 410\n12 Forest\n12 Island'} />
          <div className={s.actions}><label className={s.fileButton}>Import text file<input type="file" accept=".txt,.dec,.dek,text/plain" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = '' }} /></label><button onClick={() => updateText(SAMPLE)}>Try a sample</button><button onClick={() => updateText('')} disabled={!text}>Clear list</button></div>
          <p className={s.small}>{saveState}. Paste text rather than a deck URL. Limits: 500 unique rows, 2,000 cards.</p>
          <div className={s.options}>
            <label><input type="checkbox" checked={settings.basics} onChange={e => set('basics', e.target.checked)} /> Print basic lands</label>
            <label><input type="checkbox" checked={settings.sideboard} onChange={e => set('sideboard', e.target.checked)} /> Include sideboard</label>
            <label><input type="checkbox" checked={settings.maybeboard} onChange={e => set('maybeboard', e.target.checked)} /> Include maybeboard</label>
            <label>Deck copies <select value={settings.copies} onChange={e => set('copies', Number(e.target.value))}>{[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></label>
          </div>
        </div>
        <div className={s.review}>
          <div className={s.reviewHeader}><div><span className={s.label}>ON THE WORKBENCH</span><strong>{logicalCount}<small>cards in your list</small></strong></div><span className={s.seal}>US<br /><small>USD</small></span></div>
          <div className={s.stats}><span><b>{entries.length}</b> unique rows</span><span><b>{dfcCount}</b> double-faced copies found</span></div>
          {deck.issues.length > 0 && <div className={s.warning} role="alert"><b>Fix {deck.issues.length} import issue{deck.issues.length !== 1 && 's'} to export.</b><ul>{deck.issues.slice(0, 8).map(issue => <li key={issue.line}>Line {issue.line}: {issue.message}</li>)}</ul>{deck.issues.length > 8 && <p>And {deck.issues.length - 8} more. Check the remaining lines.</p>}</div>}
          <button className={s.primary} disabled={!deck.entries.length || busy || deck.issues.length > 0} onClick={() => void review()}>{busy ? `Checking ${progress} / ${deck.entries.length}…` : reviewed ? 'Check card names again' : 'Check names & double faces'} <span aria-hidden="true">↗</span></button>
          <p className={s.small}>Checking sends card names or set numbers to Scryfall. It verifies identity, not a printer’s artwork availability. Token names and meld reverses may need manual selection.</p>
          <div className={s.cardList} aria-label="Card review">
            {!entries.length && <div className={s.empty}><span aria-hidden="true">◇</span><h3>A deck begins with an idea.</h3><p>Paste yours, or try the sample to explore the workshop.</p></div>}
            {entries.map(e => { const card = cards[e.key]; const double = isDoubleFaced(card); return <div className={s.cardRow} key={e.key}>
              <span className={s.quantity}>{e.quantity * settings.copies}</span><div><strong>{card?.name || e.name}</strong><small>{e.section}{e.set && ` · ${e.set.toUpperCase()} ${e.collector}`} · {card ? double ? 'Two faces verified' : card.layout === 'meld' ? 'Meld — check reverse manually' : 'Name verified' : reviewed ? 'Not found — check spelling / set' : 'Not checked'}</small></div>
              <span className={card ? s.verified : s.pending} aria-label={card ? 'Verified' : 'Needs review'}>{card ? '✓' : '·'}</span>
            </div> })}
          </div>
          {reviewed && unmatched.length > 0 && <p className={s.warning}>{unmatched.length} selected name{unmatched.length !== 1 && 's'} couldn’t be verified. Fix the list or resolve these in the printer’s builder. Counts may change.</p>}
        </div>
      </div>
    </section>

    <section id="backs" className={s.section}>
      <SectionTitle number="02" title="Make the reverse yours" detail="An original back for your playtest deck. Real reverse faces stay paired with their fronts." />
      <div className={s.backGrid}>
        <div><fieldset className={s.backChoices}><legend className={s.srOnly}>Card back design</legend>{BACKS.map(back => <label className={settings.back === back.id ? s.selectedBack : ''} key={back.id}><input type="radio" name="card-back" value={back.id} checked={settings.back === back.id} onChange={() => set('back', back.id)} /><img src={backDataUrl(back.id)} alt={`${back.name} geometric playtest card back`} /><strong>{back.name}</strong><small>{back.detail}</small></label>)}</fieldset>
          <div className={s.actions}><label className={s.fileButton}>Upload your own back<input type="file" accept="image/png,image/jpeg" onChange={e => { void uploadBack(e.target.files?.[0]); e.target.value = '' }} /></label>{custom && <button aria-pressed={settings.back === 'custom'} onClick={() => set('back', 'custom')}>Use {custom.name}</button>}</div>
          <p className={s.small}>PNG or JPEG, up to 8 MB. Uploaded images stay in this tab and need to be uploaded again after reloading.</p>
        </div>
        <div className={s.backDetails}><div className={s.chosenBack}>{backUrl && <img src={backUrl} alt="Selected card back preview" />}<div><p className={s.label}>SELECTED REVERSE</p><h3>{backName}</h3><p>{settings.back === 'custom' && custom ? `${custom.width} × ${custom.height} px · original file` : '1500 × 2100 px · original Stack artwork'}</p><button onClick={() => void downloadBack()}>Download back PNG{settings.back === 'custom' ? ' / original' : ''} ↓</button></div></div>
          {settings.back === 'custom' && custom && (custom.width < 822 || custom.height < 1122 || Math.abs(custom.width / custom.height - 63 / 88) > .04) && <p className={s.warning}>Check this image’s resolution and proportions. It may need resizing or extra bleed for a 63 × 88 mm card.</p>}
          <label className={s.label} htmlFor="face-mode">Double-faced cards</label><select id="face-mode" value={settings.faces} onChange={e => set('faces', e.target.value as FaceMode)}><option value="reverse">Keep the real reverse on the same card</option><option value="separate">Print each face as a separate card</option></select>
          <p>{settings.faces === 'reverse' ? 'Transform and modal double-faced cards use their actual reverse, overriding your selected back. Use opaque sleeves.' : 'Each verified double-faced card adds one extra physical card with your chosen back. Ask the printer to follow the manifest; a deck-list import alone will not do this.'}</p>
          <p className={s.small}>Artwork download, not a printer-specific template. Fit the image to the printer’s bleed and safe areas. Back choices here must be applied in the order builder.</p>
        </div>
      </div>
    </section>

    <section id="printers" className={s.section}>
      <SectionTitle number="03" title="Choose your route to the table" detail="Compare the work involved as well as the price. Estimates are for standard, non-foil cards." />
      <div className={s.comparisonMeta}><span><b>{count}</b> physical cards · United States · USD</span><span>Published prices checked {PRICE_CHECKED}</span></div>
      {unmatched.length > 0 && <p className={s.warning}>Provisional count: {unmatched.length} selected rows still need verification. Unrecognized double-faced cards can change the separate-face estimate.</p>}
      <fieldset className={s.providers}><legend className={s.srOnly}>Ordering provider</legend>{PROVIDERS.map(p => { const cost = estimatePrinting(p.id, count); return <div className={settings.provider === p.id ? s.selectedProvider : s.provider} key={p.id}>
        <label className={s.providerSelect}><input type="radio" name="provider" checked={settings.provider === p.id} onChange={() => set('provider', p.id)} /><span>{p.label}</span></label><h3>{p.name}</h3><div className={s.price}>{count && cost !== null ? dollars(cost) : p.id === 'mpc' ? 'Get a quote' : count ? 'Quote needed' : 'Add your list'}</div><p className={s.priceNote}>{cost !== null ? `${dollars(cost / count)} / card · printing only` : p.id === 'mpc' ? 'Stock + capacity + finish determine price' : 'Published tiers apply once a list is added'}</p><p>{p.description}</p><ul>{p.caveats.map(c => <li key={c}>{c}</li>)}</ul><External href={p.source}>Check pricing & options</External>
      </div> })}</fieldset>
      <div className={s.quoteBox}><div><h3>Finish the estimate</h3><p>Add the selected provider’s checkout figures for <b>{provider.name}</b>. Blank means unknown; enter 0 only if confirmed free.</p></div><div className={s.quoteInputs}>
        {(settings.provider === 'mpc' ? ['printing', 'shipping', 'tax'] as const : ['shipping', 'tax'] as const).map(field => <label key={field}>{field === 'printing' ? 'Printing quote' : field === 'tax' ? 'Tax / import fees' : 'Shipping'} (USD)<input type="text" inputMode="decimal" maxLength={10} placeholder="Not quoted" value={quote[field]} onChange={e => setQuotes(current => ({ ...current, [settings.provider]: { ...quote, [field]: e.target.value } }))} aria-invalid={!!quote[field] && parseMoney(quote[field]) === null} />{quote[field] && parseMoney(quote[field]) === null && <small>Use a positive USD amount, e.g. 8.50.</small>}</label>)}
      </div><div className={s.total}><small>{total === null ? 'ESTIMATED PRINTING' : 'ESTIMATED TOTAL'}</small><strong>{total !== null ? dollars(total) : printing !== null ? dollars(printing) : 'Quote needed'}</strong><span>{total === null ? '+ unquoted shipping / tax' : 'Confirm the final cart before paying'}</span></div></div>
      <p className={s.small}>Price tiers are snapshots, not live quotes. Promotions, upgrades, and availability may differ. No provider is ranked by a landed total until its checkout costs are known.</p>
    </section>

    <section id="handoff" className={s.section}>
      <SectionTitle number="04" title="Pack up your plan" detail="A clean list, a face-by-face checklist, and the next steps for your chosen printer." />
      <div className={s.handoffGrid}><div><p className={s.eyebrow}>YOUR ROUTE / {provider.name}</p><ol className={s.checklist}>{provider.steps.map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol><div className={s.actions}><External href={provider.url}>Open {provider.name}</External>{settings.provider === 'mpc' && <External href="https://mpcfill.com/">Open MPCFill art selector</External>}</div><p className={s.small}>MPCFill is an independent artwork/setup tool, not the printer. Select images there to generate its order XML.</p></div>
        <div className={s.receipt}><div className={s.receiptHeading}><h3>Workshop ticket</h3><span>US / USD</span></div><dl><div><dt>Physical cards</dt><dd>{count}</dd></div><div><dt>Deck copies</dt><dd>{settings.copies}</dd></div><div><dt>Back</dt><dd>{backName}</dd></div><div><dt>Unverified rows</dt><dd>{unmatched.length}</dd></div><div><dt>Printing estimate</dt><dd>{printing === null ? 'Quote needed' : dollars(printing)}</dd></div></dl>
          {deck.issues.length > 0 && <p className={s.warning}>Fix the import issues in step 1 to enable downloads.</p>}
          {unmatched.length > 0 && <p className={s.small}>Exports will include unverified names. Review them before ordering.</p>}
          <div className={s.downloads}><button className={s.primary} disabled={!valid} onClick={() => { download('thestack-deck.txt', list, 'text/plain'); setMessage('Deck list downloaded. Apply your back and face choices in the provider’s builder.') }}>Download deck list <span>TXT ↓</span></button><button disabled={!valid} onClick={() => { download('thestack-print-manifest.csv', manifestCsv(entries, cards, settings.faces, settings.copies, backName), 'text/csv;charset=utf-8'); setMessage('Front/back checklist downloaded.') }}>Front / back checklist <span>CSV ↓</span></button><button disabled={!valid} onClick={downloadPlan}>Save complete setup plan <span>JSON ↓</span></button></div><p className={s.small}>These files prepare your order. Front artwork, printer-ready layouts, and checkout are completed at your chosen provider.</p>
        </div></div>
    </section>
    <aside className={s.footnote}><span aria-hidden="true">◇</span><p><b>Made for the kitchen table.</b> Agree on proxies with your playgroup. These are clearly marked playtest backs. Check your event’s rules and your printer’s image-rights requirements before ordering. This workshop does not place orders or send your deck to a printer.</p></aside>
    <div className={s.feedback} aria-live="polite" role="status">{busy ? `Checking cards: ${progress} of ${deck.entries.length}` : message}</div>
    {error && <div className={s.error} role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
  </div>
}
