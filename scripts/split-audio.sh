#!/usr/bin/env bash
set -euo pipefail

# Create the seven web-friendly MP3 segments from the supplied
# 7:28:33 Sheikh Ahmed Dibaan recording.
#
# Requires ffmpeg. The source file is intentionally not committed here.
# Output: audio/friday.mp3 ... audio/thursday.mp3

SOURCE="${1:-source.mp3}"
mkdir -p audio

ffmpeg -hide_banner -loglevel error -i "$SOURCE" -map 0:a:0 \
  -c:a libmp3lame -b:a 64k -ac 1 -ar 44100 \
  -f segment \
  -segment_times 3524,8878,12889,16897,20176,23411 \
  -reset_timestamps 1 \
  audio/%d.mp3

mv audio/0.mp3 audio/friday.mp3
mv audio/1.mp3 audio/saturday.mp3
mv audio/2.mp3 audio/sunday.mp3
mv audio/3.mp3 audio/monday.mp3
mv audio/4.mp3 audio/tuesday.mp3
mv audio/5.mp3 audio/wednesday.mp3
mv audio/6.mp3 audio/thursday.mp3

echo "Created seven 64 kbps mono MP3 segments."
