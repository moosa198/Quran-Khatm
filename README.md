# Qur'an Khatm

PWA for completing the Qur'an through flexible Khatm reading schedules, based on the Hizbul-Azam Player UX but with a distinct Mushaf Blue identity.

## Available Khatm schedules

The app supports 1-week, 2-week and 4-week Khatm schedules. The original Friday-to-Thursday schedule remains the 1-week option.

### 1-week schedule

| Day | Pages | Audio range | Duration |
|---|---:|---:|---:|
| Friday | 2–106 | Audio still uses the previous split | — |
| Saturday | 106–260 | Audio still uses the previous split | — |
| Sunday | 260–372 | Audio still uses the previous split | — |
| Monday | 372–501 | Audio still uses the previous split | — |
| Tuesday | 501–611 | Audio still uses the previous split | — |
| Wednesday | 611–716 | Audio still uses the previous split | — |
| Thursday | 716–849 | Audio still uses the previous split | — |

The page ranges above follow the new source-PDF split. Adjacent portions share their boundary page exactly as specified. The existing MP3s have not yet been re-cut to these new page divisions, so audio and displayed page boundaries may not align until the original full recording is reprocessed.

## Media

The repository contains the seven ready-to-use PDFs and seven compressed audio files in quran/:

- quran/friday.pdf + quran/friday.mp3
- quran/saturday.pdf + quran/saturday.mp3
- quran/sunday.pdf + quran/sunday.mp3
- quran/monday.pdf + quran/monday.mp3
- quran/tuesday.pdf + quran/tuesday.mp3
- quran/wednesday.pdf + quran/wednesday.mp3
- quran/thursday.pdf + quran/thursday.mp3

The supplied Sheikh Ahmed Dibaan recording is 7:28:33. The web audio is speech-focused, mono MP3. The player uses preload="metadata" so opening a day does not intentionally download the entire track before playback.

## Offline / PWA

The service worker caches the application shell and runtime-caches same-origin resources after they are requested. PDF.js is loaded from cdnjs at runtime, so full offline reading also depends on PDF.js having been available/cached by the browser.

## Deploy

Enable GitHub Pages for the repository, using the main branch and root folder.

## Local media generation

scripts/split-audio.sh can be used to regenerate the seven audio segments from the original recording. The weekly PDFs are generated from the supplied complete Mushaf PDF. The current source was split into the seven ranges above; the generated files are available in the conversation attachment while repository media replacement is pending.
