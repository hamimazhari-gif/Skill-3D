# Sound effects

Sound effects for the videos. Use them in Remotion with `staticFile('sfx/<file>')`.

| File | Duration | Planned use |
|---|---|---|
| 08-heavy-whoosh.wav | 1.2 s | dip-to-cream cut between locations |
| 07-smooth-transition-whoosh.mp3 | 1.8 s | continuous camera move into the next shot |
| 05-airy-whoosh.mp3 | 2.35 s | crane up, light camera moves |
| 07-riser-build-up.wav | 1.8 s | tension before "You see" / the big reveal |
| 06-deep-cinematic-boom.wav | 1.2 s | the big moment (building lifts, "So..." consequence) |
| 03-subtle-digital-impact.mp3 | 0.55 s | label or sign lands in the world |
| 04-soft-ui-pop.mp3 | 1.1 s | character or prop appears |
| pop-bubble-sound-effect.mp3 | 1.07 s | small pop, light accent |
| 04-counter-tick-number-roll.wav | 0.5 s | a number word appears |
| 04-counter-tick-number-roll-2.wav | 0.5 s | variant for back-to-back numbers |
| 09-notification-ding.wav | 1.0 s | an idea or fact is introduced |
| 08-soft-success-chime.mp3 | 1.65 s | solution works / closing line |
| 02-error-denied-buzz.wav | 0.4 s | "But..." problem or complaint |
| 06-digital-glitch-tech-blip.mp3 | 1.07 s | quick glitch accent, use sparingly |
| 03-typing-keyboard-burst.wav | 1.5 s | writing, a letter, map title written |
| mouse-click-sound-effect.mp3 | 3.07 s | arrow drawn or pointed (trim to the first click) |

Mix: SFX under the voice-over (about -18 to -12 dB relative to the VO); no more than one accent per second.

## Synthesized cartoon sounds (`synth/`)

Made in code by `tools/synth_sfx.py` (numpy only, no third-party recordings; re-run it to rebuild). Use them as `staticFile('sfx/synth/<file>')`.

| File | Use |
|---|---|
| footsteps_walk.wav / footsteps_run.wav | under a character walking / running (trim to the walk) |
| cane_shuffle.wav | old person shuffling with a cane |
| boing.wav | jumps, hops, comic bounce |
| slide_whistle_up.wav / slide_whistle_down.wav | rising hope / a fall, shock, something drops |
| thud.wav | heavy object lands, impact |
| swish.wav | whip pan, quick hand move, something whipped out |
| heart_pop.wav | hearts, small happy pops |
| sparkle.wav | magic, wishes, shiny reveal |
| ka_ching.wav | money, price, sale |
| party_horn.wav / tada.wav | party, celebration |
| punch_clock.wav | clocking in, stamp, mechanical clunk |
| clock_tick.wav | room tone in offices and classrooms |
| page_flips.wav | books, papers |
| creak.wav | creaky knees, old furniture |
| crowd_murmur.wav / crowd_angry.wav / crowd_cheer.wav / applause.wav | crowds |
| birds.wav | outdoor day ambience |
| frying.wav | street food, kitchen |
| rumble.wav | big danger, Earth, tension bed |
| uh_oh.wav | comic "uh-oh" on a bad surprise |
| glass_tap.wav / glass_tap3.wav | knocking on a window pane (one tap / three taps) |
| pea_tik.wav / puff.wav | small object hitting glass / blowpipe or breath puff |
| alarm_bell.wav / phone_alarm.wav / snooze_tap.wav | old twin-bell alarm clock / phone alarm beeps / pressing a button |
| steam_whistle.wav | factory or train whistle, start of a shift |
| snore.wav | sleeping character |
| coin_drop.wav / stamp.wav | a few coins into a palm / rubber stamp, "TRUE STORY" style pop |
| atm_beep.wav / cash_dispense.wav | ATM keypad beeps / cash dispenser motor, paper riffle and clunk |
| kiss.wav | "mwah" kiss |
| whistle_prit.wav | parking attendant's trilled whistle ("prit! prit!") |
| scooter.wav / horn.wav | motor scooter idling and revving / minibus horn "tin tin" |
| espresso.wav | coffee machine pump and steam |
| paper_flutter.wav | a banknote or paper flying through the air |
| velcro.wav / fly_buzz.wav | wallet opening / a fly buzzing out of an empty wallet |
| slot_drop.wav | a note slipping into a clay piggy bank |
| chip_levelup.wav / chip_gameover.wav | retro game: level up arpeggio / falling "game over" melody |
| chip_coin.wav / chip_hurt.wav / chip_start.wav / chip_error.wav | retro game: coin, life lost, start jingle, error blip |
