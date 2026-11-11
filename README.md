# Videoke Nights

A videoke (karaoke) website: song book with song numbers, reserve queue,
full screen / split layouts, customizable lyrics, add-your-own songs.

## Run it
Double-click `index.html`. No installation needed. To put it online, upload the whole folder to any web host (Netlify Drop, GitHub Pages...).

## Folder map
```
index.html          page structure
css/base.css        colors, page layout, forms, buttons
css/stage.css       TV frame, full screen, split layout, lyrics overlay
css/components.css  controls row, song book, queue, footer
css/machine.css     the videoke machine layout: song book, screen, settings, search dialog
css/animations.css all motion (remove its <link> in index.html to turn off)
js/songs.js         the starter song list  <- add songs here
js/state.js         settings + saved data (localStorage)
js/theme.js         Customize panel and presets
js/lyrics.js        lyrics parsing, timing, stepping
js/lyricsapi.js     auto-fetch lyrics from an online service (swap the provider here)
js/player.js        video stage, reserve queue, score, full screen
js/catalog.js       search, categories, "Add any song"
js/songsearch.js    online catalog: search-as-you-type, browse chips, "Show more" (iTunes search, song info only)
js/audio.js         play your own audio file for a song, synced with the lyrics
js/interact.js      page light that follows the pointer + gentle tilt of the machine
js/songfiles.js     finds the audio, video and lyric files in the song folders by name
js/tapsync.js       re-time lyrics by tapping
songs/              one folder per song: put audio.mp3, video.mp4 and lyrics.lrc here
backgrounds/        videos used on the screen for every song ("My video folder")
js/sound.js         button click sounds + score jingle (made in the browser, no audio files)
js/main.js          start-up
```
Scripts load in the order listed in `index.html`.

## Add songs to the starter list
Open `js/songs.js`. Add `Title|Artist` lines under a category name in the MORE block (new songs go at the end so song numbers never change).
Visitors can also tap "Find any song online" to add songs that are not in the list.

## Colors and themes
- Settings (right of the screen): choose Full screen or Split, tap a color dot for one of 6 comforting themes (Calm Night, Warm Cream, Sage Garden, Lavender Dusk, Ocean Calm, Rose Sand),
  and fine-tune lyrics, colors and playback in the sections below. Colors has pickers for page background, panels, text, two accents and the machine color.
- Theme colors are CSS variables set from js/theme.js; the defaults live in css/base.css and js/state.js.

## Lyrics sync and chorus
- Timed lyrics ([mm:ss] lines) follow the music; the highlight sweeps across each line as it is sung.
- Chorus lines change color. If the lyrics have tags like [Chorus] / [Verse 1] they are used; otherwise lines that repeat are treated as the chorus (a guess).
- Turn these on/off or change colors in Customize.

## Adding audio, video and lyrics to the songs
Every song in the song book has its own folder:  `songs/<number>-<title>/`  (112 folders; numbers are in `SONG_NUMBERS.txt`).
Drop files in with these exact names. There is nothing to run or update:
- `audio.mp3` (or `<song number>.mp3`; also `.m4a`, `.wav`, `.ogg`, `.aac`, `.flac`, `.opus`): the song's audio. Under the screen the site says whether it found it.
- `video.mp4` (or `video.webm`): a video for the screen. With an audio file it plays silently; without one, its own sound plays and the lyrics follow it.
- `lyrics.lrc`: timed lyrics, lines like `[00:12.50] text of the line` (read when the site is hosted online).
- Videos for every song: `backgrounds/bg1.mp4`, `bg2.mp4` ... `bg9.mp4`, then choose "My video folder" in Settings.
- If lyrics are off: use "Next version", "Earlier / Later", or "Re-time lyrics by tapping" under the screen.

## If a song folder's audio is not picked up
Under the screen, "Check this song's folder" shows what the site looked for and what it found. "Import song folders" lets you choose your `songs` folder once; the browser reads the files directly (any file names work, and it does not matter how the page was opened). Imported files are saved on this device.

## Finding audio
`WHERE_TO_GET_AUDIO.html` lists every song with search links to legal sources (music stores, a licensed backing-track shop, YouTube minus-one search). Open it in a browser. The same links appear under the screen for the current song.

## Logo
The Videoke Nights logo is in `images/` (`logo.png` is the full-size original; the smaller files are for the header, the screen, and the browser/phone icons). It shows in the header and on the screen while no song is reserved.

## Notes
- Videos play from YouTube; paste a link per song. Some uploads block embedding.
- Lyrics are not stored in this project. They are fetched when a song starts (needs internet), or paste your own.
- If lyrics run early/late versus a video, use "Lyrics timing offset" in Customize.
- For a public or commercial site, use a licensed lyrics provider in js/lyricsapi.js.
