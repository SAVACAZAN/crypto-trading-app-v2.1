# 🐧 Linux Server Security Scripts

**Platform**: Ubuntu 22.04 / Debian 11+ / CentOS 8+

---

## 📋 Scripts Overview

| Script | Purpose | Execution Time |
|--------|---------|----------------|
| `01-ubuntu-hardening.sh` | System hardening, kernel tuning, DDoS protection | 3-5 min |
| `02-firewall-ufw.sh` | UFW firewall with rate limiting | 1-2 min |

---

## 🚀 Quick Start (For Your VPS: 38.143.19.97)

### Step 1: Upload Scripts

```bash
# From your Windows machine
scp -r SECURESITES/linux/* root@38.143.19.97:/root/
```

### Step 2: Connect via SSH

```bash
ssh root@38.143.19.97
```

### Step 3: Make Scripts Executable

```bash
cd /root
chmod +x *.sh
```

### Step 4: Run Hardening Script

```bash
sudo ./01-ubuntu-hardening.sh
```

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║       🛡️  UBUNTU 22.04 SERVER HARDENING SCRIPT 🛡️        ║
╚════════════════════════════════════════════════════════════╝

[1/10] Updating system packages...
✅ System updated
[2/10] Installing security packages...
✅ Security packages installed
...
✅ HARDENING COMPLETED SUCCESSFULLY!
```

**⚠️  REBOOT REQUIRED!**

```bash
sudo reboot
```

### Step 5: After Reboot - Configure Firewall

```bash
ssh root@38.143.19.97
sudo ./02-firewall-ufw.sh
```

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║         🔥 UFW FIREWALL CONFIGURATION SCRIPT 🔥           ║
╚════════════════════════════════════════════════════════════╝

[1/8] Disabling UFW temporarily...
✅ UFW disabled
...
✅ FIREWALL CONFIGURED SUCCESSFULLY!
```

---

## 📊 What Gets Protected?

### ✅ After Running These Scripts:

| Attack Type | Protection | Method |
|-------------|------------|--------|
| SYN Flood | ✅ Blocked | sysctl + UFW rate limit (10/s) |
| ICMP Flood | ✅ Blocked | UFW rate limit (1 ping/s) |
| UDP Flood | ✅ Blocked | UFW rate limit (10/s) |
| SSH Brute Force | ✅ Blocked | UFW limit (6 conn/30s) |
| Port Scanning | ✅ Detected | UFW log + invalid packet drop |
| IP Spoofing | ✅ Blocked | sysctl rp_filter |
| IP Fragmentation | ✅ Mitigated | sysctl settings |

### 🔓 Allowed Services:

- **SSH**: Port 22 (rate limited)
- **HTTP**: Port 80
- **HTTPS**: Port 443

### 🔒 Blocked Services:

- **MongoDB**: Port 27017 (external access blocked - localhost only!)
- **All other ports**: Blocked by default

---

## ⚙️ Configuration

### Change SSH Port (Recommended)

Edit `02-firewall-ufw.sh` before running:

```bash
SSH_PORT=2299  # Change from 22 to custom port
```

Then update `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
# Change: Port 2299
sudo systemctl restart sshd
```

### Add Trusted IPs (Whitelist)

Edit `02-firewall-ufw.sh`:

```bash
WHITELIST_IPS=(
    "1.2.3.4"    # Your office IP
    "5.6.7.8"    # Your home IP
)
```

---

## 📊 Monitoring & Logs

### View UFW Status

```bash
sudo ufw status verbose
```

### View UFW Logs

```bash
sudo tail -f /var/log/ufw.log
```

### View System Logs

```bash
sudo journalctl -f
```

### Check Blocked IPs

```bash
sudo iptables -L -n -v | grep DROP
```

---

## 🛠️ Troubleshooting

### Can't Connect via SSH After Firewall?

```bash
# From VPS console (LumaVPS panel):
sudo ufw disable
# Fix your SSH rule, then re-enable:
sudo ufw enable
```

### Accidentally Blocked Your IP?

```bash
# From VPS console:
sudo ufw delete reject from YOUR_IP
sudo ufw reload
```

### Test Firewall Rules

```bash
# From external machine:
nmap -sS 38.143.19.97  # Should show only 22,80,443 open
```

---

## ⚠️ Critical Notes

1. **Cloudflare is MANDATORY!**
   - Your VPS provider (LumaVPS) has basic DDoS protection
   - These scripts protect at the OS level
   - For serious DDoS attacks, you **MUST** use Cloudflare (FREE)

2. **MongoDB Security**
   - MongoDB should **ONLY** listen on `127.0.0.1`
   - Edit `/etc/mongod.conf`:
     ```yaml
     net:
       bindIp: 127.0.0.1
       port: 27017
     ```

3. **Nginx Reverse Proxy**
   - Your Nuxt app should run on localhost:3000
   - Nginx should proxy HTTP/HTTPS → localhost:3000
   - Never expose Nuxt directly!

---

## 🔄 Updates & Maintenance

### Update Security Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Reload Firewall Rules

```bash
sudo ufw reload
```

### Re-run Hardening (Safe)

```bash
sudo ./01-ubuntu-hardening.sh
# Safe to re-run anytime
```

---

## 📚 Additional Scripts

### Install fail2ban (Recommended)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Check fail2ban Status

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## 🆘 Support

- **Logs**: All backups in `/root/security-backups/`
- **UFW Docs**: `man ufw`
- **Sysctl Docs**: `man sysctl.conf`

---

**🛡️ Your Ubuntu server is now hardened and ready for production!**

---

**Created by**: SAVACAZAN 💜
**Version**: 1.0.0
**Platform**: Ubuntu 22.04 LTS
