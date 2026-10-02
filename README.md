# Weekly Qur’an Reading

Separate PWA for a Friday-to-Thursday weekly Qur’an reading plan, based on the Hizbul-Azam Player UX but with a distinct Mushaf Blue identity.

## Revised weekly schedule

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

Place the Qur’an PDF at `quran.pdf` and the seven audio segments at `audio/friday.mp3` etc.

The supplied full Sheikh Ahmed Dibaan recording is 7:28:33. For web delivery, the seven segments should be encoded separately at a lower bitrate rather than loading one 409 MB file. The app uses `preload="metadata"` so opening a day does not intentionally download the entire track before playback.

## Offline / PWA

The service worker caches the application shell and runtime-caches same-origin media after it is requested. The PDF and the selected day's audio therefore become available for offline use after they have been loaded once.

PDF.js is loaded from cdnjs at runtime.

## Deploy

Enable GitHub Pages for the repository, using the `main` branch and root folder.
