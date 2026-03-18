#!/usr/bin/env node
const QRCode = require('qrcode');

const doorId = process.argv[2];
if (!doorId) {
  console.error('Usage: node generate-qrcode.js <doorId> [baseUrl]');
  process.exit(1);
}

const baseUrl = process.argv[3] || 'https://app.domain.com';
const url = `${baseUrl.replace(/\/$/, '')}/r/${doorId}`;
const out = `qr-${doorId}.png`;

QRCode.toFile(out, url, { width: 512 }, (err) => {
  if (err) throw err;
  console.log(`Generated ${out} for ${url}`);
});
