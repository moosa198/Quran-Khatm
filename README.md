# Qur'an Khatm

PWA for completing the Qur'an through flexible Khatm reading schedules, based on the Hizbul-Azam Player UX but with a distinct Mushaf Blue identity.

## Available Khatm schedules

The app supports 1-week, 2-week and 4-week Khatm schedules. The original Friday-to-Thursday schedule remains the 1-week option.

### 1-week schedule

| Day | Pages | Audio range | Duration |
|---|---:|---:|---:|
| Friday | 2–147 | 00:00:00–00:58:44 | 58:44 |
| Saturday | 147–288 | 00:58:44–02:27:58 | 1:29:14 |
| Sunday | 288–393 | 02:27:58–03:34:49 | 1:06:51 |
| Monday | 393–511 | 03:34:49–04:41:37 | 1:06:48 |
| Tuesday | 511–618 | 04:41:37–05:36:16 | 54:39 |
| Wednesday | 618–721 | 05:36:16–06:30:11 | 53:55 |
| Thursday | 721–849 | 06:30:11–07:28:33 | 58:22 |

The day boundaries are intentionally preserved exactly as supplied.

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

scripts/split-audio.sh can be used to regenerate the seven audio segments from the original recording. The final weekly PDFs are committed directly to the repository, so no PDF-generation script is required for the live site.
