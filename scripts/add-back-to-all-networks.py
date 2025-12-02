#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import re

pages_dir = '../pages'

# Get all Network.vue files + Ultra.io
network_files = glob.glob(os.path.join(pages_dir, '*Network.vue'))
network_files += glob.glob(os.path.join(pages_dir, 'Ultra.io.vue'))

back_button_header_style = '''    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
          ← Back
        </n-button>'''

back_button_simple = '''    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

'''

added_count = 0
already_has_count = 0
failed_count = 0

for filepath in sorted(network_files):
    filename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has back button
    if '← Back' in content or 'Back to CryptoWallet' in content:
        print(f'[SKIP] Already has: {filename}')
        already_has_count += 1
        continue

    # Try multiple patterns to add back button

    # Pattern 1: After opening div, before <!-- Header -->
    pattern1 = r'(<div class="[^"]*(-network)?-page">\s*)(    <!-- Header -->)'
    if re.search(pattern1, content):
        new_content = re.sub(pattern1, r'\1' + back_button_simple + r'\3', content)

        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)

        print(f'[ADD1] {filename}')
        added_count += 1
        continue

    # Pattern 2: After opening div, before <n-card
    pattern2 = r'(<div class="[^"]*(-network)?-page">\s*)(    <!-- Header Card -->|\s*<n-card)'
    if re.search(pattern2, content):
        new_content = re.sub(pattern2, r'\1' + back_button_simple + r'\3', content)

        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)

        print(f'[ADD2] {filename}')
        added_count += 1
        continue

    # Pattern 3: After opening div, before any content
    pattern3 = r'(<div class="[^"]*(-network)?-page">\s*)(<)'
    if re.search(pattern3, content):
        new_content = re.sub(pattern3, r'\1' + back_button_simple + r'    \3', content)

        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)

        print(f'[ADD3] {filename}')
        added_count += 1
        continue

    print(f'[FAIL] Could not add to {filename}')
    failed_count += 1

print(f'\n{"="*60}')
print(f'Added: {added_count}')
print(f'Already has: {already_has_count}')
print(f'Failed: {failed_count}')
print(f'Total: {len(network_files)}')
print(f'{"="*60}')
