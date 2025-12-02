# Referral Balance Page - Plan de Implementare

## Ce vrei să vezi:

### Pagina de Balance (unde să afișăm bonusurile?)

**Opțiuni:**

### Opțiunea 1: Pagină separată `/ReferralBalance`
```
📊 My Earnings
├── 💰 Welcome Bonus: $150.00
├── 💵 Referral Earnings: $57.00
├── ⭐ Activity Points: 1,206 pts
└── 💎 Total Balance: $207.00
```

### Opțiunea 2: Card în pagina Referrals
```
/Referrals
├── 📊 My Earnings Card
│   ├── Welcome Bonus: $150
│   └── Referral Bonus: $57
├── 🌳 Referral Tree
└── 📋 Referral Stats
```

### Opțiunea 3: Top Bar (global în toate paginile)
```
[Navbar]  Balance: $207  |  Points: 1,206  |  👤 Profile
```

## Întrebări:

1. **Unde vrei să afișezi balanta?**
   - [ ] Pagină separată `/Balance` sau `/Earnings`
   - [ ] Card în pagina `/Referrals`
   - [ ] Top bar (global)
   - [ ] Sidebar menu
   - [ ] Dashboard principal

2. **Ce text vrei în loc de "5-Tier Multi-Level Marketing System"?**
   - Exemplu: "Referral Rewards Program"
   - Sau: "Network Earnings"
   - Sau: Alt text custom

3. **Welcome bonus când se dă?**
   - [ ] Automat la înregistrare
   - [ ] Când utilizatorul completează profilul
   - [ ] Când face prima tranzacție
   - [ ] Manual (admin aprobă)

4. **Balanta se afișează în ce monedă?**
   - [ ] USD
   - [ ] USDT
   - [ ] LCX
   - [ ] Multiple monede

## Design Proposal pentru Pagina de Balance:

```vue
<template>
  <div class="balance-page">
    <!-- Header -->
    <div class="balance-header">
      <h1>💰 My Earnings Dashboard</h1>
      <p>Track your rewards and bonuses</p>
    </div>

    <!-- Total Balance Card -->
    <div class="total-balance-card">
      <p class="label">Total Balance</p>
      <h2 class="amount">$207.00</h2>
      <button class="btn-withdraw">Withdraw</button>
    </div>

    <!-- Breakdown Cards -->
    <div class="breakdown-grid">
      <!-- Welcome Bonus -->
      <div class="earning-card">
        <div class="icon">🎉</div>
        <p class="label">Welcome Bonus</p>
        <h3 class="amount">$150.00</h3>
        <span class="status claimed">Claimed</span>
      </div>

      <!-- Referral Earnings -->
      <div class="earning-card">
        <div class="icon">💵</div>
        <p class="label">Referral Earnings</p>
        <h3 class="amount">$57.00</h3>
        <span class="status active">Active</span>
      </div>

      <!-- Activity Points -->
      <div class="earning-card">
        <div class="icon">⭐</div>
        <p class="label">Activity Points</p>
        <h3 class="amount">1,206 pts</h3>
        <span class="status">Trading</span>
      </div>
    </div>

    <!-- Earnings History -->
    <div class="earnings-history">
      <h3>Recent Earnings</h3>
      <div class="history-list">
        <div class="history-item">
          <div class="icon">💵</div>
          <div class="details">
            <p>Referral from User123</p>
            <span>2 days ago</span>
          </div>
          <div class="amount">+$25.00</div>
        </div>
        <!-- More history items -->
      </div>
    </div>
  </div>
</template>
```

## Spune-mi:
1. Unde vrei balanta? (pagină separată / card / top bar)
2. Ce text pentru subtitle?
3. Când se dă welcome bonus?
