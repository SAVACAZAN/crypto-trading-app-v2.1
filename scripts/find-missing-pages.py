#!/usr/bin/env python3
# Find missing network pages

import os

# Read expected networks (from CryptoWallet.vue)
with open('expected-networks.txt', 'r') as f:
    expected = set(line.strip() for line in f if line.strip())

# Read existing pages
with open('pages-list.txt', 'r') as f:
    existing = set(line.strip().replace('.vue', '') for line in f if line.strip())

# Find missing pages
missing = sorted(expected - existing)

print("MISSING PAGES:")
print("=" * 50)
for page in missing:
    print(f"  - {page}.vue")

print(f"\nTotal missing: {len(missing)}")
print(f"Total expected: {len(expected)}")
print(f"Total existing: {len(existing)}")
