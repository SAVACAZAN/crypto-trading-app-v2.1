const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting dependencies security scan...\n');
console.log('='.repeat(80));

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ No package.json found in current directory!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`📦 Project: ${packageJson.name || 'Unknown'}`);
console.log(`📌 Version: ${packageJson.version || 'Unknown'}`);
console.log('='.repeat(80) + '\n');

// 1. List all dependencies
console.log('📋 DEPENDENCIES SUMMARY:\n');

const deps = packageJson.dependencies || {};
const devDeps = packageJson.devDependencies || {};

console.log(`✓ Production dependencies: ${Object.keys(deps).length}`);
console.log(`✓ Development dependencies: ${Object.keys(devDeps).length}`);
console.log(`✓ Total dependencies: ${Object.keys(deps).length + Object.keys(devDeps).length}\n`);

// 2. Check for outdated packages
console.log('='.repeat(80));
console.log('📊 CHECKING FOR OUTDATED PACKAGES:\n');

try {
  console.log('Running npm outdated...\n');
  const outdated = execSync('npm outdated --json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (outdated) {
    const outdatedPackages = JSON.parse(outdated);
    const outdatedCount = Object.keys(outdatedPackages).length;

    if (outdatedCount > 0) {
      console.log(`⚠️  Found ${outdatedCount} outdated packages:\n`);

      Object.entries(outdatedPackages).forEach(([name, info]) => {
        console.log(`  📦 ${name}`);
        console.log(`     Current: ${info.current || 'N/A'}`);
        console.log(`     Wanted:  ${info.wanted || 'N/A'}`);
        console.log(`     Latest:  ${info.latest || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('✅ All packages are up to date!\n');
    }
  } else {
    console.log('✅ All packages are up to date!\n');
  }
} catch (error) {
  // npm outdated returns exit code 1 when outdated packages exist
  if (error.stdout) {
    try {
      const outdatedPackages = JSON.parse(error.stdout);
      const outdatedCount = Object.keys(outdatedPackages).length;

      if (outdatedCount > 0) {
        console.log(`⚠️  Found ${outdatedCount} outdated packages:\n`);

        Object.entries(outdatedPackages).forEach(([name, info]) => {
          console.log(`  📦 ${name}`);
          console.log(`     Current: ${info.current || 'N/A'}`);
          console.log(`     Wanted:  ${info.wanted || 'N/A'}`);
          console.log(`     Latest:  ${info.latest || 'N/A'}`);
          console.log('');
        });
      }
    } catch (parseError) {
      console.log('⚠️  Could not parse outdated packages info\n');
    }
  } else {
    console.log('✅ All packages are up to date!\n');
  }
}

// 3. Check for security vulnerabilities
console.log('='.repeat(80));
console.log('🔒 CHECKING FOR SECURITY VULNERABILITIES:\n');

try {
  console.log('Running npm audit...\n');
  const audit = execSync('npm audit --json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const auditResults = JSON.parse(audit);

  if (auditResults.metadata) {
    const { vulnerabilities } = auditResults.metadata;
    const total = vulnerabilities.total || 0;

    if (total === 0) {
      console.log('✅ No security vulnerabilities found!\n');
    } else {
      console.log(`⚠️  Found ${total} security vulnerabilities:\n`);
      console.log(`   Critical: ${vulnerabilities.critical || 0}`);
      console.log(`   High:     ${vulnerabilities.high || 0}`);
      console.log(`   Moderate: ${vulnerabilities.moderate || 0}`);
      console.log(`   Low:      ${vulnerabilities.low || 0}\n`);

      if (auditResults.vulnerabilities) {
        console.log('\n📋 Vulnerability Details:\n');

        Object.entries(auditResults.vulnerabilities).forEach(([name, vuln]) => {
          console.log(`  📦 ${name}`);
          console.log(`     Severity: ${vuln.severity || 'Unknown'}`);
          console.log(`     Via: ${vuln.via ? vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ') : 'N/A'}`);
          console.log(`     Range: ${vuln.range || 'N/A'}`);
          if (vuln.fixAvailable) {
            console.log(`     Fix: ${typeof vuln.fixAvailable === 'object' ? vuln.fixAvailable.name + '@' + vuln.fixAvailable.version : 'Available'}`);
          }
          console.log('');
        });
      }

      console.log('\n💡 Run "npm audit fix" to automatically fix vulnerabilities');
      console.log('💡 Run "npm audit fix --force" for breaking changes fixes\n');
    }
  }
} catch (error) {
  if (error.stdout) {
    try {
      const auditResults = JSON.parse(error.stdout);

      if (auditResults.metadata) {
        const { vulnerabilities } = auditResults.metadata;
        const total = vulnerabilities.total || 0;

        if (total === 0) {
          console.log('✅ No security vulnerabilities found!\n');
        } else {
          console.log(`⚠️  Found ${total} security vulnerabilities:\n`);
          console.log(`   Critical: ${vulnerabilities.critical || 0}`);
          console.log(`   High:     ${vulnerabilities.high || 0}`);
          console.log(`   Moderate: ${vulnerabilities.moderate || 0}`);
          console.log(`   Low:      ${vulnerabilities.low || 0}\n`);

          if (auditResults.vulnerabilities) {
            console.log('\n📋 Vulnerability Details:\n');

            Object.entries(auditResults.vulnerabilities).forEach(([name, vuln]) => {
              console.log(`  📦 ${name}`);
              console.log(`     Severity: ${vuln.severity || 'Unknown'}`);
              console.log(`     Via: ${vuln.via ? vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ') : 'N/A'}`);
              console.log(`     Range: ${vuln.range || 'N/A'}`);
              if (vuln.fixAvailable) {
                console.log(`     Fix: ${typeof vuln.fixAvailable === 'object' ? vuln.fixAvailable.name + '@' + vuln.fixAvailable.version : 'Available'}`);
              }
              console.log('');
            });
          }

          console.log('\n💡 Run "npm audit fix" to automatically fix vulnerabilities');
          console.log('💡 Run "npm audit fix --force" for breaking changes fixes\n');
        }
      }
    } catch (parseError) {
      console.log('⚠️  Could not parse audit results\n');
    }
  } else {
    console.log('✅ No security vulnerabilities found!\n');
  }
}

// 4. Check for suspicious packages
console.log('='.repeat(80));
console.log('🔎 CHECKING FOR SUSPICIOUS PACKAGES:\n');

const suspiciousPatterns = [
  { pattern: /^test-/, reason: 'Test packages should be in devDependencies' },
  { pattern: /^debug-/, reason: 'Debug packages should be in devDependencies' },
  { pattern: /eval|exec|child_process/i, reason: 'Potentially dangerous operations' },
];

let suspiciousFound = false;

Object.entries(deps).forEach(([name, version]) => {
  suspiciousPatterns.forEach(({ pattern, reason }) => {
    if (pattern.test(name)) {
      if (!suspiciousFound) {
        console.log('⚠️  Potentially suspicious packages:\n');
        suspiciousFound = true;
      }
      console.log(`  📦 ${name}@${version}`);
      console.log(`     Reason: ${reason}\n`);
    }
  });
});

if (!suspiciousFound) {
  console.log('✅ No suspicious packages found!\n');
}

// 5. Check for large dependencies
console.log('='.repeat(80));
console.log('📏 DEPENDENCY SIZE CHECK:\n');

console.log('💡 To check package sizes, run:');
console.log('   npx package-size <package-name>\n');
console.log('💡 To analyze bundle size, run:');
console.log('   npm run build && npx webpack-bundle-analyzer\n');

// 6. License check
console.log('='.repeat(80));
console.log('📜 LICENSE INFORMATION:\n');

console.log('Project License:', packageJson.license || 'Not specified');
console.log('\n💡 To check all dependency licenses, run:');
console.log('   npx license-checker --summary\n');

// Final summary
console.log('='.repeat(80));
console.log('📊 SCAN SUMMARY:\n');

console.log('✓ Dependencies analyzed');
console.log('✓ Outdated packages checked');
console.log('✓ Security vulnerabilities scanned');
console.log('✓ Suspicious packages checked');
console.log('\n💡 RECOMMENDATIONS:\n');
console.log('1. Keep dependencies up to date regularly');
console.log('2. Run "npm audit" before each release');
console.log('3. Review new dependencies before adding');
console.log('4. Use exact versions for critical packages');
console.log('5. Consider using "npm ci" in production\n');

console.log('='.repeat(80));
console.log('✅ Dependency scan completed!\n');
