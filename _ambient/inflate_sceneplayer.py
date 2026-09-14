#!/usr/bin/env python3
"""Inflate ScenePlayer from split zlib base64 parts a0+a1+b."""
import zlib, base64, hashlib, pathlib, sys
parts = [
    ("_ambient/sp.zlib.b64.a0", "a5ab81bf01f2a3c0"),
    ("_ambient/sp.zlib.b64.a1", "117e189ae2d347c3"),
    ("_ambient/sp.zlib.b64.b", "e572c9d68f10da51"),
]
chunks = []
for path, expect16 in parts:
    text = pathlib.Path(path).read_text().strip()
    got16 = hashlib.sha256(text.encode()).hexdigest()[:16]
    if got16 != expect16:
        sys.exit(f"hash mismatch {path}: {got16} != {expect16}")
    chunks.append(text)
data = zlib.decompress(base64.b64decode("".join(chunks)))
expected = "7b6850dbe428f54cc82c0ebfc4abb242399763df7a5a3ed71ce68855271840ff"
got = hashlib.sha256(data).hexdigest()
if got != expected:
    sys.exit(f"content hash mismatch {got}")
dst = pathlib.Path("src/components/game/scenes/ScenePlayer.tsx")
dst.write_bytes(data)
print(f"wrote {dst} ({len(data)} bytes) {got}")
