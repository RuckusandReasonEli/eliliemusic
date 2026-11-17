/*
  ELI LIE SITE SETTINGS
  This is the only file you need to edit to update links.
  Leave a url as "" and the site shows that button as "SOON" until you fill it in.
*/
window.ELI_CONFIG = {
  // Presave popup: shows when someone first lands on the studio.
  // Set to "" to turn the popup off (for example, after release day).
  presave: "https://release.landr.com/991061878649",

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
  // cover: path to an image in this repo (for example "img/drunk-cover.jpg"), or "" for the pixel placeholder.
  releases: [
    {
      title: "Drunk",
      kind: "Single",
      year: "2026",
      cover: "",
      note: "Indie Americana and R&B with an electronic bent. Every part played by Eli, recorded at home.",
      links: [
        { name: "Spotify", url: "" },
        { name: "Apple Music", url: "" },
        { name: "YouTube Music", url: "" },
        { name: "Amazon Music", url: "" },
        { name: "Tidal", url: "" },
        { name: "Deezer", url: "" },
        { name: "Bandcamp", url: "" }
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
