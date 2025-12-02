#!/bin/bash

################################################################################
# Ubuntu 22.04 LTS Server Hardening Script
#
# Purpose: Complete system hardening for production servers
# Target: Ubuntu 22.04 (works on 20.04+ and Debian 11+)
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - System updates & security patches
# - Kernel hardening (sysctl)
# - Network stack hardening
# - DDoS protection (SYN flood, ICMP, UDP)
# - Remove unnecessary packages
# - Disable unused services
# - Configure automatic security updates
#
# USAGE:
#   chmod +x 01-ubuntu-hardening.sh
#   sudo ./01-ubuntu-hardening.sh
#
# WARNING: This script will modify system settings. Backup first!
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ ERROR: Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║       🛡️  UBUNTU 22.04 SERVER HARDENING SCRIPT 🛡️        ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║            Securing your server against attacks            ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create backup directory
BACKUP_DIR="/root/security-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup directory created: $BACKUP_DIR${NC}"

# ============================================================================
# 1. SYSTEM UPDATES
# ============================================================================
echo -e "\n${YELLOW}[1/10] Updating system packages...${NC}"
apt update -qq
apt upgrade -y -qq
apt dist-upgrade -y -qq
echo -e "${GREEN}✅ System updated${NC}"

# ============================================================================
# 2. INSTALL ESSENTIAL SECURITY PACKAGES
# ============================================================================
echo -e "\n${YELLOW}[2/10] Installing security packages...${NC}"
apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    logwatch \
    rkhunter \
    chkrootkit \
    aide \
    iptables-persistent \
    netfilter-persistent \
    curl \
    wget \
    htop \
    iotop \
    iftop \
    net-tools \
    dnsutils \
    tcpdump \
    nmap \
    git \
    vim \
    2>&1 | grep -v "already"

echo -e "${GREEN}✅ Security packages installed${NC}"

# ============================================================================
# 3. KERNEL HARDENING (sysctl)
# ============================================================================
echo -e "\n${YELLOW}[3/10] Hardening kernel parameters...${NC}"

# Backup original sysctl.conf
cp /etc/sysctl.conf "$BACKUP_DIR/sysctl.conf.backup"

# Create new hardened sysctl configuration
cat > /etc/sysctl.d/99-security-hardening.conf <<'EOF'
# ========================================
# KERNEL HARDENING & DDOS PROTECTION
# ========================================

# ----- IP FORWARDING -----
# Disable IP forwarding (unless you need it for VPN/routing)
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# ----- SYN FLOOD PROTECTION -----
# Enable SYN cookies (protect against SYN flood attacks)
net.ipv4.tcp_syncookies = 1

# Increase SYN backlog
net.ipv4.tcp_max_syn_backlog = 4096

# Reduce SYN/ACK retries
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 2

# ----- ICMP / PING FLOOD PROTECTION -----
# Ignore ICMP ping requests (optional - may break monitoring)
# net.ipv4.icmp_echo_ignore_all = 1

# Ignore broadcast pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Rate limit ICMP
net.ipv4.icmp_ratelimit = 100
net.ipv4.icmp_ratemask = 88089

# ----- IP SPOOFING PROTECTION -----
# Enable source address verification (anti-spoofing)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Log suspicious packets (martians)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# ----- ROUTING & REDIRECTS -----
# Ignore ICMP redirects (MitM protection)
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Don't send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# ----- SOURCE ROUTING -----
# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# ----- TCP HARDENING -----
# Protect against time-wait assassination
net.ipv4.tcp_rfc1337 = 1

# Enable TCP Fast Open
net.ipv4.tcp_fastopen = 3

# Increase TCP buffer sizes for high-bandwidth
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864

# Increase netdev backlog
net.core.netdev_max_backlog = 5000

# TCP connection reuse
net.ipv4.tcp_tw_reuse = 1

# Reduce TIME_WAIT connections
net.ipv4.tcp_fin_timeout = 15

# Limit orphan sockets
net.ipv4.tcp_max_orphans = 16384

# ----- CONNECTION TRACKING -----
# Increase connection tracking table size
net.netfilter.nf_conntrack_max = 1000000
net.nf_conntrack_max = 1000000

# Reduce conntrack timeout
net.netfilter.nf_conntrack_tcp_timeout_established = 600

# ----- IPv6 SECURITY -----
# Disable IPv6 if not needed (uncomment to disable)
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1

# IPv6 router advertisements
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0

# ----- KERNEL SECURITY -----
# Enable ExecShield (if available)
kernel.exec-shield = 1

# Randomize memory addresses (ASLR)
kernel.randomize_va_space = 2

# Restrict kernel pointers in /proc
kernel.kptr_restrict = 2

# Restrict dmesg to root only
kernel.dmesg_restrict = 1

# Disable core dumps
fs.suid_dumpable = 0

# Increase PID max (for busy servers)
kernel.pid_max = 65536

# Restrict access to kernel logs
kernel.printk = 3 3 3 3

# ----- FILE SYSTEM -----
# Protect against symlink attacks
fs.protected_symlinks = 1
fs.protected_hardlinks = 1

# Increase file handles
fs.file-max = 2097152

# ----- SWAP -----
# Reduce swappiness (prefer RAM)
vm.swappiness = 10

# Cache pressure
vm.vfs_cache_pressure = 50
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/99-security-hardening.conf > /dev/null 2>&1
sysctl --system > /dev/null 2>&1

echo -e "${GREEN}✅ Kernel hardened (sysctl applied)${NC}"

# ============================================================================
# 4. DISABLE UNUSED NETWORK PROTOCOLS
# ============================================================================
echo -e "\n${YELLOW}[4/10] Disabling unused network protocols...${NC}"

cat > /etc/modprobe.d/disable-protocols.conf <<'EOF'
# Disable unused network protocols
install dccp /bin/true
install sctp /bin/true
install rds /bin/true
install tipc /bin/true
install bluetooth /bin/true
install usb-storage /bin/true
EOF

echo -e "${GREEN}✅ Unused protocols disabled${NC}"

# ============================================================================
# 5. CONFIGURE AUTOMATIC SECURITY UPDATES
# ============================================================================
echo -e "\n${YELLOW}[5/10] Configuring automatic security updates...${NC}"

cat > /etc/apt/apt.conf.d/50unattended-upgrades <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

systemctl enable unattended-upgrades
systemctl restart unattended-upgrades

echo -e "${GREEN}✅ Automatic security updates configured${NC}"

# ============================================================================
# 6. REMOVE UNNECESSARY PACKAGES
# ============================================================================
echo -e "\n${YELLOW}[6/10] Removing unnecessary packages...${NC}"

# Remove potentially dangerous packages
apt purge -y \
    telnet \
    rsh-client \
    rsh-redone-client \
    nis \
    ntpdate \
    2>&1 | grep -v "not installed"

apt autoremove -y -qq
apt autoclean -y -qq

echo -e "${GREEN}✅ Unnecessary packages removed${NC}"

# ============================================================================
# 7. DISABLE UNUSED SERVICES
# ============================================================================
echo -e "\n${YELLOW}[7/10] Disabling unused services...${NC}"

# List of services to disable (add/remove as needed)
SERVICES_TO_DISABLE=(
    "bluetooth.service"
    "cups.service"
    "avahi-daemon.service"
)

for service in "${SERVICES_TO_DISABLE[@]}"; do
    if systemctl is-enabled "$service" > /dev/null 2>&1; then
        systemctl disable "$service" > /dev/null 2>&1
        systemctl stop "$service" > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} Disabled: $service"
    fi
done

echo -e "${GREEN}✅ Unused services disabled${NC}"

# ============================================================================
# 8. CONFIGURE SHARED MEMORY
# ============================================================================
echo -e "\n${YELLOW}[8/10] Securing shared memory...${NC}"

# Backup fstab
cp /etc/fstab "$BACKUP_DIR/fstab.backup"

# Add shared memory protection
if ! grep -q "tmpfs /run/shm" /etc/fstab; then
    echo "tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0" >> /etc/fstab
    mount -o remount /run/shm
    echo -e "${GREEN}✅ Shared memory secured${NC}"
else
    echo -e "${YELLOW}⚠️  Shared memory already configured${NC}"
fi

# ============================================================================
# 9. CONFIGURE LOGWATCH
# ============================================================================
echo -e "\n${YELLOW}[9/10] Configuring log monitoring...${NC}"

cat > /etc/cron.daily/00logwatch <<'EOF'
#!/bin/bash
/usr/sbin/logwatch --output mail --mailto root --detail high
EOF

chmod +x /etc/cron.daily/00logwatch

echo -e "${GREEN}✅ Logwatch configured${NC}"

# ============================================================================
# 10. FINAL STEPS
# ============================================================================
echo -e "\n${YELLOW}[10/10] Final cleanup...${NC}"

# Update locate database
updatedb > /dev/null 2>&1

# Clear bash history (optional)
# history -c
# cat /dev/null > ~/.bash_history

echo -e "${GREEN}✅ Cleanup complete${NC}"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║              ✅  HARDENING COMPLETED SUCCESSFULLY! ✅       ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ System hardening completed!${NC}"
echo -e "${GREEN}✅ Kernel parameters optimized${NC}"
echo -e "${GREEN}✅ DDoS protection enabled${NC}"
echo -e "${GREEN}✅ Automatic updates configured${NC}"
echo -e "${GREEN}✅ Unnecessary services disabled${NC}"
echo ""
echo -e "${YELLOW}📁 Backups saved to: $BACKUP_DIR${NC}"
echo ""
echo -e "${BLUE}🔹 NEXT STEPS:${NC}"
echo -e "  1. Run: ${YELLOW}sudo ./02-firewall-ufw.sh${NC}"
echo -e "  2. Run: ${YELLOW}sudo ./03-fail2ban-setup.sh${NC}"
echo -e "  3. Run: ${YELLOW}sudo ./04-ssh-hardening.sh${NC}"
echo -e "  4. Configure Cloudflare (see docs)"
echo ""
echo -e "${RED}⚠️  REBOOT REQUIRED for all changes to take effect!${NC}"
echo -e "${YELLOW}   Run: sudo reboot${NC}"
echo ""
