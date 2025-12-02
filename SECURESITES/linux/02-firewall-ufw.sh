#!/bin/bash

################################################################################
# UFW Firewall Configuration Script
#
# Purpose: Configure UFW firewall with DDoS protection
# Target: Ubuntu 22.04 / Debian 11+
# Author: SAVACAZAN
# Version: 1.0.0
#
# FEATURES:
# - Block all incoming by default
# - Allow specific ports (SSH, HTTP, HTTPS)
# - Rate limiting for SSH
# - Connection limits (anti-DDoS)
# - Logging enabled
#
# USAGE:
#   chmod +x 02-firewall-ufw.sh
#   sudo ./02-firewall-ufw.sh
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ ERROR: Run as root${NC}"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🔥 UFW FIREWALL CONFIGURATION SCRIPT 🔥           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================================================

# SSH Port (change if you're using custom port)
SSH_PORT=22

# Web server ports
HTTP_PORT=80
HTTPS_PORT=443

# Nuxt dev port (if needed)
NUXT_DEV_PORT=3000

# MongoDB port (keep closed if using localhost only)
MONGODB_PORT=27017

# Your IP whitelist (optional - add your IPs here)
WHITELIST_IPS=(
    # "1.2.3.4"    # Example: Your office IP
    # "5.6.7.8"    # Example: Your home IP
)

# ============================================================================
# 1. DISABLE UFW (clean slate)
# ============================================================================
echo -e "${YELLOW}[1/8] Disabling UFW temporarily...${NC}"
ufw --force disable > /dev/null 2>&1
echo -e "${GREEN}✅ UFW disabled${NC}"

# ============================================================================
# 2. RESET UFW (remove all rules)
# ============================================================================
echo -e "\n${YELLOW}[2/8] Resetting UFW rules...${NC}"
ufw --force reset > /dev/null 2>&1
echo -e "${GREEN}✅ UFW reset${NC}"

# ============================================================================
# 3. SET DEFAULT POLICIES
# ============================================================================
echo -e "\n${YELLOW}[3/8] Setting default policies...${NC}"

# Deny all incoming
ufw default deny incoming

# Allow all outgoing
ufw default allow outgoing

# Deny all routed (forwarding)
ufw default deny routed

echo -e "${GREEN}✅ Default policies set${NC}"

# ============================================================================
# 4. ALLOW LOOPBACK
# ============================================================================
echo -e "\n${YELLOW}[4/8] Allowing loopback interface...${NC}"
ufw allow in on lo
ufw allow out on lo
echo -e "${GREEN}✅ Loopback allowed${NC}"

# ============================================================================
# 5. ALLOW ESSENTIAL PORTS
# ============================================================================
echo -e "\n${YELLOW}[5/8] Configuring port access...${NC}"

# SSH with rate limiting (6 connections per 30 seconds)
echo -e "  ${BLUE}→${NC} Configuring SSH (port $SSH_PORT) with rate limiting..."
ufw limit $SSH_PORT/tcp comment 'SSH with rate limit'

# HTTP
echo -e "  ${BLUE}→${NC} Allowing HTTP (port $HTTP_PORT)..."
ufw allow $HTTP_PORT/tcp comment 'HTTP'

# HTTPS
echo -e "  ${BLUE}→${NC} Allowing HTTPS (port $HTTPS_PORT)..."
ufw allow $HTTPS_PORT/tcp comment 'HTTPS'

# Nuxt dev (only if needed - comment out for production!)
# echo -e "  ${BLUE}→${NC} Allowing Nuxt dev (port $NUXT_DEV_PORT)..."
# ufw allow from any to any port $NUXT_DEV_PORT proto tcp comment 'Nuxt Dev'

# MongoDB - IMPORTANT: Only allow from localhost or specific IPs!
# By default, MongoDB should listen on 127.0.0.1 only
# If you need remote access, use SSH tunnel or VPN
# ufw allow from YOUR_IP to any port $MONGODB_PORT proto tcp comment 'MongoDB'

echo -e "${GREEN}✅ Ports configured${NC}"

# ============================================================================
# 6. WHITELIST SPECIFIC IPS (Optional)
# ============================================================================
if [ ${#WHITELIST_IPS[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}[6/8] Adding IP whitelist...${NC}"
    for ip in "${WHITELIST_IPS[@]}"; do
        ufw allow from $ip comment "Whitelisted IP"
        echo -e "  ${GREEN}✓${NC} Whitelisted: $ip"
    done
    echo -e "${GREEN}✅ IP whitelist applied${NC}"
else
    echo -e "\n${YELLOW}[6/8] No IPs to whitelist (skipped)${NC}"
fi

# ============================================================================
# 7. CONFIGURE LOGGING
# ============================================================================
echo -e "\n${YELLOW}[7/8] Configuring logging...${NC}"

# Set logging level (low, medium, high, full)
ufw logging medium

echo -e "${GREEN}✅ Logging enabled (medium level)${NC}"

# ============================================================================
# 8. ENABLE UFW
# ============================================================================
echo -e "\n${YELLOW}[8/8] Enabling UFW firewall...${NC}"

# Enable UFW
ufw --force enable

echo -e "${GREEN}✅ UFW firewall enabled!${NC}"

# ============================================================================
# CONFIGURE BEFORE.RULES (Advanced DDoS Protection)
# ============================================================================
echo -e "\n${YELLOW}Applying advanced DDoS protection rules...${NC}"

# Backup original before.rules
cp /etc/ufw/before.rules /etc/ufw/before.rules.backup

# Add DDoS protection rules at the beginning of before.rules
cat > /tmp/ddos-rules.txt <<'EOF'
# DDoS Protection Rules
*filter

# Allow all on loopback
-A ufw-before-input -i lo -j ACCEPT
-A ufw-before-output -o lo -j ACCEPT

# Drop invalid packets
-A ufw-before-input -m conntrack --ctstate INVALID -j DROP

# Allow established connections
-A ufw-before-input -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# SYN Flood Protection
-A ufw-before-input -p tcp --syn -m limit --limit 10/s --limit-burst 20 -j ACCEPT
-A ufw-before-input -p tcp --syn -j DROP

# Ping Flood Protection (limit to 1 per second)
-A ufw-before-input -p icmp --icmp-type echo-request -m limit --limit 1/s --limit-burst 2 -j ACCEPT
-A ufw-before-input -p icmp --icmp-type echo-request -j DROP

# Port scanning protection
-A ufw-before-input -p tcp --tcp-flags ALL NONE -j DROP
-A ufw-before-input -p tcp --tcp-flags ALL ALL -j DROP
-A ufw-before-input -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP
-A ufw-before-input -p tcp --tcp-flags SYN,RST SYN,RST -j DROP

# Connection limit per IP (max 50 concurrent)
-A ufw-before-input -p tcp -m connlimit --connlimit-above 50 -j REJECT --reject-with tcp-reset

# UDP Flood Protection
-A ufw-before-input -p udp -m limit --limit 10/s --limit-burst 20 -j ACCEPT
-A ufw-before-input -p udp -j DROP

COMMIT
EOF

# Insert at beginning of before.rules (after initial comments)
sed -i '/^# End required lines/r /tmp/ddos-rules.txt' /etc/ufw/before.rules

rm /tmp/ddos-rules.txt

# Reload UFW
ufw reload > /dev/null 2>&1

echo -e "${GREEN}✅ Advanced DDoS protection applied${NC}"

# ============================================================================
# DISPLAY STATUS
# ============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          ✅  FIREWALL CONFIGURED SUCCESSFULLY! ✅          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📊 Current Firewall Status:${NC}"
echo ""
ufw status verbose
echo ""

echo -e "${GREEN}✅ Firewall enabled and configured${NC}"
echo -e "${GREEN}✅ DDoS protection active${NC}"
echo -e "${GREEN}✅ Rate limiting enabled${NC}"
echo -e "${GREEN}✅ Logging enabled${NC}"
echo ""
echo -e "${BLUE}🔹 ALLOWED PORTS:${NC}"
echo -e "  • SSH: $SSH_PORT/tcp (rate limited)"
echo -e "  • HTTP: $HTTP_PORT/tcp"
echo -e "  • HTTPS: $HTTPS_PORT/tcp"
echo ""
echo -e "${BLUE}🔹 PROTECTION ENABLED:${NC}"
echo -e "  • SYN Flood: ✅ (10/s limit)"
echo -e "  • ICMP Flood: ✅ (1/s limit)"
echo -e "  • UDP Flood: ✅ (10/s limit)"
echo -e "  • Port Scanning: ✅ (blocked)"
echo -e "  • Connection Limit: ✅ (50 per IP)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo -e "  • MongoDB is NOT exposed (correct for security)"
echo -e "  • Nuxt should be behind Nginx reverse proxy"
echo -e "  • Use Cloudflare for additional DDoS protection"
echo -e "  • Monitor logs: ${YELLOW}tail -f /var/log/ufw.log${NC}"
echo ""
echo -e "${BLUE}🔹 NEXT STEP:${NC}"
echo -e "  Run: ${YELLOW}sudo ./03-fail2ban-setup.sh${NC}"
echo ""
