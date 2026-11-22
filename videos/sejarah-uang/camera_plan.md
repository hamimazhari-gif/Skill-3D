# Camera plan — Dari Sekarung Beras ke Satu Sentuhan / From a Sack of Rice to a Single Tap

Both versions share the same camera paths. Key times come from the real voice-over (`sentence_times_en.json`, `sentence_times_id.json`):
each key lands 0.15 s after its word, smoothed with the monotone cubic time warp (ease in/out, zero speed at first and last key).
Vertical FOV 80°, 1080x1920. Location x offsets: road 0, market 40, docks 80, shop 120, crossroads 160, mint 200, museum 240.

| Shot | EN start | ID start | Location | Move | Path (beats) | FG / MG / BG | In-world labels |
|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 0.00 | Village road | pull back + crane | chicken cage → farmer with sack ("rice/beras") → wide on gate ("market/pasar") | cage, basket / farmer walking / paddies, houses, trees | RICE/BERAS sack, MARKET/PASAR banner |
| 2 | 4.33 | 5.13 | Market | sideways track | pair 1 ("rice") → pair 2 ("salt") → pair 3 ("goats"); goods pop in on each noun | crates / three trading pairs / stalls | FISH/IKAN, SALT/GARAM, CLOTH/KAIN, RICE/BERAS |
| 3 | 9.49 | 12.83 | Docks | crane down | high over boat → dock ("docks/dermaga") → farmer + fisherman | rope, baskets / characters / water, boats | DOCKS/DERMAGA |
| 4 | 13.79 | 17.55 | Docks (continuous) | push in | close on fisherman, head shake on "shakes/menggeleng" → slate, shoe drawn on "shoes/sepatu" | barrel / fisherman / sea | chalk shoe |
| 5 | 17.11 | 22.76 | Shoemaker's shop | push + track | farmer at door → shoemaker → order board, goat drawn on "goat/kambing" | bench / shoemaker / boot shelves | SHOES/SEPATU, chalk goat |
| 6 | 19.62 | 27.02 | Crossroads, sunset | crane up | sundial → tired farmer ("feet/pegal") → signpost and sky; sun sinks through the shot | sundial / farmer, sack / signpost, hills | MARKET, DOCKS, SHOES signpost |
| 7 | 24.22 | 34.27 | Market notice board | crane up | farmer + fisherman → board; the two "want" circles slide together and a tick appears on "once/sama" | — / two characters / board | RICE + FISH circles |
| 8 | 28.01 | 38.74 | Early money + Lydian workshop | track + push | shells → salt → metal (pop on each word) → LYDIA banner → anvil; big lion coin + boom on "coins/koin" | table goods / minter / banner, furnace | LYDIA, c. 600 BC / ± 600 SM |
| 9 | 36.20 | 45.92 | Museum | sideways track | jiaozi case ("paper/kertas") → counter; phone tap and green tick on "tap/tempelkan" | rope stanchions / case, buyer / wall sign | MUSEUM OF MONEY / MUSEUM UANG, JIAOZI · 1024, PAY/BAYAR |
| 10 | 40.34 | 51.28 | Market, now with coins | pull back + track | buyer with coins → wide market ("single/sentuhan") → chalkboard | coin piles / buyers, sellers / stalls | stall signs |
| 11 | 44.14 | 57.36 | Market chalkboard (continuous) | slow push, ends at rest | farmer with sack + phone beside the board | sack / farmer / market | TRADE WHAT? / TUKAR APA? |

Cuts: 0.4 s dip to cream at location changes (shots 2, 3, 5, 6, 7, 8, 9, 10); continuous moves into shots 4 and 11.

## Sound effects (from `public/sfx/`)
airy whoosh at the open; soft pops on the chicken and on traded goods; heavy whoosh into the docks and the shop; denied buzz on the head shake and on the goat; counter ticks on "half a day" and "sore feet"; riser into "at once/sama"; subtle impacts on shells, salt, metal; deep boom on "coins"; typing burst on "paper money"; notification ding on the phone tap; smooth whoosh back to the market; success chime on the question; one mouse click on "comment/komentar". Unused: digital glitch blip.
