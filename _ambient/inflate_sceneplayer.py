#!/usr/bin/env python3
"""Inflate staged ScenePlayer from _ambient/ScenePlayer.tsx.zlib.b64"""
import zlib, base64, hashlib, pathlib, sys
src = pathlib.Path("_ambient/ScenePlayer.tsx.zlib.b64")
dst = pathlib.Path("src/components/game/scenes/ScenePlayer.tsx")
expected = "7b6850dbe428f54cc82c0ebfc4abb242399763df7a5a3ed71ce68855271840ff"
b64 = src.read_text().strip()
data = zlib.decompress(base64.b64decode(b64))
got = hashlib.sha256(data).hexdigest()
if got != expected:
    sys.exit(f"hash mismatch {got}")
dst.write_bytes(data)
print(f"wrote {dst} ({len(data)} bytes) {got}")
