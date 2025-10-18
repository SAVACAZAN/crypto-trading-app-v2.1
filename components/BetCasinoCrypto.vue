<template>
  <div>
    <h1>BetCasinoCryptoService</h1>
    <!-- Adăugați conținut specific paginii NewTag aici -->
    <button @click="redirectToPage('PriceOracol')">PriceOracol</button>
    <button @click="redirectToPage('GameList')">GameList</button>
    <button @click="redirectToPage('UserList')">UserList</button>
    <button @click="redirectToPage('Airdrop')">Airdrop</button>
    <button @click="redirectToPage('Faucet')">Faucet</button>
    <button @click="redirectToPage('TransactionList')">TransactionList</button>
    <button @click="redirectToPage('GameForm')">GameForm</button>
    <button @click="redirectToPage('UserForm')">UserForm</button>
    <button @click="redirectToPage('TransactionForm')">TransactionForm</button>
    <button @click="redirectToPage('WalletBalance')">WalletBalance</button>
    <button @click="redirectToPage('DepositForm')">DepositForm</button>
    <button @click="redirectToPage('WithdrawForm')">WithdrawForm</button>
    <button @click="redirectToPage('BetPlacer')">BetPlacer</button>
    <button @click="redirectToPage('JackpotInfo')">JackpotInfo</button>
    <button @click="redirectToPage('CasinoBalance')">CasinoBalance</button>
    <button @click="redirectToPage('CasinoProfit')">CasinoProfit</button>
    <button @click="redirectToPage('ClientProfit')">ClientProfit</button>
    <button @click="redirectToPage('CasinoInitialBalance')">CasinoInitialBalance</button>
    <button @click="redirectToPage('ClientInitialBalance')">ClientInitialBalance</button>
    <button @click="redirectToPage('Rewards')">Rewards</button>
    <button @click="redirectToPage('Stake')">Stake</button>
    <button @click="redirectToPage('TopPool')">TopPool</button>
    <button @click="redirectToPage('BestWin')">BestWin</button>
    <button @click="redirectToPage('TopPaid')">TopPaid</button>
    <button @click="redirectToPage('Referral')">Referral</button>
  </div>
</template>


<script>
export default {
  name: 'BetCasinoCryptoService',
  methods: {
    redirectToPage(pageName) {
      // Aici puteți să faceți ce doriți în funcție de numele paginii
      if (pageName === 'GameList') {
        this.$router.push('/BetCasinoCryptoService/GameList');
      } else if (pageName === 'UserList') {
        this.$router.push('/BetCasinoCryptoService/UserList');

      } else if (pageName === 'PriceOracol') {
        this.$router.push('/PriceOracol');

        
      } else if (pageName === 'TransactionList') {
        this.$router.push('/BetCasinoCryptoService/TransactionList');
      } else if (pageName === 'GameForm') {
        this.$router.push('/BetCasinoCryptoService/GameForm');
      } else if (pageName === 'UserForm') {
        this.$router.push('/BetCasinoCryptoService/UserForm');
      } else if (pageName === 'TransactionForm') {
        this.$router.push('/BetCasinoCryptoService/TransactionForm');
      } else if (pageName === 'WalletBalance') {
        this.$router.push('/BetCasinoCryptoService/WalletBalance');
      } else if (pageName === 'DepositForm') {
        this.$router.push('/BetCasinoCryptoService/DepositForm');
      } else if (pageName === 'WithdrawForm') {
        this.$router.push('/BetCasinoCryptoService/WithdrawForm');
      } else if (pageName === 'Airdrop') {
        this.$router.push('/BetCasinoCryptoService/Airdrop');
      } else if (pageName === 'Faucet') {
        this.$router.push('/BetCasinoCryptoService/Faucet');
      } else if (pageName === 'Rewards') {
        this.$router.push('/BetCasinoCryptoService/Rewards');
      } else if (pageName === 'Stake') {
        this.$router.push('/BetCasinoCryptoService/Stake');
      } else if (pageName === 'TopPool') {
        this.$router.push('/BetCasinoCryptoService/TopPool');
      } else if (pageName === 'BestWin') {
        this.$router.push('/BetCasinoCryptoService/BestWin');
      } else if (pageName === 'TopPaid') {
        this.$router.push('/BetCasinoCryptoService/TopPaid');
      } else if (pageName === 'Referral') {
        this.$router.push('/BetCasinoCryptoService/Referral');
      } else if (pageName === 'JackpotInfo') {
        this.$router.push('/BetCasinoCryptoService/JackpotInfo');
      } else if (pageName === 'CasinoBalance') {
        this.$router.push('/BetCasinoCryptoService/CasinoBalance');
      } else if (pageName === 'CasinoProfit') {
        this.$router.push('/BetCasinoCryptoService/CasinoProfit');
      } else if (pageName === 'ClientProfit') {
        this.$router.push('/BetCasinoCryptoService/ClientProfit');
      } else if (pageName === 'CasinoInitialBalance') {
        this.$router.push('/BetCasinoCryptoService/CasinoInitialBalance');
      } else if (pageName === 'ClientInitialBalance') {
        this.$router.push('/BetCasinoCryptoService/ClientInitialBalance');
      }
      // Adăugați condiții pentru celelalte pagini aici
    }
  }
}
</script>



<style scoped>
h1 {
  background-color: #0c01a5;
  color: #fff;
  padding: 20px;
  text-align: center;
  font-size: 24px;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.button {
  background-color: #ff5733; /* Culoarea butoanelor (portocaliu) */
  color: #fff;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #ff331a; /* Culoarea butoanelor la hover (portocaliu mai închis) */
}
</style>
