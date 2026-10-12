#!/bin/sh
# Renders the SVG logos to PNG with headless Chromium.
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
cd "$(dirname "$0")"
render() { # svg w h out
  printf '<html><body style="margin:0;background:transparent"><img src="%s" width="%s" height="%s"></body></html>' "$1" "$2" "$3" > /tmp/_logo.html
  cp "$1" /tmp/
  "$B" --no-sandbox --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$2,$3" --screenshot="$PWD/$4" "file:///tmp/_logo.html" >/dev/null 2>&1
}
render avatar.svg 1080 1080 avatar.png
render avatar-name.svg 1080 1080 avatar-name.png
render wordmark.svg 1600 500 wordmark.png
render wordmark-dark.svg 1600 500 wordmark-dark.png
