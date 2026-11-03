export const BACKS = [
  { id: 'obsidian', name: 'Obsidian', color: '#171b25', ink: '#d7b97a', detail: 'Midnight ink · warm brass' },
  { id: 'verdant', name: 'Verdant', color: '#183c35', ink: '#c9d4b1', detail: 'Forest green · pale silver' },
  { id: 'vellum', name: 'Vellum', color: '#e7d8b8', ink: '#51402e', detail: 'Aged paper · dark walnut' },
] as const
export function backSvg(id: string) {
  const back = BACKS.find(b => b.id === id) || BACKS[0]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="2100" viewBox="0 0 500 700">
  <rect width="500" height="700" fill="${back.color}"/>
  <g fill="none" stroke="${back.ink}"><rect x="34" y="34" width="432" height="632" rx="16" stroke-width="2"/><rect x="44" y="44" width="412" height="612" rx="10" opacity=".45"/>
  <path d="M250 90 425 350 250 610 75 350Z" opacity=".35"/><path d="m250 130 145 220-145 220L105 350Z" opacity=".35"/>
  <circle cx="250" cy="350" r="136" stroke-width="2"/><circle cx="250" cy="350" r="124" opacity=".4"/>
  <path d="m250 250 83 48v96l-83 48-83-48v-96Zm-83 48 83 48 83-48M250 346v96m-83-96 83 48 83-48" stroke-width="3"/>
  <path d="M225 88h50m-50 524h50M67 325v50m366-50v50" stroke-width="2"/>
  <circle cx="250" cy="180" r="4" fill="${back.ink}"/><circle cx="250" cy="520" r="4" fill="${back.ink}"/></g>
  <g fill="${back.ink}" font-family="Georgia,serif" text-anchor="middle"><text x="250" y="580" font-size="20" letter-spacing="5">THE STACK</text><text x="250" y="627" font-size="10" letter-spacing="4">PLAYTEST • NOT FOR SALE</text><text x="250" y="115" font-size="12" letter-spacing="6">PROXY</text></g></svg>`
}
export const backDataUrl = (id: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(backSvg(id))}`
