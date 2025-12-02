# 🛡️ SECURESITES - Complete Server Security Suite

**Multi-Platform Security Hardening & DDoS Protection**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Supported Platforms](#supported-platforms)
3. [Quick Start](#quick-start)
4. [Directory Structure](#directory-structure)
5. [Features](#features)
6. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

**SECURESITES** provides comprehensive server security for:
- **DDoS Protection** (ICMP, SYN, UDP floods)
- **Application Security** (Rate limiting, WAF)
- **System Hardening** (Firewall, fail2ban, SSH)
- **Automated Backups** (Database + Files)
- **Monitoring & Alerts** (Real-time threat detection)

---

## 💻 Supported Platforms

| Platform | Status | Security Level | Scripts Available |
|----------|--------|----------------|-------------------|
| 🐧 **Linux (Ubuntu/Debian)** | ✅ Production Ready | ⭐⭐⭐⭐⭐ | Full Suite |
| 🪟 **Windows Server** | ✅ Production Ready | ⭐⭐⭐⭐ | Full Suite |
| 👹 **FreeBSD** | ✅ Production Ready | ⭐⭐⭐⭐⭐ | Full Suite |

---

## ⚡ Quick Start

### **For Ubuntu 22.04 (Your Current Setup):**

```bash
# 1. Upload scripts to server
scp -r SECURESITES/linux/* root@38.143.19.97:/root/

# 2. SSH into server
ssh root@38.143.19.97

# 3. Make scripts executable
chmod +x /root/*.sh

# 4. Run hardening script
sudo ./01-ubuntu-hardening.sh

# 5. Configure Cloudflare (see docs)
# Follow: SECURESITES/cloudflare/setup-guide.md
```

---

## 📁 Directory Structure

```
SECURESITES/
├── linux/                  # Linux (Ubuntu/Debian/CentOS)
│   ├── 01-ubuntu-hardening.sh
│   ├── 02-firewall-ufw.sh
│   ├── 03-fail2ban-setup.sh
│   ├── 04-ssh-hardening.sh
│   ├── 05-auto-backup.sh
│   ├── 06-monitoring.sh
│   └── README.md
├── windows/                # Windows Server
│   ├── 01-hardening.ps1
│   ├── 02-firewall.ps1
│   ├── 03-defender-config.ps1
│   └── README.md
├── freebsd/                # FreeBSD
│   ├── 01-hardening.sh
│   ├── 02-pf-firewall.sh
│   ├── 03-jails-setup.sh
│   └── README.md
├── cloudflare/             # Cloudflare Configuration
│   ├── setup-guide.md
│   ├── waf-rules.json
│   └── rate-limits.json
├── nginx/                  # Nginx Security Config
│   ├── nginx-security.conf
│   ├── rate-limiting.conf
│   └── ssl-hardening.conf
├── nuxt-middleware/        # Nuxt Security
│   ├── rate-limiter.js
│   ├── ip-blacklist.js
│   └── security-headers.js
└── docs/                   # Documentation
    ├── cloudflare-setup.md
    ├── ssl-certificates.md
    └── troubleshooting.md
```

---

## 🚀 Features

### **1. DDoS Protection (Layer 3-4)**
- ✅ ICMP flood protection
- ✅ SYN flood mitigation
- ✅ UDP amplification blocking
- ✅ IP fragmentation defense
- ✅ Connection rate limiting

### **2. Firewall Configuration**
- ✅ UFW (Linux) with strict rules
- ✅ Windows Firewall advanced config
- ✅ PF (FreeBSD) stateful firewall
- ✅ Port knocking (optional)
- ✅ GeoIP blocking

### **3. fail2ban Integration**
- ✅ SSH brute force protection
- ✅ Nginx rate limit bans
- ✅ MongoDB auth failure detection
- ✅ Custom jail rules
- ✅ IP whitelist/blacklist

### **4. SSH Hardening**
- ✅ Key-based authentication only
- ✅ Custom port (not 22)
- ✅ Root login disabled
- ✅ 2FA support (Google Authenticator)
- ✅ Login notifications

### **5. Application Security**
- ✅ Nginx rate limiting
- ✅ Security headers (HSTS, CSP, X-Frame)
- ✅ Nuxt middleware protection
- ✅ MongoDB authentication
- ✅ API rate limiting

### **6. Cloudflare Integration** (FREE!)
- ✅ DDoS protection up to unlimited
- ✅ WAF (Web Application Firewall)
- ✅ SSL/TLS encryption
- ✅ CDN caching
- ✅ Bot protection

### **7. Automated Backups**
- ✅ Daily MongoDB backups
- ✅ Application files backup
- ✅ Compression & encryption
- ✅ Remote storage (optional)
- ✅ Retention policy

### **8. Monitoring & Alerts**
- ✅ Real-time attack detection
- ✅ Resource usage monitoring
- ✅ Email/Telegram alerts
- ✅ Log analysis
- ✅ Security reports

---

## 📖 Deployment Guide

### **Step 1: Choose Your Platform**

- **Ubuntu 22.04** (Your current): Go to `linux/`
- **Windows Server**: Go to `windows/`
- **FreeBSD**: Go to `freebsd/`

### **Step 2: Configure Cloudflare** (CRITICAL!)

⚠️ **IMPORTANT**: Your VPS provider (LumaVPS) has basic DDoS protection. You **MUST** use Cloudflare for serious attacks.

1. Follow: `cloudflare/setup-guide.md`
2. Point DNS to Cloudflare
3. Enable "Proxy" (orange cloud)
4. Configure WAF rules

### **Step 3: Run Hardening Scripts**

See platform-specific README files.

### **Step 4: Deploy Your App**

After hardening, deploy your Nuxt app with security middleware.

---

## 🆘 Support & Troubleshooting

See: `docs/troubleshooting.md`

---

## ⚠️ Important Notes

1. **Always backup** before running scripts
2. **Test in staging** environment first
3. **Cloudflare is mandatory** for DDoS protection
4. **Update scripts regularly** (security patches)
5. **Monitor logs** daily

---

## 📊 Expected Results

**Before Hardening:**
- ❌ Vulnerable to SSH brute force
- ❌ No DDoS protection
- ❌ Open ports everywhere
- ❌ No backups

**After Hardening:**
- ✅ SSH secured with fail2ban
- ✅ Cloudflare DDoS protection active
- ✅ Only necessary ports open
- ✅ Daily automated backups
- ✅ Real-time monitoring

---

## 📜 License

MIT License - Use freely

---

**Created by: SAVACAZAN** 💜
**Version:** 1.0.0
**Last Updated:** 2025-10-29
