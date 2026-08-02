#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const API_URL =
  "https://script.google.com/macros/s/AKfycby3YE2won9VDswJVZ1Wf2ukVMyKCkXy_n-X7Pg35OhbMtq6VtTKu4A1i-_ZcDImPl-BHA/exec";

const ACCOUNTS_DIR = path.join(__dirname, "..", "Get", "accounts");

const TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Profile</title>
<link rel="stylesheet" href="../assets/profile.css">
</head>
<body>
<div id="app"></div>
<script src="../assets/profile.js"></script>
</body>
</html>
`;

function accountUrl(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  const posts = await res.json();

  const seen = new Map();
  for (const post of posts) {
    if (!post || !post.name) continue;
    const slug = accountUrl(post.name);
    if (!seen.has(slug)) seen.set(slug, post.name);
  }

  fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const [slug, name] of seen) {
    const filePath = path.join(ACCOUNTS_DIR, `${slug}.html`);

    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    fs.writeFileSync(filePath, TEMPLATE);
    created++;
    console.log(`Created accounts/${slug}.html (${name})`);
  }

  console.log(`\nDone. ${created} new page(s) created, ${skipped} already existed and were left alone.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
