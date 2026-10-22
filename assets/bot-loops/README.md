# Bot avatar loops

Twelve looping expressions: jack, jelly, bulge, dizzy, melt, sneeze, roll, heart, fume, blep, glitch, pong.
Each loop is 1.2 to 2 seconds. Pick a mood by setting `data-mood` on the root svg.

## Layout

- `svg/<mood>.svg`    standalone animated svg, works in `<img>`, CSS backgrounds, Electron, a webview
- `src/_base.sass`    shared look (indented Sass, tabs)
- `src/loops/<mood>.sass`   one self-contained loop, `@use`s the base, compiles on its own
- `src/bot.sass`      imports all twelve
- `dist/<mood>.css`, `dist/bot-loops.css`   compiled CSS if you do not use Sass
- `Bot.svelte`        Svelte 5 + TypeScript wrapper, `<Bot mood="dizzy" size={160} />`, `mood={null}` for still
- `preview.html`      opens all twelve svgs side by side

## Plain markup

The svg needs the class `bot-avatar` and a `data-mood`. Swapping the attribute switches the loop.
Child classes are all prefixed `b-`. Copy the inner markup from any `svg/<mood>.svg`.

## Notes

- Colours are custom properties on `.bot-avatar`: `--bot-ink`, `--bot-shadow`, `--bot-muted`, `--bot-accent`.
- `prefers-reduced-motion` turns all loops off (still bot). Delete that block at the end of `_base.sass` to opt out.
- The viewBox is padded (`-200 -150 1500 1500`) on purpose, so jumps, peeks and the ping-pong have room.
- `Bot.svelte` imports `./src/bot.sass`, which needs `sass` installed. It uses `$props.id()`, so Svelte 5.20 or newer.
