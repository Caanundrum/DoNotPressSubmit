#!/usr/bin/env python3
from __future__ import annotations
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = [
    "86379eb018f5add7",
    "67049904c540fbdf",
    "22153a66b1a7822a",
    "54b4b7cab9dcd611",
    "c10b980a6cbc88eb",
    "9e215647ae29ece6",
    "9fc2d5671062d44d",
    "dedeac33f2ec17ca",
    "2b609ab96cda7e09",
    "da1c87d15fb4a489",
]
TARGET_SHA = "7b6850dbe428f54cc82c0ebfc4abb242399763df7a5a3ed71ce68855271840ff"

parts = []
for i, want in enumerate(EXPECTED):
    text = (ROOT / "_ambient" / "hexchunks" / f"{i:02d}.hex").read_text().strip()
    h = hashlib.sha256(text.encode()).hexdigest()[:16]
    if h != want:
        raise SystemExit(f"hash mismatch part {i}: {h} != {want} len={len(text)}")
    parts.append(text)
raw = bytes.fromhex("".join(parts))
if hashlib.sha256(raw).hexdigest() != TARGET_SHA:
    raise SystemExit("target sha mismatch")
out = ROOT / "src/components/game/scenes/ScenePlayer.tsx"
out.write_bytes(raw)
print("OK", out, len(raw))
