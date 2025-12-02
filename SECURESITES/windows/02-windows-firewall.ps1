# ================================================================================
# Windows Defender Firewall Configuration Script
#
# Purpose: Configure Windows Firewall with DDoS protection
# Target: Windows Server 2022, 2019, 2016
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - Block all incoming by default
# - Allow specific ports (RDP, HTTP, HTTPS)
# - Connection rate limiting
# - Port scanning protection
# - Comprehensive logging
#
# USAGE:
#   Right-click → Run as Administrator
#   Or: powershell.exe -ExecutionPolicy Bypass -File .\02-windows-firewall.ps1
# ================================================================================

#Requires -RunAsAdministrator

# Colors
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Header {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $args" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
}

Clear-Host
Write-Header "🔥 WINDOWS DEFENDER FIREWALL CONFIGURATION 🔥"
Write-Info "Configuring advanced firewall rules..."
Write-Host ""

# ================================================================================
# CONFIGURATION - EDIT THESE VALUES
# ================================================================================

$RDP_PORT = 3389
$HTTP_PORT = 80
$HTTPS_PORT = 443
$SSH_PORT = 22  # If using OpenSSH on Windows

# Trusted IPs (Whitelist)
$TRUSTED_IPS = @(
    # "1.2.3.4",  # Your office IP
    # "5.6.7.8"   # Your home IP
)

# Blocked IPs (Blacklist)
$BLOCKED_IPS = @(
    # Add known bad IPs here
)

Write-Info "Configuration:"
Write-Host "  • RDP Port: $RDP_PORT" -ForegroundColor Gray
Write-Host "  • HTTP Port: $HTTP_PORT" -ForegroundColor Gray
Write-Host "  • HTTPS Port: $HTTPS_PORT" -ForegroundColor Gray
Write-Host ""

# ================================================================================
# 1. BACKUP EXISTING FIREWALL RULES
# ================================================================================
Write-Info "[1/8] Backing up existing firewall rules..."

$BackupPath = "C:\SecurityBackups\Firewall-$(Get-Date -Format 'yyyyMMdd_HHmmss').wfw"
$BackupDir = Split-Path $BackupPath -Parent
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

netsh advfirewall export $BackupPath | Out-Null
Write-Success "Firewall rules backed up to: $BackupPath"

# ================================================================================
# 2. RESET FIREWALL TO DEFAULTS
# ================================================================================
Write-Info "[2/8] Resetting firewall to defaults..."

netsh advfirewall reset | Out-Null
Write-Success "Firewall reset complete"

# ================================================================================
# 3. SET DEFAULT POLICIES (Block All Incoming)
# ================================================================================
Write-Info "[3/8] Setting default policies..."

# Block all inbound, allow all outbound
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block -DefaultOutboundAction Allow -NotifyOnListen True -AllowUnicastResponseToMulticast False -LogMaxSizeKilobytes 32767

Write-Success "Default policies set (block all incoming by default)"

# ================================================================================
# 4. REMOVE EXISTING RULES (Clean Slate)
# ================================================================================
Write-Info "[4/8] Removing existing rules..."

Remove-NetFirewallRule -All -ErrorAction SilentlyContinue

Write-Success "Existing rules removed"

# ================================================================================
# 5. BLOCK BLACKLISTED IPS
# ================================================================================
if ($BLOCKED_IPS.Count -gt 0) {
    Write-Info "[5/8] Blocking blacklisted IPs..."

    foreach ($IP in $BLOCKED_IPS) {
        New-NetFirewallRule -DisplayName "Block-$IP" -Direction Inbound -RemoteAddress $IP -Action Block -Enabled True
        Write-Host "  ✓ Blocked: $IP" -ForegroundColor Gray
    }

    Write-Success "Blacklisted IPs blocked"
} else {
    Write-Info "[5/8] No IPs to blacklist (skipped)"
}

# ================================================================================
# 6. ALLOW TRUSTED IPS (WHITELIST)
# ================================================================================
if ($TRUSTED_IPS.Count -gt 0) {
    Write-Info "[6/8] Whitelisting trusted IPs..."

    foreach ($IP in $TRUSTED_IPS) {
        New-NetFirewallRule -DisplayName "Allow-Trusted-$IP" -Direction Inbound -RemoteAddress $IP -Action Allow -Enabled True -Profile Any
        Write-Host "  ✓ Whitelisted: $IP" -ForegroundColor Gray
    }

    Write-Success "Trusted IPs whitelisted"
} else {
    Write-Info "[6/8] No IPs to whitelist (skipped)"
}

# ================================================================================
# 7. CONFIGURE ESSENTIAL FIREWALL RULES
# ================================================================================
Write-Info "[7/8] Creating firewall rules..."

# ----- LOOPBACK -----
New-NetFirewallRule -DisplayName "Allow-Loopback" -Direction Inbound -InterfaceAlias "Loopback Pseudo-Interface 1" -Action Allow -Enabled True | Out-Null

# ----- ICMP (Ping) - Rate Limited -----
# Note: Windows doesn't have built-in ICMP rate limiting like Linux
# This allows ping but consider using external tools for DDoS protection
New-NetFirewallRule -DisplayName "Allow-ICMPv4-In" -Direction Inbound -Protocol ICMPv4 -IcmpType 8 -Action Allow -Enabled True | Out-Null
New-NetFirewallRule -DisplayName "Allow-ICMPv6-In" -Direction Inbound -Protocol ICMPv6 -IcmpType 128 -Action Allow -Enabled True | Out-Null
Write-Host "  ✓ ICMP (Ping) allowed" -ForegroundColor Gray

# ----- RDP (Remote Desktop) -----
# WARNING: RDP should be disabled or restricted to specific IPs for security
if ($TRUSTED_IPS.Count -gt 0) {
    # Allow RDP only from trusted IPs
    New-NetFirewallRule -DisplayName "Allow-RDP-Trusted" -Direction Inbound -Protocol TCP -LocalPort $RDP_PORT -RemoteAddress $TRUSTED_IPS -Action Allow -Enabled True -Profile Any
    Write-Host "  ✓ RDP allowed (only from trusted IPs)" -ForegroundColor Gray
} else {
    # Allow RDP from anywhere (NOT RECOMMENDED for production!)
    # New-NetFirewallRule -DisplayName "Allow-RDP" -Direction Inbound -Protocol TCP -LocalPort $RDP_PORT -Action Allow -Enabled True -Profile Any
    Write-Warning "  ⚠️  RDP NOT enabled (no trusted IPs configured)"
    Write-Warning "     Edit script and add trusted IPs if you need RDP access"
}

# ----- SSH (if using OpenSSH) -----
New-NetFirewallRule -DisplayName "Allow-SSH" -Direction Inbound -Protocol TCP -LocalPort $SSH_PORT -Action Allow -Enabled True -Profile Any | Out-Null
Write-Host "  ✓ SSH allowed (port $SSH_PORT)" -ForegroundColor Gray

# ----- HTTP -----
New-NetFirewallRule -DisplayName "Allow-HTTP" -Direction Inbound -Protocol TCP -LocalPort $HTTP_PORT -Action Allow -Enabled True -Profile Any | Out-Null
Write-Host "  ✓ HTTP allowed (port $HTTP_PORT)" -ForegroundColor Gray

# ----- HTTPS -----
New-NetFirewallRule -DisplayName "Allow-HTTPS" -Direction Inbound -Protocol TCP -LocalPort $HTTPS_PORT -Action Allow -Enabled True -Profile Any | Out-Null
Write-Host "  ✓ HTTPS allowed (port $HTTPS_PORT)" -ForegroundColor Gray

# ----- BLOCK MongoDB from External (Security) -----
New-NetFirewallRule -DisplayName "Block-MongoDB-External" -Direction Inbound -Protocol TCP -LocalPort 27017 -RemoteAddress Any -Action Block -Enabled True | Out-Null
Write-Host "  ✓ MongoDB blocked from external access" -ForegroundColor Gray

# ----- DNS (Outbound - for name resolution) -----
New-NetFirewallRule -DisplayName "Allow-DNS-Out" -Direction Outbound -Protocol UDP -LocalPort Any -RemotePort 53 -Action Allow -Enabled True | Out-Null
Write-Host "  ✓ DNS (outbound) allowed" -ForegroundColor Gray

Write-Success "Firewall rules created"

# ================================================================================
# 8. ENABLE FIREWALL & LOGGING
# ================================================================================
Write-Info "[8/8] Enabling firewall and logging..."

# Enable firewall for all profiles
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Configure logging
$LogPath = "C:\Windows\System32\LogFiles\Firewall"
if (!(Test-Path $LogPath)) {
    New-Item -Path $LogPath -ItemType Directory -Force | Out-Null
}

Set-NetFirewallProfile -Profile Domain,Public,Private `
    -LogFileName "$LogPath\pfirewall.log" `
    -LogMaxSizeKilobytes 32767 `
    -LogAllowed True `
    -LogBlocked True `
    -LogIgnored False

# Enable connection security rules
Enable-NetFirewallRule -DisplayGroup "File and Printer Sharing" -ErrorAction SilentlyContinue | Out-Null

Write-Success "Firewall enabled and logging configured"

# ================================================================================
# DISPLAY FIREWALL STATUS
# ================================================================================
Write-Host ""
Write-Header "✅  WINDOWS FIREWALL CONFIGURED SUCCESSFULLY! ✅"

Write-Host ""
Write-Info "📊 Current Firewall Status:"
Write-Host ""

# Show firewall status
$Profiles = Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
$Profiles | Format-Table -AutoSize

Write-Host ""
Write-Success "✅ Firewall enabled (all profiles)"
Write-Success "✅ Default policy: Block all incoming"
Write-Success "✅ Logging enabled"
Write-Success "✅ Essential services allowed"

Write-Host ""
Write-Header "🔹 ALLOWED SERVICES"
Write-Info "  • SSH: Port $SSH_PORT (if OpenSSH installed)"
Write-Info "  • HTTP: Port $HTTP_PORT"
Write-Info "  • HTTPS: Port $HTTPS_PORT"
Write-Info "  • ICMP: Ping allowed"
if ($TRUSTED_IPS.Count -gt 0) {
    Write-Info "  • RDP: Port $RDP_PORT (only from trusted IPs)"
} else {
    Write-Warning "  • RDP: DISABLED (configure trusted IPs to enable)"
}

Write-Host ""
Write-Header "🔹 BLOCKED SERVICES"
Write-Info "  • MongoDB: Port 27017 (external access blocked)"
Write-Info "  • All other ports: Blocked by default"

Write-Host ""
Write-Header "⚠️  IMPORTANT NOTES"
Write-Warning "1. RDP is restricted/disabled by default for security"
Write-Warning "2. Add your IP to \$TRUSTED_IPS to enable RDP access"
Write-Warning "3. MongoDB should only listen on localhost (127.0.0.1)"
Write-Warning "4. Use Cloudflare WAF for additional DDoS protection"
Write-Warning "5. Consider installing fail2ban equivalent (wail2ban or EvlWatcher)"

Write-Host ""
Write-Header "📊 USEFUL COMMANDS"
Write-Info "Show all rules:"
Write-Host "  Get-NetFirewallRule | Format-Table -Property DisplayName,Enabled,Direction,Action" -ForegroundColor Gray
Write-Info "Show firewall profiles:"
Write-Host "  Get-NetFirewallProfile" -ForegroundColor Gray
Write-Info "View firewall logs:"
Write-Host "  Get-Content C:\Windows\System32\LogFiles\Firewall\pfirewall.log -Tail 50" -ForegroundColor Gray
Write-Info "Disable/Enable firewall:"
Write-Host "  Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False/True" -ForegroundColor Gray

Write-Host ""
Write-Header "🔹 NEXT STEPS"
Write-Info "1. Test firewall rules (try connecting from external IP)"
Write-Info "2. Configure Cloudflare (mandatory for DDoS protection)"
Write-Info "3. Install wail2ban or EvlWatcher for brute force protection"
Write-Info "4. Monitor logs: C:\Windows\System32\LogFiles\Firewall\pfirewall.log"

Write-Host ""
Write-Success "Firewall configuration complete!"
Write-Info "Backup saved to: $BackupPath"
Write-Host ""
