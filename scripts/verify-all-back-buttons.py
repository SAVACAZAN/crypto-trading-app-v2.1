#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob

pages_dir = '../pages'

# Get all Network.vue files
network_files = glob.glob(os.path.join(pages_dir, '*Network.vue'))
network_files += glob.glob(os.path.join(pages_dir, 'Ultra.io.vue'))  # Include Ultra.io

missing_back = []
has_back = []

for filepath in sorted(network_files):
    filename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if has back button
    if 'Back' in content and ('dashboard?tab=cryptowallet' in content or 'Back to CryptoWallet' in content):
        has_back.append(filename)
    else:
        missing_back.append(filename)

print("=" * 60)
print("BACK BUTTON VERIFICATION")
print("=" * 60)

if missing_back:
    print(f"\nMISSING BACK BUTTONS ({len(missing_back)}):")
    for page in missing_back:
        print(f"  - {page}")
else:
    print("\nALL PAGES HAVE BACK BUTTONS!")

print(f"\nTotal network pages checked: {len(network_files)}")
print(f"Pages with back buttons: {len(has_back)}")
print(f"Pages missing back buttons: {len(missing_back)}")
