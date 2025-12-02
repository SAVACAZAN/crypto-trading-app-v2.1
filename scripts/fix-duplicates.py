#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import re

pages_dir = '../pages'
pattern = re.compile(
    r'\s*<!-- Back Button -->\s*\n\s*<div style="margin-bottom: 16px;">\s*\n\s*<n-button[^>]+>.*?Back.*?</n-button>\s*\n\s*</div>\s*\n+',
    re.DOTALL
)

files_fixed = 0
files_skipped = 0

for filepath in glob.glob(os.path.join(pages_dir, '*Network.vue')):
    filename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if there's a duplicate back button
    if '<!-- Back Button -->' in content and 'margin-bottom: 16px' in content:
        # Remove the duplicate
        new_content = pattern.sub('\n', content, count=1)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
            print(f"Fixed {filename}")
            files_fixed += 1
        else:
            print(f"Could not match pattern in {filename}")
            files_skipped += 1
    else:
        print(f"- No duplicate in {filename}")
        files_skipped += 1

print(f"\n{'='*40}")
print(f"Fixed: {files_fixed}")
print(f"Skipped: {files_skipped}")
print(f"{'='*40}")
