import type { Artifact } from './types.ts';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): Uint8Array {
  return Uint8Array.of(n & 0xff, (n >>> 8) & 0xff);
}

function u32(n: number): Uint8Array {
  return Uint8Array.of(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const encoder = new TextEncoder();
const DOS_DATE = 0x0021; // 1980-01-01
const DOS_TIME = 0;
const UTF8_FLAG = 0x0800;

/**
 * Deterministic ZIP (STORE). Sorted paths, LF contents, DOS timestamp 1980-01-01,
 * Unix mode 0644. Cycle 1 uses STORE rather than deflate (M4).
 */
export function buildZip(files: Artifact[]): Uint8Array {
  const entries = [...files]
    .map((f) => ({ path: f.path.replaceAll('\\', '/'), content: encoder.encode(f.content.replaceAll('\r\n', '\n')) }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    if (entry.path.includes('..') || entry.path.startsWith('/') || entry.path.includes('\\')) {
      throw new Error(`PATH_UNSAFE:${entry.path}`);
    }
    const name = encoder.encode(entry.path);
    const crc = crc32(entry.content);
    const local = concat([
      encoder.encode('PK\u0003\u0004'),
      u16(20),
      u16(UTF8_FLAG),
      u16(0),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(entry.content.length),
      u32(entry.content.length),
      u16(name.length),
      u16(0),
      name,
      entry.content,
    ]);
    const unixAttr = (0o100644 << 16) >>> 0;
    const central = concat([
      encoder.encode('PK\u0001\u0002'),
      u16(20),
      u16(20),
      u16(UTF8_FLAG),
      u16(0),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(entry.content.length),
      u32(entry.content.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(unixAttr),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = concat(centrals);
  const eocd = concat([
    encoder.encode('PK\u0005\u0006'),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return concat([...locals, centralDir, eocd]);
}

export function zipFileNames(bytes: Uint8Array): string[] {
  const names: string[] = [];
  let i = 0;
  const dec = new TextDecoder();
  while (i + 30 <= bytes.length && bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 3 && bytes[i + 3] === 4) {
    const nameLen = bytes[i + 26] | (bytes[i + 27] << 8);
    const extraLen = bytes[i + 28] | (bytes[i + 29] << 8);
    const size = bytes[i + 22] | (bytes[i + 23] << 8) | (bytes[i + 24] << 16) | (bytes[i + 25] << 24);
    names.push(dec.decode(bytes.subarray(i + 30, i + 30 + nameLen)));
    i += 30 + nameLen + extraLen + size;
  }
  return names;
}
