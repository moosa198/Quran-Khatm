#!/usr/bin/env bash
set -euo pipefail

# Create the seven web-friendly MP3 segments from the supplied
# 7:28:33 Sheikh Ahmed Dibaan recording.
# Output: quran/friday.mp3 ... quran/thursday.mp3

SOURCE="${1:-source.mp3}"
mkdir -p quran

ffmpeg -hide_banner -loglevel error -i "$SOURCE" -map 0:a:0 \
  -c:a libmp3lame -b:a 48k -ac 1 -ar 44100 \
  -f segment \
  -segment_times 3524,8878,12889,16897,20176,23411 \
  -reset_timestamps 1 \
  quran/%d.mp3

mv quran/0.mp3 quran/friday.mp3
mv quran/1.mp3 quran/saturday.mp3
mv quran/2.mp3 quran/sunday.mp3
mv quran/3.mp3 quran/monday.mp3
mv quran/4.mp3 quran/tuesday.mp3
mv quran/5.mp3 quran/wednesday.mp3
mv quran/6.mp3 quran/thursday.mp3

echo "Created seven 48 kbps mono MP3 segments in quran/."