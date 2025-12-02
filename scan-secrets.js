const fs = require('fs');
const path = require('path');

// Patterns to search for sensitive data
const SENSITIVE_PATTERNS = [
  { name: 'API Keys', regex: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi },
  { name: 'Private Keys', regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi },
  { name: 'AWS Keys', regex: /AKIA[0-9A-Z]{16}/gi },
  { name: 'Passwords', regex: /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{3,})['"]?/gi },
  { name: 'MongoDB URI', regex: /mongodb(?:\+srv)?:\/\/[^\s'"]+/gi },
  { name: 'Database URL', regex: /(?:postgres|mysql|mariadb):\/\/[^\s'"]+/gi },
  { name: 'JWT Secret', regex: /(?:jwt[_-]?secret|jwt[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi },
  { name: 'Bearer Token', regex: /Bearer\s+[a-zA-Z0-9_\-\.]+/gi },
  { name: 'OAuth Token', regex: /(?:oauth|token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi },
  { name: 'Email Credentials', regex: /(?:smtp|email)[_-]?(?:user|pass|password)\s*[:=]\s*['"]([^'"]+)['"]?/gi },
  { name: 'Credit Card', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/gi },
  { name: 'IP Address (Private)', regex: /\b(?:10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.|192\.168\.)\d{1,3}\.\d{1,3}\b/gi },
  { name: 'Stripe Keys', regex: /(?:sk|pk)_(?:live|test)_[a-zA-Z0-9]{24,}/gi },
  { name: 'GitHub Token', regex: /gh[pousr]_[A-Za-z0-9_]{36,}/gi },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/gi },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z_-]{35}/gi },
  { name: 'Firebase', regex: /FIREBASE[_-]?API[_-]?KEY/gi },
  { name: 'Twilio', regex: /SK[a-z0-9]{32}/gi },
  { name: 'Discord Token', regex: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/gi },
];

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.nuxt',
  'coverage',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  '.env.example',
  'scan-secrets.js', // Ignore this file itself
];

// File extensions to scan
const SCAN_EXTENSIONS = [
  '.js', '.ts', '.vue', '.json', '.env', '.yml', '.yaml',
  '.config', '.conf', '.txt', '.md', '.jsx', '.tsx',
  '.php', '.py', '.rb', '.java', '.cs', '.go'
];

let foundIssues = [];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function shouldScan(filePath) {
  const ext = path.extname(filePath);
  return SCAN_EXTENSIONS.includes(ext) || path.basename(filePath).startsWith('.env');
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    SENSITIVE_PATTERNS.forEach(({ name, regex }) => {
      lines.forEach((line, lineNum) => {
        const matches = line.matchAll(regex);
        for (const match of matches) {
          // Skip comments in various languages
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('//') ||
              trimmedLine.startsWith('#') ||
              trimmedLine.startsWith('/*') ||
              trimmedLine.startsWith('*') ||
              trimmedLine.startsWith('<!--')) {
            continue;
          }

          foundIssues.push({
            file: filePath,
            line: lineNum + 1,
            type: name,
            content: line.trim().substring(0, 100), // First 100 chars
            match: match[0].substring(0, 50) // First 50 chars of match
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);

      if (shouldIgnore(filePath)) {
        return;
      }

      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (stat.isFile() && shouldScan(filePath)) {
        scanFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

// Main execution
console.log('🔍 Starting security scan...\n');
console.log('Scanning for sensitive data patterns...\n');

const startTime = Date.now();
const rootDir = process.cwd();

scanDirectory(rootDir);

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log('\n' + '='.repeat(80));
console.log('SCAN RESULTS');
console.log('='.repeat(80) + '\n');

if (foundIssues.length === 0) {
  console.log('✅ No sensitive data patterns found!');
  console.log('✅ Repository appears safe to make public.\n');
} else {
  console.log(`⚠️  Found ${foundIssues.length} potential security issues:\n`);

  // Group by type
  const grouped = {};
  foundIssues.forEach(issue => {
    if (!grouped[issue.type]) {
      grouped[issue.type] = [];
    }
    grouped[issue.type].push(issue);
  });

  Object.keys(grouped).forEach(type => {
    console.log(`\n📌 ${type} (${grouped[type].length} occurrences):`);
    console.log('-'.repeat(80));

    grouped[type].forEach(issue => {
      console.log(`  File: ${issue.file}`);
      console.log(`  Line: ${issue.line}`);
      console.log(`  Match: ${issue.match}`);
      console.log(`  Context: ${issue.content}`);
      console.log('');
    });
  });

  console.log('\n⚠️  WARNING: Review these issues before making repository public!');
  console.log('⚠️  Consider using .env files and .gitignore to protect sensitive data.\n');
}

console.log('='.repeat(80));
console.log(`Scan completed in ${duration} seconds`);
console.log('='.repeat(80) + '\n');

// Exit with error code if issues found
process.exit(foundIssues.length > 0 ? 1 : 0);
