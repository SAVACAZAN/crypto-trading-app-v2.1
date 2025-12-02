#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import glob

# Read CryptoWallet.vue to extract all routes
cryptowallet_path = '../components/CryptoWallet.vue'

with open(cryptowallet_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all navigateTo routes
pattern = r"navigateTo\('(/[^']+)'\)"
routes = re.findall(pattern, content)

# Extract unique routes
unique_routes = sorted(set(routes))

# Get all existing pages
pages_dir = '../pages'
existing_pages = []

for file in glob.glob(os.path.join(pages_dir, '*.vue')):
    filename = os.path.basename(file)
    page_name = filename.replace('.vue', '')
    existing_pages.append('/' + page_name)

existing_pages = set(existing_pages)

# Find mismatches
print("=" * 60)
print("ROUTE vs PAGE MISMATCHES")
print("=" * 60)

missing_pages = []
for route in unique_routes:
    if route not in existing_pages:
        missing_pages.append(route)
        print(f"MISSING PAGE: {route} -> needs {route[1:]}.vue")

print(f"\nTotal routes in CryptoWallet: {len(unique_routes)}")
print(f"Total existing pages: {len(existing_pages)}")
print(f"Missing pages: {len(missing_pages)}")

if len(missing_pages) == 0:
    print("\n✅ ALL ROUTES HAVE PAGES!")
else:
    print(f"\n❌ {len(missing_pages)} pages need to be created or routes need to be fixed")
