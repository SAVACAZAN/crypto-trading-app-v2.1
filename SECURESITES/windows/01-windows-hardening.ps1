# ================================================================================
# Windows Server 2022/2019 Hardening Script
#
# Purpose: Complete system hardening for Windows production servers
# Target: Windows Server 2022, 2019, 2016
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - Windows Updates automation
# - Security policy hardening
# - Network stack hardening
# - DDoS protection (SYN flood, port scanning)
# - Disable unnecessary services
# - Windows Defender configuration
# - Registry hardening
#
# USAGE:
#   Right-click → Run as Administrator
#   Or: powershell.exe -ExecutionPolicy Bypass -File .\01-windows-hardening.ps1
#
# WARNING: This script will modify system settings. Backup first!
# ================================================================================

#Requires -RunAsAdministrator

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Header {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $args" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
}

Clear-Host
Write-Header "🛡️  WINDOWS SERVER HARDENING SCRIPT 🛡️"
Write-Info "Starting Windows Server security hardening..."
Write-Info "This may take 10-15 minutes..."
Write-Host ""

# Create backup directory
$BackupDir = "C:\SecurityBackups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Write-Success "Backup directory created: $BackupDir"

# ================================================================================
# 1. WINDOWS UPDATE CONFIGURATION
# ================================================================================
Write-Info "[1/12] Configuring Windows Updates..."

# Enable automatic updates
$AUSettings = (New-Object -ComObject Microsoft.Update.AutoUpdate).Settings
$AUSettings.NotificationLevel = 4  # Download and install automatically
$AUSettings.Save()

# Install PSWindowsUpdate module if not present
if (!(Get-Module -ListAvailable -Name PSWindowsUpdate)) {
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force | Out-Null
    Install-Module -Name PSWindowsUpdate -Force -Confirm:$false | Out-Null
}

Write-Success "Windows Update configured (automatic updates enabled)"

# ================================================================================
# 2. WINDOWS DEFENDER CONFIGURATION
# ================================================================================
Write-Info "[2/12] Configuring Windows Defender..."

# Enable Windows Defender
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false
Set-MpPreference -DisableBlockAtFirstSeen $false
Set-MpPreference -DisableIOAVProtection $false
Set-MpPreference -DisableScriptScanning $false

# Enable cloud protection
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# Enable network protection
Set-MpPreference -EnableNetworkProtection Enabled

# Enable controlled folder access (ransomware protection)
Set-MpPreference -EnableControlledFolderAccess Enabled

# Update definitions
Update-MpSignature -ErrorAction SilentlyContinue

Write-Success "Windows Defender configured and updated"

# ================================================================================
# 3. NETWORK STACK HARDENING (Registry)
# ================================================================================
Write-Info "[3/12] Hardening network stack (TCP/IP)..."

$NetworkPath = "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters"

# SYN Flood Protection
Set-ItemProperty -Path $NetworkPath -Name "SynAttackProtect" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $NetworkPath -Name "TcpMaxPortsExhausted" -Value 5 -Type DWord -Force
Set-ItemProperty -Path $NetworkPath -Name "TcpMaxHalfOpen" -Value 100 -Type DWord -Force
Set-ItemProperty -Path $NetworkPath -Name "TcpMaxHalfOpenRetried" -Value 80 -Type DWord -Force

# Enable TCP timestamps (RFC 1323)
Set-ItemProperty -Path $NetworkPath -Name "Tcp1323Opts" -Value 1 -Type DWord -Force

# Disable IP source routing (anti-spoofing)
Set-ItemProperty -Path $NetworkPath -Name "DisableIPSourceRouting" -Value 2 -Type DWord -Force
Set-ItemProperty -Path $NetworkPath -Name "EnableICMPRedirect" -Value 0 -Type DWord -Force

# Reduce KeepAliveTime
Set-ItemProperty -Path $NetworkPath -Name "KeepAliveTime" -Value 300000 -Type DWord -Force

# Reduce time-wait
Set-ItemProperty -Path $NetworkPath -Name "TcpTimedWaitDelay" -Value 30 -Type DWord -Force

# Enable dead gateway detection
Set-ItemProperty -Path $NetworkPath -Name "EnableDeadGWDetect" -Value 0 -Type DWord -Force

# Disable NetBIOS over TCP/IP
$Adapters = Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled }
foreach ($Adapter in $Adapters) {
    $Adapter.SetTcpipNetbios(2) | Out-Null  # 2 = Disable
}

Write-Success "Network stack hardened (SYN flood protection enabled)"

# ================================================================================
# 4. DISABLE SMBv1 (Security Risk)
# ================================================================================
Write-Info "[4/12] Disabling SMBv1..."

Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart -ErrorAction SilentlyContinue | Out-Null
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force -ErrorAction SilentlyContinue

Write-Success "SMBv1 disabled (WannaCry/NotPetya protection)"

# ================================================================================
# 5. DISABLE UNNECESSARY SERVICES
# ================================================================================
Write-Info "[5/12] Disabling unnecessary services..."

$ServicesToDisable = @(
    "RemoteRegistry",
    "HomeGroupListener",
    "HomeGroupProvider",
    "XblAuthManager",
    "XblGameSave",
    "XboxNetApiSvc"
)

foreach ($Service in $ServicesToDisable) {
    if (Get-Service -Name $Service -ErrorAction SilentlyContinue) {
        Stop-Service -Name $Service -Force -ErrorAction SilentlyContinue
        Set-Service -Name $Service -StartupType Disabled -ErrorAction SilentlyContinue
        Write-Host "  ✓ Disabled: $Service" -ForegroundColor Gray
    }
}

Write-Success "Unnecessary services disabled"

# ================================================================================
# 6. CONFIGURE AUDIT POLICIES
# ================================================================================
Write-Info "[6/12] Configuring audit policies..."

# Enable security auditing
auditpol /set /category:"Account Logon" /success:enable /failure:enable | Out-Null
auditpol /set /category:"Account Management" /success:enable /failure:enable | Out-Null
auditpol /set /category:"Logon/Logoff" /success:enable /failure:enable | Out-Null
auditpol /set /category:"Policy Change" /success:enable /failure:enable | Out-Null
auditpol /set /category:"Privilege Use" /success:enable /failure:enable | Out-Null
auditpol /set /category:"System" /success:enable /failure:enable | Out-Null

Write-Success "Audit policies configured (logging enabled)"

# ================================================================================
# 7. CONFIGURE PASSWORD POLICY
# ================================================================================
Write-Info "[7/12] Hardening password policy..."

# Export current policy
secedit /export /cfg "$BackupDir\secpol.cfg" | Out-Null

# Create hardened policy
$PolicyContent = @"
[System Access]
MinimumPasswordAge = 1
MaximumPasswordAge = 90
MinimumPasswordLength = 12
PasswordComplexity = 1
PasswordHistorySize = 24
LockoutBadCount = 5
LockoutDuration = 30
ResetLockoutCount = 30
ClearTextPassword = 0

[Event Audit]
AuditSystemEvents = 3
AuditLogonEvents = 3
AuditObjectAccess = 3
AuditPrivilegeUse = 3
AuditPolicyChange = 3
AuditAccountManage = 3
AuditProcessTracking = 0
AuditDSAccess = 3
AuditAccountLogon = 3

[Registry Values]
MACHINE\System\CurrentControlSet\Control\Lsa\NoLMHash=4,1
MACHINE\System\CurrentControlSet\Control\Lsa\RestrictAnonymousSAM=4,1
MACHINE\System\CurrentControlSet\Control\Lsa\RestrictAnonymous=4,1
MACHINE\System\CurrentControlSet\Control\Lsa\LimitBlankPasswordUse=4,1
MACHINE\System\CurrentControlSet\Services\LanmanServer\Parameters\RequireSecuritySignature=4,1
"@

$PolicyContent | Out-File "$BackupDir\hardened-policy.inf" -Encoding ASCII -Force

# Apply policy
secedit /configure /db secedit.sdb /cfg "$BackupDir\hardened-policy.inf" /areas SECURITYPOLICY | Out-Null
gpupdate /force | Out-Null

Write-Success "Password policy hardened (12 char min, 90 day expiry, 5 attempt lockout)"

# ================================================================================
# 8. DISABLE POWERSHELL V2 (Security Risk)
# ================================================================================
Write-Info "[8/12] Disabling PowerShell v2..."

Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2 -NoRestart -ErrorAction SilentlyContinue | Out-Null
Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root -NoRestart -ErrorAction SilentlyContinue | Out-Null

Write-Success "PowerShell v2 disabled (modern threat protection)"

# ================================================================================
# 9. CONFIGURE RDP SECURITY
# ================================================================================
Write-Info "[9/12] Hardening Remote Desktop (RDP)..."

$RDPPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server"

# Disable RDP (enable only if needed)
# Set-ItemProperty -Path $RDPPath -Name "fDenyTSConnections" -Value 1 -Type DWord -Force

# Enable Network Level Authentication (if RDP is enabled)
Set-ItemProperty -Path "$RDPPath\WinStations\RDP-Tcp" -Name "UserAuthentication" -Value 1 -Type DWord -Force

# Set strong encryption
Set-ItemProperty -Path "$RDPPath\WinStations\RDP-Tcp" -Name "MinEncryptionLevel" -Value 3 -Type DWord -Force

# Set idle timeout (15 minutes)
Set-ItemProperty -Path "$RDPPath\WinStations\RDP-Tcp" -Name "MaxIdleTime" -Value 900000 -Type DWord -Force

Write-Success "RDP hardened (NLA enabled, strong encryption)"

# ================================================================================
# 10. DISABLE AUTORUN/AUTOPLAY
# ================================================================================
Write-Info "[10/12] Disabling AutoRun/AutoPlay..."

$AutorunPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
if (!(Test-Path $AutorunPath)) {
    New-Item -Path $AutorunPath -Force | Out-Null
}

Set-ItemProperty -Path $AutorunPath -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord -Force
Set-ItemProperty -Path $AutorunPath -Name "NoAutorun" -Value 1 -Type DWord -Force

Write-Success "AutoRun/AutoPlay disabled (USB malware protection)"

# ================================================================================
# 11. ENABLE UAC (User Access Control)
# ================================================================================
Write-Info "[11/12] Configuring UAC..."

$UACPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"
Set-ItemProperty -Path $UACPath -Name "EnableLUA" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $UACPath -Name "ConsentPromptBehaviorAdmin" -Value 2 -Type DWord -Force
Set-ItemProperty -Path $UACPath -Name "PromptOnSecureDesktop" -Value 1 -Type DWord -Force

Write-Success "UAC enabled and configured"

# ================================================================================
# 12. CONFIGURE WINDOWS FIREWALL LOG
# ================================================================================
Write-Info "[12/12] Configuring firewall logging..."

$LogPath = "C:\Windows\System32\LogFiles\Firewall"
if (!(Test-Path $LogPath)) {
    New-Item -Path $LogPath -ItemType Directory -Force | Out-Null
}

# Enable logging for all profiles
Set-NetFirewallProfile -Profile Domain,Public,Private -LogFileName "$LogPath\pfirewall.log" -LogMaxSizeKilobytes 32767 -LogAllowed True -LogBlocked True

Write-Success "Firewall logging enabled"

# ================================================================================
# FINAL SUMMARY
# ================================================================================
Write-Host ""
Write-Header "✅  WINDOWS SERVER HARDENING COMPLETED SUCCESSFULLY! ✅"

Write-Success "System hardening completed!"
Write-Success "Network stack hardened (SYN flood protection)"
Write-Success "Windows Defender configured"
Write-Success "Password policy strengthened"
Write-Success "Unnecessary services disabled"
Write-Success "Audit logging enabled"
Write-Success "RDP secured"
Write-Success "AutoRun disabled"

Write-Host ""
Write-Info "📁 Backups saved to: $BackupDir"
Write-Host ""
Write-Header "🔹 NEXT STEPS"
Write-Info "1. Run: .\02-windows-firewall.ps1"
Write-Info "2. Configure Cloudflare (see docs)"
Write-Info "3. Install fail2ban equivalent (wail2ban or EvlWatcher)"
Write-Info "4. Test RDP connection if enabled"
Write-Host ""
Write-Warning "⚠️  REBOOT REQUIRED for all changes to take effect!"
Write-Info "   Run: shutdown /r /t 60  (reboot in 60 seconds)"
Write-Host ""

# Optional: Auto-reboot prompt
$Reboot = Read-Host "Would you like to reboot now? (Y/N)"
if ($Reboot -eq "Y" -or $Reboot -eq "y") {
    Write-Info "Rebooting in 60 seconds... (Cancel with: shutdown /a)"
    shutdown /r /t 60 /c "System hardening complete - reboot required"
}

Write-Host ""
Write-Success "Script completed successfully!"
Write-Host ""
