#!/usr/bin/env python3
"""Inflate staged ScenePlayer zlib+b64 parts into src/components/game/scenes/ScenePlayer.tsx"""
from __future__ import annotations
import base64, hashlib, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
A1HEX_HASH = "0a512f023c284afa"
TARGET_SHA = "7b6850dbe428f54cc82c0ebfc4abb242399763df7a5a3ed71ce68855271840ff"

def load_b64(name: str) -> str:
    p = ROOT / "_ambient" / f"sp.zlib.b64.{name}"
    text = p.read_text().strip()
    h = hashlib.sha256(text.encode()).hexdigest()[:16]
    want = {"a0": "a5ab81bf01f2a3c0", "b": "e572c9d68f10da51"}[name]
    if h != want:
        raise SystemExit(f"hash mismatch {name}: got {h} want {want} len={len(text)}")
    return text

def load_a1() -> str:
    p = ROOT / "_ambient" / "sp.zlib.b64.a1.hex"
    text = p.read_text().strip()
    h = hashlib.sha256(text.encode()).hexdigest()[:16]
    if h != A1HEX_HASH:
        raise SystemExit(f"hash mismatch a1.hex: got {h} want {A1HEX_HASH} len={len(text)}")
    decoded = bytes.fromhex(text).decode()
    if hashlib.sha256(decoded.encode()).hexdigest()[:16] != "117e189ae2d347c3":
        raise SystemExit("a1 decoded hash mismatch")
    return decoded

blob = load_b64("a0") + load_a1() + load_b64("b")
if hashlib.sha256(blob.encode()).hexdigest()[:16] != "0dae23ca718318f8":
    raise SystemExit("full b64 hash mismatch")
raw = zlib.decompress(base64.b64decode(blob))
if hashlib.sha256(raw).hexdigest() != TARGET_SHA:
    raise SystemExit(f"inflated sha mismatch: {hashlib.sha256(raw).hexdigest()}")
out = ROOT / "src/components/game/scenes/ScenePlayer.tsx"
out.write_bytes(raw)
print("OK wrote", out, "bytes", len(raw))
