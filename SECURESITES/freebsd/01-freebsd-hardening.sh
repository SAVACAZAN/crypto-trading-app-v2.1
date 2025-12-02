#!/bin/sh

################################################################################
# FreeBSD 14.x Server Hardening Script
#
# Purpose: Complete system hardening for FreeBSD production servers
# Target: FreeBSD 14.x (works on 13.x+)
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - System updates & security patches
# - Kernel hardening (sysctl)
# - Network stack hardening (superior to Linux)
# - DDoS protection (SYN flood, ICMP, UDP)
# - Remove unnecessary services
# - Configure security level
#
# USAGE:
#   chmod +x 01-freebsd-hardening.sh
#   ./01-freebsd-hardening.sh
#
# WARNING: This script will modify system settings. Backup first!
################################################################################

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo "ERROR: This script must be run as root" 1>&2
   exit 1
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       🛡️  FREEBSD 14 SERVER HARDENING SCRIPT 🛡️          ║"
echo "║                                                            ║"
echo "║         The Most Secure Operating System on Earth         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Create backup directory
BACKUP_DIR="/root/security-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "✅ Backup directory created: $BACKUP_DIR"

# ============================================================================
# 1. SYSTEM UPDATES
# ============================================================================
echo ""
echo "[1/10] Updating FreeBSD system..."
freebsd-update fetch install
pkg update
pkg upgrade -y
echo "✅ System updated"

# ============================================================================
# 2. INSTALL ESSENTIAL SECURITY PACKAGES
# ============================================================================
echo ""
echo "[2/10] Installing security packages..."
pkg install -y \
    sudo \
    bash \
    vim \
    git \
    htop \
    curl \
    wget \
    nmap \
    tcpdump \
    iftop \
    py39-fail2ban \
    security/aide \
    security/tripwire \
    security/chkrootkit \
    security/logcheck \
    net-mgmt/netdata

echo "✅ Security packages installed"

# ============================================================================
# 3. KERNEL HARDENING (sysctl) - FreeBSD Superior Configuration
# ============================================================================
echo ""
echo "[3/10] Hardening kernel parameters (sysctl)..."

# Backup original sysctl.conf
cp /etc/sysctl.conf "$BACKUP_DIR/sysctl.conf.backup"

# Create FreeBSD hardened sysctl configuration
cat > /etc/sysctl.conf <<'EOF'
# ========================================
# FREEBSD KERNEL HARDENING & DDOS PROTECTION
# ========================================

# ----- SECURITY LEVEL -----
# Set to 1 for production (files immutable, kernel modules locked)
# Set to -1 for development (allows all changes)
# kern.securelevel=1

# ----- IP FORWARDING -----
# Disable IP forwarding (unless needed for routing/VPN)
net.inet.ip.forwarding=0
net.inet6.ip6.forwarding=0

# ----- SYN FLOOD PROTECTION (Superior to Linux) -----
# Enable SYN cookies
net.inet.tcp.syncookies=1

# SYN cache and backlog
net.inet.tcp.syncache.hashsize=1024
net.inet.tcp.syncache.bucketlimit=100
net.inet.tcp.syncache.cachelimit=65535

# Increase listen queue
kern.ipc.soacceptqueue=1024
kern.ipc.maxsockbuf=16777216

# TCP SYN/ACK retries
net.inet.tcp.syncache.rexmtlimit=0

# ----- ICMP / PING FLOOD PROTECTION -----
# Limit ICMP responses
net.inet.icmp.icmplim=50
net.inet.icmp.icmplim_output=0

# Drop redirects
net.inet.icmp.drop_redirect=1
net.inet.ip.redirect=0
net.inet6.icmp6.rediraccept=0

# Ignore broadcast pings
net.inet.icmp.bmcastecho=0

# ----- IP SPOOFING PROTECTION -----
# Enable source address verification (anti-spoofing)
net.inet.ip.check_interface=1

# Log packets with impossible addresses
net.inet.ip.log_in_vain=1
net.inet.tcp.log_in_vain=1

# ----- TCP HARDENING (FreeBSD is THE BEST at this) -----
# TCP connection timeouts
net.inet.tcp.keepinit=30000
net.inet.tcp.keepidle=120000
net.inet.tcp.keepintvl=10000
net.inet.tcp.always_keepalive=0

# Reduce TIME_WAIT
net.inet.tcp.msl=5000

# TCP window scaling
net.inet.tcp.rfc1323=1
net.inet.tcp.sendbuf_max=16777216
net.inet.tcp.recvbuf_max=16777216

# TCP Fast Open
net.inet.tcp.fastopen.server_enable=1
net.inet.tcp.fastopen.client_enable=1

# Disable ECN (can cause issues)
net.inet.tcp.ecn.enable=0

# Protect against TCP time-wait assassination
net.inet.tcp.drop_synfin=1

# Blackhole (drop packets to closed ports - anti port scan)
net.inet.tcp.blackhole=2
net.inet.udp.blackhole=1

# ----- UDP HARDP PROTECTION -----
# Limit UDP checksums
net.inet.udp.checksum=1

# ----- ROUTING & REDIRECTS -----
# Ignore and don't send redirects
net.inet.ip.redirect=0
net.inet.ip.accept_sourceroute=0
net.inet6.ip6.redirect=0
net.inet6.ip6.accept_rtadv=0

# ----- CONNECTION LIMITS -----
# Maximum number of sockets
kern.ipc.somaxconn=4096
kern.ipc.maxsockets=204800

# ----- MEMORY PROTECTION -----
# Randomize memory (ASLR)
kern.elf64.aslr.enable=1
kern.elf64.aslr.pie_enable=1
kern.elf64.aslr.honor_sbrk=1
kern.elf32.aslr.enable=1

# ----- KERNEL SECURITY -----
# Restrict kernel info
security.bsd.see_other_uids=0
security.bsd.see_other_gids=0
security.bsd.see_jail_proc=0
security.bsd.unprivileged_read_msgbuf=0
security.bsd.unprivileged_proc_debug=0
security.bsd.stack_guard_page=1

# Hardlink protection
security.bsd.hardlink_check_uid=1
security.bsd.hardlink_check_gid=1

# ----- FILE SYSTEM -----
# Disable SUID core dumps
kern.sugid_coredump=0
kern.coredump=0

# ----- SHARED MEMORY -----
kern.ipc.shm_use_phys=1

# ----- PERFORMANCE TUNING -----
# Network buffer sizes
net.inet.tcp.sendspace=262144
net.inet.tcp.recvspace=262144
net.local.stream.sendspace=16384
net.local.stream.recvspace=16384

# Network mbuf clusters
kern.ipc.nmbufs=262144
kern.ipc.nmbclusters=262144

# ----- IPv6 (disable if not needed) -----
# net.inet6.ip6.auto_linklocal=0
EOF

# Apply sysctl settings
sysctl -f /etc/sysctl.conf

echo "✅ Kernel hardened (sysctl applied)"

# ============================================================================
# 4. CONFIGURE RC.CONF (Boot Configuration)
# ============================================================================
echo ""
echo "[4/10] Configuring boot parameters (rc.conf)..."

# Backup rc.conf
cp /etc/rc.conf "$BACKUP_DIR/rc.conf.backup"

# Add security settings to rc.conf
cat >> /etc/rc.conf <<'EOF'

# ===== SECURITY SETTINGS =====
# Clear /tmp on boot
clear_tmp_enable="YES"

# Disable sendmail (use alternative MTA if needed)
sendmail_enable="NONE"
sendmail_submit_enable="NO"
sendmail_outbound_enable="NO"
sendmail_msp_queue_enable="NO"

# Enable firewall (pf)
pf_enable="YES"
pf_rules="/etc/pf.conf"
pf_flags=""
pflog_enable="YES"
pflog_logfile="/var/log/pflog"

# Enable fail2ban
fail2ban_enable="YES"

# Enable syslog remote logging (optional)
# syslogd_flags="-ss"

# Disable unnecessary services
inetd_enable="NO"
portmap_enable="NO"
nfs_client_enable="NO"
nfs_server_enable="NO"

# Network tuning
ifconfig_DEFAULT="SYNCDHCP -tso -lro"
EOF

echo "✅ Boot configuration optimized"

# ============================================================================
# 5. CONFIGURE LOGIN SECURITY
# ============================================================================
echo ""
echo "[5/10] Configuring login security..."

# Backup login.conf
cp /etc/login.conf "$BACKUP_DIR/login.conf.backup"

# Set password hashing to blowfish
sed -i.bak 's/:passwd_format=sha512:/:passwd_format=blf:/' /etc/login.conf

# Rebuild login.conf database
cap_mkdb /etc/login.conf

echo "✅ Login security configured (blowfish hashing)"

# ============================================================================
# 6. CONFIGURE SSHD HARDENING
# ============================================================================
echo ""
echo "[6/10] Hardening SSH configuration..."

# Backup sshd_config
cp /etc/ssh/sshd_config "$BACKUP_DIR/sshd_config.backup"

# Apply SSH hardening
cat >> /etc/ssh/sshd_config <<'EOF'

# ===== SSH HARDENING =====
# Disable root login (use sudo instead)
PermitRootLogin no

# Key-based authentication only
PubkeyAuthentication yes
PasswordAuthentication no
ChallengeResponseAuthentication no
PermitEmptyPasswords no

# Protocol version
Protocol 2

# Use strong ciphers only
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group-exchange-sha256

# Connection limits
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30

# Disable unnecessary features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Banner
Banner /etc/ssh/banner
EOF

# Create SSH banner
cat > /etc/ssh/banner <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║                    AUTHORIZED ACCESS ONLY                    ║
║                                                              ║
║  Unauthorized access is prohibited. All activities are       ║
║  monitored and logged. Violators will be prosecuted.        ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo "✅ SSH hardened (restart sshd to apply)"

# ============================================================================
# 7. CONFIGURE PERIODIC SECURITY CHECKS
# ============================================================================
echo ""
echo "[7/10] Configuring automated security checks..."

cat > /etc/periodic.conf <<'EOF'
# Daily security checks
daily_status_security_enable="YES"
daily_status_security_inline="YES"
daily_status_security_output="root"

# File integrity checks
daily_status_security_chksetuid_enable="YES"
daily_status_security_chkportsum_enable="YES"

# Network checks
daily_status_network_enable="YES"
daily_status_network_usedns="NO"

# Disk checks
daily_status_disks_enable="YES"

# Clean /tmp
daily_clean_tmps_enable="YES"
daily_clean_tmps_dirs="/tmp /var/tmp"
daily_clean_tmps_days="3"

# Backup
daily_backup_passwd_enable="YES"
daily_backup_aliases_enable="YES"
EOF

echo "✅ Automated security checks configured"

# ============================================================================
# 8. DISABLE UNNECESSARY SERVICES
# ============================================================================
echo ""
echo "[8/10] Disabling unnecessary services..."

# Stop and disable services
SERVICES_TO_DISABLE="sendmail inetd portmap"

for service in $SERVICES_TO_DISABLE; do
    if service $service status > /dev/null 2>&1; then
        service $service stop > /dev/null 2>&1
        echo "  ✓ Stopped: $service"
    fi
done

echo "✅ Unnecessary services disabled"

# ============================================================================
# 9. CONFIGURE FILE PERMISSIONS
# ============================================================================
echo ""
echo "[9/10] Securing file permissions..."

# Secure sensitive files
chmod 600 /etc/ssh/sshd_config
chmod 600 /etc/pf.conf
chmod 700 /root
chmod 600 /boot/loader.conf

# Secure system directories
chmod -R go-w /etc
chmod -R go-w /usr/local/etc

echo "✅ File permissions secured"

# ============================================================================
# 10. FINAL STEPS
# ============================================================================
echo ""
echo "[10/10] Final cleanup and checks..."

# Update locate database
/usr/libexec/locate.updatedb &

# Check for rootkits
chkrootkit > /tmp/chkrootkit.log 2>&1 &

echo "✅ Cleanup complete"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ✅  FREEBSD HARDENING COMPLETED SUCCESSFULLY! ✅    ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ FreeBSD hardening completed!"
echo "✅ Kernel parameters optimized (superior to Linux)"
echo "✅ DDoS protection enabled (best in class)"
echo "✅ SSH hardened"
echo "✅ Unnecessary services disabled"
echo "✅ Security checks automated"
echo ""
echo "📁 Backups saved to: $BACKUP_DIR"
echo ""
echo "🔹 NEXT STEPS:"
echo "  1. Run: ./02-pf-firewall.sh"
echo "  2. Configure fail2ban"
echo "  3. Setup jails (if using containers)"
echo "  4. Test SSH key authentication"
echo ""
echo "⚠️  IMPORTANT:"
echo "  • SSH: Configure keys BEFORE disabling password auth"
echo "  • Restart: Run 'shutdown -r now' to apply all changes"
echo "  • PF Firewall: Will be configured in next script"
echo ""
echo "🛡️  FreeBSD is now one of the most secure servers on the planet!"
echo ""
