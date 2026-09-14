# Reference content review

Reviewed 2026-09-14 against the [Wizards Comprehensive Rules, effective August 7, 2026; download dated August 19](https://media.wizards.com/2026/downloads/MagicCompRules%2020260819.txt) and current Scryfall Oracle API responses. This is a targeted review of suspect definitions and token variants, not a claim that every rule in the reference has been exhaustively audited. The rules text was fetched successfully over HTTP; the web tool could not open that text URL.

## Material token corrections

Each row describes the exact variant that the existing entry should represent. Different tokens sharing a creature type must remain separate variants. Artifact creature type lines should read `Artifact Creature — Thopter` (and similarly Construct, Golem, Myr, Servo); `Artifact` is not a creature subtype.

| Existing entry | Correction | Oracle source |
| --- | --- | --- |
| Angel | 4/4 white, flying only. Keep Entreat the Angels; Emeria's Call instead makes Angel Warriors. | [Entreat](https://scryfall.com/card/dsc/99/entreat-the-angels), [Emeria](https://scryfall.com/card/znr/12/emerias-call-emeria-shattered-skyclave) |
| Merfolk (Blue) | Keep Lullmage Mentor only; Stonybrook Schoolmaster produces Merfolk Wizards. | [Lullmage](https://scryfall.com/card/zen/54/lullmage-mentor), [Schoolmaster](https://scryfall.com/card/mor/25/stonybrook-schoolmaster) |
| Thopter (Blue) | Blue 1/1 flying is valid, but its producer is Thopter Foundry. Move Sai and Thopter Spy Network to the colorless variant. | [Foundry](https://scryfall.com/card/2xm/222/thopter-foundry), [Sai](https://scryfall.com/card/cmm/118/sai-master-thopterist), [Network](https://scryfall.com/card/moc/241/thopter-spy-network) |
| Zombie | Remove Josu Vess; he produces the separately listed Zombie Knights with menace. | Existing separate Zombie Knight variant |
| Vampire (Black) | Change to 1/1 black Vampire Knight, lifelink only, from Call the Bloodline. Legion's Landing belongs to a separate white 1/1 Vampire with lifelink. Neither has flying. | [Call](https://scryfall.com/card/soi/103/call-the-bloodline), [Landing](https://scryfall.com/card/xln/22/legions-landing-adanto-the-first-fort) |
| Rat | Plain 1/1 black Rat: replace both producers with Chittering Witch. Rat Colony creates no token; Pack Rat creates a copy with its own variable stats and activated ability. | [Witch](https://scryfall.com/card/tdc/175/chittering-witch), [Pack Rat](https://scryfall.com/card/rtr/73/pack-rat) |
| Skeleton | 1/1 black with `{B}: Regenerate this token.`, from Skeletonize. Neither Ayara nor Skirsdag Flayer creates Skeletons. | [Skeletonize](https://scryfall.com/card/a25/149/skeletonize), [Ayara](https://scryfall.com/card/mom/90/ayara-widow-of-the-realm-ayara-furnace-queen), [Flayer](https://scryfall.com/card/dka/74/skirsdag-flayer) |
| Dragon | Keep 5/5 red flying from Dragonmaster Outcast only; Utvara Hellkite makes a separate 6/6 variant. | [Outcast](https://scryfall.com/card/tdc/211/dragonmaster-outcast), [Utvara](https://scryfall.com/card/rvr/129/utvara-hellkite) |
| Elemental (Red) | For the present 3/1 trample/haste variant: rename Spark Elemental, add end-step sacrifice, producer Sparkspitter. Omnath makes 5/5 red-green Elementals with no intrinsic abilities; Chandra, Torch of Defiance creates no creature tokens. | [Sparkspitter](https://scryfall.com/card/uma/149/sparkspitter), [Omnath](https://scryfall.com/card/ecc/129/omnath-locus-of-rage), [Chandra](https://scryfall.com/card/fra/244/chandra-torch-of-defiance) |
| Wolf | Remove Howlpack Piper; it does not create Wolves. | [Piper](https://scryfall.com/card/vow/205/howlpack-piper-wildsong-howler) |
| Faerie Rogue | Black only, not blue-black, for both listed creators. | [Bitterblossom](https://scryfall.com/card/2x2/69/bitterblossom), [Throng](https://scryfall.com/card/znc/33/notorious-throng) |
| Elf Warrior | Keep Rhys only. Voice of Resurgence creates a green-white Elemental with variable power/toughness. | [Rhys](https://scryfall.com/card/2xm/213/rhys-the-redeemed), [Voice](https://scryfall.com/card/2xm/227/voice-of-resurgence) |
| Human Soldier | Keep Elspeth, Sun's Nemesis. Move Gather the Townsfolk to the plain white Human entry. | [Elspeth](https://scryfall.com/card/thb/14/elspeth-suns-nemesis), [Gather](https://scryfall.com/card/inr/23/gather-the-townsfolk) |
| Construct | Base 0/0 with `This token gets +1/+1 for each artifact you control.` Keep Urza only; move Thopter Foundry to blue Thopter. | [Urza](https://scryfall.com/card/cmm/130/urza-lord-high-artificer) |
| Golem | Keep Precursor Golem only; Spine of Ish Sah makes none. | [Precursor](https://scryfall.com/card/mm2/225/precursor-golem), [Spine](https://scryfall.com/card/moc/383/spine-of-ish-sah) |
| Treasure | Remove Xorn from a simple creator list, or explicitly label its replacement effect: it increases Treasure creation and does not initiate it. | [Xorn](https://scryfall.com/card/afr/167/xorn) |
| Food | Remove The Cauldron of Eternity; it produces none. | [Cauldron](https://scryfall.com/card/eld/82/the-cauldron-of-eternity) |
| Map | Add `Activate only as a sorcery.` Replace all three listed producers with Restless Anchorage. Caparocti discovers; Oltec creates Gnomes; Ancient Imperiosaur creates none. | CR 111.10s; [Anchorage](https://scryfall.com/card/lci/280/restless-anchorage), [Caparocti](https://scryfall.com/card/lci/226/caparocti-sunborn), [Oltec](https://scryfall.com/card/lci/28/oltec-cloud-guard), [Imperiosaur](https://scryfall.com/card/mom/174/ancient-imperiosaur) |
| Powerstone | Keep Karn, Living Legacy only; Teferi, Temporal Pilgrim produces blue Spirit creatures. | [Karn](https://scryfall.com/card/dmu/1/karn-living-legacy), [Teferi](https://scryfall.com/card/bro/66/teferi-temporal-pilgrim) |
| Junk | Entire current ability and creators are incorrect. Tap and sacrifice to exile the top library card; may play it this turn; sorcery activation only. Use Dogmeat, Ever Loyal. Ob Nixilis makes Devils; Riveteers Charm makes no tokens. | CR 111.10t; [Wizards Fallout release notes](https://magic.wizards.com/en/news/feature/magic-the-gathering-fallout-release-notes) |
| Teferi Emblem | Existing instant-speed loyalty permission belongs to Teferi, Temporal Archmage. Hero of Dominaria instead exiles a target opposing permanent whenever you draw. | [Archmage](https://scryfall.com/card/cmm/125/teferi-temporal-archmage), [Hero](https://scryfall.com/card/dom/207/teferi-hero-of-dominaria) |
| Garruk Emblem | Existing +3/+3 and trample belongs to Garruk, Cursed Huntsman. Apex Predator gives an opponent an emblem that buffs creatures attacking them by +5/+5 and trample that turn. | [Huntsman](https://scryfall.com/card/eld/191/garruk-cursed-huntsman), [Apex](https://scryfall.com/card/m15/210/garruk-apex-predator) |
| Liliana Emblem | Use Last Hope only, with end-step creation of X 2/2 black Zombies, X = two plus Zombies controlled. Current sacrifice ability is not its text; Liliana Vess makes no emblem. | [Last Hope](https://scryfall.com/card/2x2/81/liliana-the-last-hope), [Vess](https://scryfall.com/card/m15/103/liliana-vess) |
| Elspeth Emblem | Existing +2/+2 and flying belongs to Elspeth, Sun's Champion. Knight-Errant instead grants indestructible to your artifacts, creatures, enchantments, and lands. | [Champion](https://scryfall.com/card/mkc/62/elspeth-suns-champion), [Knight-Errant](https://scryfall.com/card/mma/13/elspeth-knight-errant) |
| Chandra Emblem | Torch of Defiance triggers on any spell and deals 5 damage, not only red spells for 10. | [Chandra](https://scryfall.com/card/fra/244/chandra-torch-of-defiance) |
| Copy / Zombie (Embalm) | Label as reminders whose characteristics depend on original/effect, not universally colorless creatures. Embalm sets white, removes mana cost, and adds Zombie to existing creature types. Individual copy effects can add exceptions, abilities, or delayed exile/sacrifice. | CR 702.128, 707 |

Emblems are command-zone objects, not permanents or creature tokens (CR 114). Their reference names/type labels are convenient printed identifiers, not gameplay characteristics.

## High-impact keyword definitions

- **Rad, CR 728.1:** At the beginning of a player's precombat main phase, that player mills equal to their rad counters. For each nonland milled, they lose one life AND remove one rad counter. Not every player's end step.
- **Toxic, CR 702.164:** Static ability modifying combat damage results; a damaged player also gets poison equal to total toxic value. It is not a separate triggered ability and does not replace ordinary life loss.
- **Saga, CR 714.3–4:** Lore advances as a turn-based action at precombat main. A Saga is sacrificed after its final chapter ability leaves the stack, not as soon as it triggers. Read ahead changes entry counters; avoid universal wording that excludes that exception.
- **Forecast, CR 702.57:** Activate from hand only during its owner's upkeep and once per turn. Reveal as part of activation; remain revealed until it leaves hand or upkeep ends. Remove the contradictory sorcery-only restriction.
- **Embalm, CR 702.128 / Eternalize, CR 702.129:** Include printed cost and graveyard exile; copies have no mana cost. White/black replaces original colors; Zombie is added to original types. Eternalize also sets 4/4. Sorcery activation only.
- **Foray:** No current CR keyword/ability action matching this invented definition. Remove.
- **Substance:** No current CR entry; the claimed Unhinged mechanic and Gleemax example are incorrect. Remove rather than teaching obsolete historical implementation details as a current mechanic.
- **Backup:** Grants abilities printed below backup, not every other ability the creature currently has. The verified Valkyrie example's reminder makes this explicit.
- **Daybound / Nightbound:** Day/night changes at the next turn's untap step based on previous active player's spell count, not immediately after their last spell. Add this timing.

## Verified replacement keyword examples

All following names were found in one successful Scryfall collection API response and Oracle text demonstrated the relevant keyword/ability. Use the exact names below.

| Keyword | Verified example |
| --- | --- |
| First Strike | [White Knight](https://scryfall.com/card/ddg/9/white-knight) |
| Menace | [Boggart Brute](https://scryfall.com/card/jmp/299/boggart-brute) |
| Ward | [Tolarian Terror](https://scryfall.com/card/fdn/167/tolarian-terror) |
| Kicker | [Burst Lightning](https://scryfall.com/card/fdn/192/burst-lightning) |
| Toxic | [Crawling Chorus](https://scryfall.com/card/one/8/crawling-chorus) |
| Rad | [The Wise Mothman](https://scryfall.com/card/sld/2455/the-wise-mothman) |
| Blitz | [Jaxis, the Troublemaker](https://scryfall.com/card/snc/112/jaxis-the-troublemaker) |
| Connive | [Raffine, Scheming Seer](https://scryfall.com/card/snc/213/raffine-scheming-seer) (uses connive X) |
| Backup | [Boon-Bringer Valkyrie](https://scryfall.com/card/mom/9/boon-bringer-valkyrie) |
| Spree | [Three Steps Ahead](https://scryfall.com/card/otj/75/three-steps-ahead) |
| Learn | [Professor of Symbology](https://scryfall.com/card/stx/24/professor-of-symbology) |
| Plot | [Slickshot Show-Off](https://scryfall.com/card/otj/146/slickshot-show-off) |
| Formidable | [Shaman of Forgotten Ways](https://scryfall.com/card/dtk/204/shaman-of-forgotten-ways) |
| Undergrowth | [Rhizome Lurcher](https://scryfall.com/card/grn/196/rhizome-lurcher) |
| Shroud | [Blastoderm](https://scryfall.com/card/gvl/7/blastoderm) |
| Intimidate | [Bladetusk Boar](https://scryfall.com/card/jou/90/bladetusk-boar) |
| Phasing | [Teferi's Isle](https://scryfall.com/card/mir/330/teferis-isle) |
| Haunt | [Blind Hunter](https://scryfall.com/card/rvr/166/blind-hunter) |
| Recover | [Grim Harvest](https://scryfall.com/card/csp/58/grim-harvest) |
| Provoke | [Deftblade Elite](https://scryfall.com/card/vma/23/deftblade-elite) |
| Absorb | [Lymph Sliver](https://scryfall.com/card/tsr/25/lymph-sliver) |
| Bands with Others | [Cathedral of Serra](https://scryfall.com/card/leg/301/cathedral-of-serra) |

API handling: early individual lookups received rate limiting after approximately 20 successful cards. Requests were paused, then subsequent evidence was retrieved through successful collection reads. No dataset edits were made by this reviewer.
