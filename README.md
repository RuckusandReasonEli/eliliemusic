# Eli Lie

The Eli Lie website: a home studio drawn like an early-90s adventure game. Click around the room. Glowing objects open pages; almost everything else does something.

Live at: https://ruckusandreasoneli.github.io/eliliemusic/

## Updating links

Edit **`config.js`**. It's the only file you need to touch for day-to-day updates:

- `instagram`: the photo wall opens this. Until it's filled in, the photo wall shows a "coming soon" popup.
- `profiles`: your artist pages on each streaming platform (Music page, "Find Eli Lie on").
- `releases`: each release with its own platform links. Newest first. Add a cover by putting an image in the repo (for example `img/drunk-cover.jpg`) and setting `cover` to that path.
- `shows`: add dates like `{ date: "2027-02-14", city: "Sacramento, CA", venue: "Venue name", tickets: "https://..." }`. With no upcoming dates, the Shows page is stamped COMING SOON.
- `drunkGame`: where the Games page sends players.

Any link left as `""` shows as a greyed-out **SOON** button.

## What's where

| In the room | Goes to |
|---|---|
| Computer screen | `music.html` |
| Corkboard calendar | `shows.html` |
| Game Boy on the couch | `games.html` |
| Photo wall | Instagram (new tab) |
| Old TV | "Videos coming soon" popup |
| Answering machine | "Contact coming soon" popup |
| Merch box | "Merch coming soon" popup |

Everything else in the room reacts: guitars strum, synths play, the lamp turns the lights off, the dog wags. There are 5 hidden guitar picks to find.

Sound is always off until the visitor turns it on with the SOUND button.

## Files

- `index.html`: the studio room (the pixel art is inline SVG)
- `room.js`: hotspots, reactions, sound, phone panning
- `music.html`, `shows.html`, `games.html`: inner pages, filled from `config.js` by `pages.js`
- `styles.css`: everything visual
