#!/bin/sh
# Downloads a Russian Piper voice (sherpa-onnx build) into models/.
set -e
VOICE=${1:-dmitri-medium}
cd "$(dirname "$0")/.."
mkdir -p models
curl -sSL -o /tmp/voice.tar.bz2 \
  "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-$VOICE.tar.bz2"
tar xjf /tmp/voice.tar.bz2 -C models
rm /tmp/voice.tar.bz2
