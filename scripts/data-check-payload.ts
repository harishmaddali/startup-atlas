import { gzipSync } from "node:zlib";

import { getMapItems } from "../src/lib/ecosystem-repository";

const MAX_COMPRESSED_BYTES = 1_000_000;

const items = getMapItems();
const raw = Buffer.from(JSON.stringify(items));
const compressed = gzipSync(raw);

if (compressed.byteLength > MAX_COMPRESSED_BYTES) {
  console.error(
    `Map summary payload is ${compressed.byteLength.toLocaleString()} compressed bytes, exceeding the ${MAX_COMPRESSED_BYTES.toLocaleString()} byte release ceiling.`,
  );
  process.exit(1);
}

console.log(
  `Map summary: ${items.length.toLocaleString()} items, ${raw.byteLength.toLocaleString()} raw bytes, ${compressed.byteLength.toLocaleString()} compressed bytes.`,
);
