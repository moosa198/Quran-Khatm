# Weekly Qur’an Reading

Separate PWA for a Friday-to-Thursday weekly Qur’an reading plan, based on the Hizbul-Azam Player UX but with a distinct Mushaf Blue identity.

## Schedule
Friday 2–147 · 00:00:00–01:24:22
Saturday 147–288 · 01:24:22–02:43:51
Sunday 288–393 · 02:43:51–03:44:39
Monday 393–511 · 03:44:39–04:46:40
Tuesday 511–618 · 04:46:40–05:36:16
Wednesday 618–721 · 05:36:16–06:31:51
Thursday 721–849 · 06:31:51–07:28:33

The day boundary pages are intentionally preserved exactly as supplied.

## Media
Place the supplied Qur’an PDF at `quran.pdf` and the seven supplied audio segments at `audio/friday.mp3` etc. The source audio is split at the supplied timestamps so each day has an independent player.

The code is complete without translation functionality. PDF.js is loaded from cdnjs at runtime; once the app is opened it can be cached by the service worker.

## Deploy
Enable GitHub Pages for the repository, using the `main` branch and root folder.
