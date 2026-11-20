/*
  ELI LIE SITE SETTINGS
  This is the only file you need to edit to update links.
  Leave a url as "" and the site shows that button as "SOON" until you fill it in.
*/
window.ELI_CONFIG = {
  // Google Analytics measurement ID (Eli Lie website property).
  analyticsId: "G-217KFS69C2",

  // "Out now" popup: shows once per visit when someone lands on the studio.
  // Set release to null to turn the popup off.
  release: {
    title: "Drunk",
    cover: "https://i.scdn.co/image/ab67616d0000b273955db599abb384be86855c1e",
    coverFallback: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02955db599abb384be86855c1e",
    links: [
      { name: "Spotify", url: "https://open.spotify.com/track/3JNaoSrH0jQ8qStF1aHsro" },
      { name: "Apple Music", url: "https://music.apple.com/us/album/drunk/6831368544?i=6831368545" },
      { name: "YouTube Music", url: "https://music.youtube.com/playlist?list=OLAK5uy_mtfNpo8LATJmO5ckxzro95_iOuSFbOM0Y" },
      { name: "Deezer", url: "https://www.deezer.com/album/1139465791" }
    ],
    allPlatforms: "https://release.landr.com/991061878649"
  },

  // Mailing list: the Google Apps Script web app that writes sign-ups to the sheet.
  signupEndpoint: "https://script.google.com/macros/s/AKfycbxeeUeU6UTFCK6yxFkspFy3a8HaxvCRR_4ba-q1QdXVdjcXKADqbfKPU-ImnW9Ty_GE1A/exec",

  // Photo wall in the studio opens this in a new tab.
  // Example: "https://www.instagram.com/yourhandle/"
  instagram: "",

  // The Drunk game (Game Boy on the couch, and the Games page).
  drunkGame: "https://ruckusandreasoneli.github.io/drunkgame/",

  // Artist profile links: shown on the Music page under "Find Eli Lie on".
  profiles: [
    { name: "Spotify", url: "" },
    { name: "Apple Music", url: "" },
    { name: "YouTube Music", url: "" },
    { name: "Amazon Music", url: "" },
    { name: "Tidal", url: "" },
    { name: "Deezer", url: "" },
    { name: "Pandora", url: "" },
    { name: "Bandcamp", url: "" },
    { name: "SoundCloud", url: "" }
  ],

  // Releases: newest first. Each one gets its own row of platform buttons.
  // cover: an image URL or a path in this repo (for example "img/drunk-cover.jpg"), or "" for the pixel placeholder.
  // coverFallback (optional): a second image to try if the first one fails to load.
  releases: [
    {
      title: "Drunk",
      kind: "Single",
      year: "2026",
      cover: "https://i.scdn.co/image/ab67616d0000b273955db599abb384be86855c1e",
      coverFallback: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02955db599abb384be86855c1e",
      note: "Out now. Indie Americana and R&B with an electronic bent. Every part played by Eli, recorded at home.",
      links: [
        { name: "Spotify", url: "https://open.spotify.com/track/3JNaoSrH0jQ8qStF1aHsro" },
        { name: "Apple Music", url: "https://music.apple.com/us/album/drunk/6831368544?i=6831368545" },
        { name: "YouTube Music", url: "https://music.youtube.com/playlist?list=OLAK5uy_mtfNpo8LATJmO5ckxzro95_iOuSFbOM0Y" },
        { name: "Deezer", url: "https://www.deezer.com/album/1139465791" },
        { name: "All platforms", url: "https://release.landr.com/991061878649" }
      ]
    },
    {
      title: "Drunk (8-bit version)",
      kind: "Game soundtrack",
      year: "2026",
      cover: "",
      note: "The chiptune version that scores DRUNK: A Game about Eli Lie's Single.",
      links: [
        { name: "Play the game", url: "https://ruckusandreasoneli.github.io/drunkgame/" }
      ]
    }
  ],

  // Shows: leave empty and the Shows page says "coming soon".
  // Example: { date: "2027-02-14", city: "Sacramento, CA", venue: "Venue name", tickets: "https://..." }
  shows: []
};
