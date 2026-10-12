#!/bin/sh
# Renders every *.svg here to a 1080x1080 PNG with headless Chromium.
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
cd "$(dirname "$0")"
for f in ${@:-*.svg}; do
  cp "$f" /tmp/
  printf '<html><body style="margin:0"><img src="%s" width="1080" height="1080"></body></html>' "$f" > /tmp/_av.html
  "$B" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1080,1080 \
    --screenshot="$PWD/${f%.svg}.png" file:///tmp/_av.html >/dev/null 2>&1
done
