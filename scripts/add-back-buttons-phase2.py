#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

pages_dir = '../pages'

networks = [
    'zkSyncNetwork',
    'FantomNetwork',
    'LineaNetwork',
    'ScrollNetwork',
    'BlastNetwork',
    'MantleNetwork',
    'CronosNetwork',
    'HarmonyNetwork',
    'MoonbeamNetwork',
    'GnosisNetwork'
]

back_button = '''    <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

'''

added_count = 0
already_has_count = 0
skipped_count = 0

for network in networks:
    filepath = os.path.join(pages_dir, f'{network}.vue')

    if not os.path.exists(filepath):
        print(f'File not found: {network}.vue')
        skipped_count += 1
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has back button
    if '← Back' in content or 'Back to CryptoWallet' in content:
        print(f'Already has back button: {network}.vue')
        already_has_count += 1
        continue

    # Find the pattern and insert back button
    # Pattern: <div class="xxx-network-page">\n    <!-- Header Card -->
    pattern = r'(<div class="[^"]*-network-page">\n)(    <!-- Header Card -->)'

    if re.search(pattern, content):
        new_content = re.sub(pattern, r'\1' + back_button + r'\2', content)

        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)

        print(f'Added back button to {network}.vue')
        added_count += 1
    else:
        print(f'Could not match pattern in {network}.vue')
        skipped_count += 1

print(f'\n{"="*40}')
print(f'Added: {added_count}')
print(f'Already has: {already_has_count}')
print(f'Skipped: {skipped_count}')
print(f'{"="*40}')
