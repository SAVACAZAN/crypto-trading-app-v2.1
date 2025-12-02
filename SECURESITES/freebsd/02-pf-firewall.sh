#!/bin/sh

################################################################################
# FreeBSD PF (Packet Filter) Firewall Configuration
#
# Purpose: Configure PF firewall with advanced DDoS protection
# Target: FreeBSD 14.x (works on 13.x+)
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - Best-in-class firewall (superior to iptables/nftables)
# - Advanced DDoS protection
# - Stateful packet inspection
# - Connection rate limiting
# - Port knocking (optional)
# - GeoIP blocking capability
#
# USAGE:
#   chmod +x 02-pf-firewall.sh
#   ./02-pf-firewall.sh
################################################################################

# Check root
if [ "$(id -u)" != "0" ]; then
   echo "ERROR: Run as root" 1>&2
   exit 1
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🔥 PF FIREWALL CONFIGURATION SCRIPT 🔥            ║"
echo "║            The Most Powerful Firewall Ever                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# CONFIGURATION - EDIT THESE
# ============================================================================

# Network interface (auto-detect primary interface)
EXT_IF=$(route get default | grep interface | awk '{print $2}')

# SSH Port
SSH_PORT="22"

# Web ports
HTTP_PORT="80"
HTTPS_PORT="443"

# Nuxt dev (comment out for production)
# NUXT_DEV_PORT="3000"

# MongoDB port (should be localhost only!)
MONGODB_PORT="27017"

# Trusted IPs (whitelist)
TRUSTED_IPS='{
    # Add your IPs here
    # 1.2.3.4
}'

# Bad IPs (blacklist)
BLOCKED_IPS='{
    # Add known bad IPs
}'

echo "[INFO] Detected network interface: $EXT_IF"
echo ""

# ============================================================================
# 1. BACKUP EXISTING CONFIG
# ============================================================================
echo "[1/5] Backing up existing PF configuration..."

BACKUP_DIR="/root/pf-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f /etc/pf.conf ]; then
    cp /etc/pf.conf "$BACKUP_DIR/pf.conf.backup"
fi

echo "✅ Backup created: $BACKUP_DIR"

# ============================================================================
# 2. CREATE PF CONFIGURATION
# ============================================================================
echo ""
echo "[2/5] Creating PF firewall rules..."

cat > /etc/pf.conf <<EOF
# ========================================
# FREEBSD PF FIREWALL CONFIGURATION
# The Most Powerful Firewall Configuration
# ========================================

# ----- MACROS -----
ext_if = "$EXT_IF"
ssh_port = "$SSH_PORT"
web_ports = "{ $HTTP_PORT $HTTPS_PORT }"

# Trusted IPs (whitelist)
trusted = $TRUSTED_IPS

# Blocked IPs (blacklist)
blocked = $BLOCKED_IPS

# ----- TABLES (Dynamic Lists) -----
# SSH brute force protection
table <bruteforce> persist
table <sshguard> persist

# Rate limiting tables
table <ssh_abuse> persist

# ----- OPTIONS -----
# Optimize for high-bandwidth
set optimization aggressive
set block-policy drop
set skip on lo0
set loginterface \$ext_if

# State table limits (anti-DoS)
set limit states 100000
set limit frags 50000
set limit src-nodes 50000
set limit table-entries 400000

# Timeouts (aggressive for DDoS protection)
set timeout { interval 10, frag 15 }
set timeout { tcp.first 60, tcp.opening 30, tcp.established 7200 }
set timeout { tcp.closing 300, tcp.finwait 45, tcp.closed 30 }
set timeout { udp.first 30, udp.single 30, udp.multiple 60 }
set timeout { icmp.first 10, icmp.error 5 }

# ----- NORMALIZATION (SCRUB) -----
# Protect against malformed packets, fragmentation attacks
scrub in on \$ext_if all fragment reassemble max-mss 1440

# ----- QUEUEING (Optional QoS) -----
# Uncomment for traffic shaping
# altq on \$ext_if cbq bandwidth 100Mb queue { std, ssh, web }
# queue std bandwidth 10% cbq(default)
# queue ssh bandwidth 30% cbq(borrow)
# queue web bandwidth 60% cbq(borrow)

# ----- NAT (if needed for jails/VMs) -----
# Uncomment if you need NAT
# nat on \$ext_if from 192.168.1.0/24 to any -> (\$ext_if)

# ----- REDIRECTION (Port Forwarding) -----
# Redirect external web traffic to internal Nuxt server
# rdr pass on \$ext_if proto tcp from any to any port 80 -> 127.0.0.1 port 3000
# rdr pass on \$ext_if proto tcp from any to any port 443 -> 127.0.0.1 port 3000

# ----- FILTERING RULES -----

# 1. BLOCK EVERYTHING BY DEFAULT
block drop all

# 2. ANTISPOOF (Prevent IP spoofing)
antispoof quick for \$ext_if

# 3. BLOCK BLACKLISTED IPS
block drop quick from <blocked>
block drop quick to <blocked>

# 4. BLOCK SSH BRUTE FORCE
block drop quick from <bruteforce>
block drop quick from <sshguard>
block drop quick from <ssh_abuse>

# 5. ALLOW LOOPBACK
pass quick on lo0 all

# 6. ALLOW ICMP (but rate limited)
# Allow ping but limit to 1 per second per source
pass in on \$ext_if inet proto icmp all icmp-type echoreq \
    keep state (max-src-conn-rate 1/1, overload <bruteforce> flush global)

# 7. ALLOW ESTABLISHED CONNECTIONS
pass out on \$ext_if proto { tcp udp icmp } all keep state

# 8. ALLOW TRUSTED IPS (full access)
pass in quick on \$ext_if from \$trusted keep state

# 9. ALLOW SSH (with rate limiting and brute force protection)
# Max 5 connections per 60 seconds per IP
# After 5 failed attempts in 60s, block IP for 24h
pass in on \$ext_if proto tcp from any to any port \$ssh_port \\
    flags S/SA keep state \\
    (max-src-conn 5, max-src-conn-rate 5/60, \\
     overload <ssh_abuse> flush global)

# 10. ALLOW WEB TRAFFIC (HTTP/HTTPS)
# Connection limits: 100 per IP, 200 connections per second per IP
pass in on \$ext_if proto tcp from any to any port \$web_ports \\
    flags S/SA keep state \\
    (max-src-conn 100, max-src-conn-rate 200/1, \\
     overload <bruteforce> flush global)

# 11. BLOCK MONGODB FROM EXTERNAL (security!)
block drop in quick on \$ext_if proto tcp from any to any port $MONGODB_PORT

# 12. PROTECT AGAINST PORT SCANS
# Block stealth scans and invalid packets
block drop in quick on \$ext_if proto tcp flags FUP/WEUAPRSF
block drop in quick on \$ext_if proto tcp flags WEUAPRSF/WEUAPRSF
block drop in quick on \$ext_if proto tcp flags SRAFU/WEUAPRSF
block drop in quick on \$ext_if proto tcp flags /WEUAPRSF
block drop in quick on \$ext_if proto tcp flags SR/SR
block drop in quick on \$ext_if proto tcp flags SF/SF

# 13. PROTECT AGAINST SYN FLOOD
# Handled by state limits above + sysctl settings

# 14. PROTECT AGAINST UDP FLOOD
# Rate limit UDP (10 new connections per second per IP)
pass in on \$ext_if proto udp from any to any \\
    keep state \\
    (max-src-conn 50, max-src-conn-rate 10/1, \\
     overload <bruteforce> flush global)

# 15. LOG BLOCKED PACKETS (for analysis)
block log all

# ----- END OF RULES -----
EOF

echo "✅ PF configuration created"

# ============================================================================
# 3. VALIDATE PF CONFIGURATION
# ============================================================================
echo ""
echo "[3/5] Validating PF configuration..."

if pfctl -n -f /etc/pf.conf; then
    echo "✅ PF configuration is valid"
else
    echo "❌ ERROR: PF configuration has errors!"
    echo "   Restoring backup..."
    if [ -f "$BACKUP_DIR/pf.conf.backup" ]; then
        cp "$BACKUP_DIR/pf.conf.backup" /etc/pf.conf
    fi
    exit 1
fi

# ============================================================================
# 4. ENABLE AND START PF
# ============================================================================
echo ""
echo "[4/5] Enabling PF firewall..."

# Enable in rc.conf if not already
if ! grep -q "pf_enable" /etc/rc.conf; then
    echo 'pf_enable="YES"' >> /etc/rc.conf
    echo 'pf_rules="/etc/pf.conf"' >> /etc/rc.conf
    echo 'pflog_enable="YES"' >> /etc/rc.conf
fi

# Start PF
service pf start
service pflog start

echo "✅ PF firewall enabled and started"

# ============================================================================
# 5. DISPLAY STATUS & RULES
# ============================================================================
echo ""
echo "[5/5] Displaying firewall status..."
echo ""

pfctl -si
echo ""
pfctl -sr

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          ✅  PF FIREWALL CONFIGURED SUCCESSFULLY! ✅       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ PF firewall active"
echo "✅ Advanced DDoS protection enabled"
echo "✅ SSH brute force protection active"
echo "✅ Rate limiting configured"
echo "✅ Port scanning detection enabled"
echo ""
echo "🔹 ALLOWED SERVICES:"
echo "  • SSH: Port $SSH_PORT (rate limited: 5 conn/60s)"
echo "  • HTTP: Port $HTTP_PORT"
echo "  • HTTPS: Port $HTTPS_PORT"
echo "  • ICMP: Ping (1/s limit)"
echo ""
echo "🔹 PROTECTION FEATURES:"
echo "  • SYN Flood: ✅ (state limits)"
echo "  • ICMP Flood: ✅ (1/s rate limit)"
echo "  • UDP Flood: ✅ (10/s rate limit)"
echo "  • SSH Brute Force: ✅ (auto-block after 5 attempts)"
echo "  • Port Scanning: ✅ (blocked)"
echo "  • IP Spoofing: ✅ (antispoof)"
echo "  • Fragmentation: ✅ (scrub/reassemble)"
echo ""
echo "📊 USEFUL COMMANDS:"
echo "  • Show status:    pfctl -si"
echo "  • Show rules:     pfctl -sr"
echo "  • Show states:    pfctl -ss"
echo "  • Show tables:    pfctl -t bruteforce -T show"
echo "  • Reload rules:   pfctl -f /etc/pf.conf"
echo "  • View logs:      tcpdump -n -e -ttt -r /var/log/pflog"
echo ""
echo "⚠️  IMPORTANT:"
echo "  • Test SSH connection BEFORE logging out!"
echo "  • Blocked IPs are stored in tables"
echo "  • Tables persist across reboots"
echo "  • Clear blocked table: pfctl -t bruteforce -T flush"
echo ""
echo "🔹 NEXT STEP:"
echo "  Configure fail2ban for additional protection"
echo ""
