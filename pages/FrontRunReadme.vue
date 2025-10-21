<template>
  <div class="readme-container">
    <h1 class="main-title">📚 FrontRun Bot Documentation</h1>

    <!-- SECTION 0: WHAT IS FRONTRUNNING -->
    <div class="section intro-section">
      <h2 class="section-title">🎯 Ce este FrontRun Bot?</h2>

      <div class="info-box">
        <p><strong>FrontRun Bot</strong> este o strategie de trading automată care plasează ordere în așteptarea mișcărilor de preț, anticipând direcția pieței.</p>
        <br>
        <p><strong>Strategia:</strong> Botul plasează ordere în avans (BUY sau SELL) la nivele de preț strategice, profitând din volatilitatea pe termen scurt.</p>
      </div>

      <div class="warning-box">
        <strong>⚠️ IMPORTANT:</strong> FrontRun Bot NU este același lucru cu "frontrunning" ilegal din piața tradițională. Acesta este un bot de scalping/grid trading care anticipează mișcările de preț bazate pe parametri configurați manual.
      </div>
    </div>

    <!-- SECTION 1: HOW IT WORKS -->
    <div class="section how-it-works-section">
      <h2 class="section-title">⚙️ Cum Funcționează FrontRun Bot</h2>

      <div class="how-it-works-card">
        <h3 class="how-title">📊 Pas 1: Selectarea Strategiei (BUY → SELL sau SELL → BUY)</h3>

        <div class="strategy-comparison">
          <div class="strategy-card buy-strategy">
            <div class="strategy-name">🟢 BUY → SELL Strategy</div>
            <div class="strategy-desc">
              <strong>Obiectiv:</strong> Cumpără ieftin, vinde scump
              <br><br>
              <strong>Logică:</strong>
              <ul>
                <li>Plasează <strong>BUY orders</strong> la nivele de preț SUB prețul curent (Price Start)</li>
                <li>După ce BUY orders sunt FILLED, botul plasează automat <strong>SELL orders</strong> mai sus</li>
                <li>Profit = Diferența dintre prețul de cumpărare și prețul de vânzare</li>
              </ul>
            </div>
          </div>

          <div class="strategy-card sell-strategy">
            <div class="strategy-name">🔴 SELL → BUY Strategy</div>
            <div class="strategy-desc">
              <strong>Obiectiv:</strong> Vinde scump, cumpără ieftin (short selling)
              <br><br>
              <strong>Logică:</strong>
              <ul>
                <li>Plasează <strong>SELL orders</strong> la nivele de preț PESTE prețul curent (Price Start)</li>
                <li>După ce SELL orders sunt FILLED, botul plasează automat <strong>BUY orders</strong> mai jos</li>
                <li>Profit = Diferența dintre prețul de vânzare și prețul de cumpărare</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="how-it-works-card">
        <h3 class="how-title">📐 Pas 2: Configurarea Grid-ului (Price Range & Grids)</h3>

        <div class="calc-box">
          <div class="param-explanation">
            <strong>Price Start:</strong> Prețul de referință de unde începe grid-ul
            <br>
            <strong>Lower Price:</strong> Prețul minim al range-ului
            <br>
            <strong>Upper Price:</strong> Prețul maxim al range-ului
            <br>
            <strong>Nr of Grids:</strong> Câte nivele de preț să fie între Lower și Upper
          </div>

          <div class="calc-formula">
            <span class="formula-label">Grid Spacing =</span>
            <span class="formula-value">(Upper Price - Lower Price) / Nr of Grids</span>
          </div>

          <div class="calc-example">
            <strong>📊 Exemplu (BUY → SELL):</strong>
            <ul>
              <li>Price Start = 0.0400 USDC (prețul curent de referință)</li>
              <li>Lower Price = 0.0360 USDC (-10% sub Price Start)</li>
              <li>Upper Price = 0.0440 USDC (+10% peste Price Start)</li>
              <li>Nr of Grids = 10</li>
              <li>➜ Grid Spacing = (0.0440 - 0.0360) / 10 = <strong>0.0008 USDC</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="how-it-works-card">
        <h3 class="how-title">💰 Pas 3: Configurarea Amount (Cantitatea per Grid)</h3>

        <div class="amount-types">
          <div class="amount-card">
            <div class="amount-name">📊 Amount (USDC)</div>
            <div class="amount-desc">
              Valoarea în USDC pe care botul o va folosi pentru <strong>PRIMUL GRID</strong>.
              <br><br>
              <strong>Exemplu:</strong> Amount = 100 USDC
              <br>
              → Primul ordin va fi de 100 USDC worth of tokens
            </div>
          </div>

          <div class="amount-card">
            <div class="amount-name">📈 Incremental Amount (%)</div>
            <div class="amount-desc">
              Procent cu care crește cantitatea pentru fiecare grid următor.
              <br><br>
              <strong>Exemplu (Incremental Buy = 0.11%):</strong>
              <ul>
                <li>Grid 1: 100 USDC</li>
                <li>Grid 2: 100 + (100 × 0.0011) = 100.11 USDC</li>
                <li>Grid 3: 100.11 + (100.11 × 0.0011) = 100.22 USDC</li>
                <li>...</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: KEY PARAMETERS -->
    <div class="section">
      <h2 class="section-title">🎯 Parametri Cheie</h2>

      <div class="param-grid">
        <div class="param-card">
          <div class="param-name">Price Start</div>
          <div class="param-desc">
            Prețul de referință de unde începe strategia botului.
            <br><br>
            <strong>Sugestie:</strong> Folosește Best Bid (pentru BUY) sau Best Ask (pentru SELL)
            <br><br>
            <strong>Exemplu:</strong> Price Start = 0.0400 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Amount Price Start</div>
          <div class="param-desc">
            Cantitatea în USDC pentru primul ordin plasat la Price Start.
            <br><br>
            <strong>Exemplu:</strong> Amount Price Start = 200 USDC
            <br>
            → Primul ordin va fi de 200 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Lower Price</div>
          <div class="param-desc">
            Prețul minim al range-ului. Pentru strategia BUY → SELL, acesta va fi prețul cel mai jos la care se plasează BUY orders.
            <br><br>
            <strong>Calculare automată:</strong> Price Start × 0.99 (1% sub)
            <br><br>
            <strong>Exemplu:</strong> Lower = 0.0396 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Upper Price</div>
          <div class="param-desc">
            Prețul maxim al range-ului. Pentru strategia BUY → SELL, acesta va fi prețul cel mai mare la care se plasează SELL orders (după FILL).
            <br><br>
            <strong>Calculare automată:</strong> Price Start × 1.20 (20% peste)
            <br><br>
            <strong>Exemplu:</strong> Upper = 0.0480 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Amount</div>
          <div class="param-desc">
            Cantitatea în USDC pentru primul grid (înainte de incremental).
            <br><br>
            <strong>Exemplu:</strong> Amount = 100 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Nr of Grids</div>
          <div class="param-desc">
            Numărul de nivele (grids) între Lower și Upper Price.
            <br><br>
            <strong>Exemplu:</strong> Nr of Grids = 25
            <br>
            → 25 de ordere vor fi distribuite uniform în range
          </div>
        </div>

        <div class="param-card highlight">
          <div class="param-name">Inc. % Amount Buy</div>
          <div class="param-desc">
            Procent cu care crește cantitatea pentru fiecare grid BUY.
            <br><br>
            <strong>Exemplu (0.11%):</strong>
            <ul>
              <li>Grid 1: 100 USDC</li>
              <li>Grid 2: 100.11 USDC (+0.11%)</li>
              <li>Grid 3: 100.22 USDC (+0.11%)</li>
            </ul>
          </div>
        </div>

        <div class="param-card highlight">
          <div class="param-name">Inc. % Amount Sell</div>
          <div class="param-desc">
            Procent cu care crește cantitatea pentru fiecare grid SELL.
            <br><br>
            <strong>Exemplu (0.11%):</strong>
            <ul>
              <li>Grid 1: 100 USDC</li>
              <li>Grid 2: 100.11 USDC (+0.11%)</li>
              <li>Grid 3: 100.22 USDC (+0.11%)</li>
            </ul>
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Active RANGE</div>
          <div class="param-desc">
            Activează modul RANGE care limitează plasarea orders doar în range-ul Lower-Upper.
            <br><br>
            <strong>Când e ACTIV:</strong> Orders NU se plasează în afara range-ului
            <br>
            <strong>Când e INACTIV:</strong> Orders pot fi plasate și în afara range-ului configurate
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: STRATEGY BUTTONS -->
    <div class="section">
      <h2 class="section-title">🎯 Strategy Buttons (Pre-Configurate)</h2>

      <div class="info-box">
        <p>Butoanele de strategie setează automat parametrii pentru scenarii comune de trading.</p>
      </div>

      <div class="strategy-buttons-grid">
        <div class="strategy-button-card buy-strat">
          <div class="strat-button-name">🟢 BUY → SELL GRID 2%</div>
          <div class="strat-button-desc">
            Setează automat:
            <ul>
              <li>Lower Price = Best Bid + 0.1%</li>
              <li>Upper Price = Best Bid + 2%</li>
              <li>Nr of Grids = 25</li>
              <li>Amount = 1 USDC</li>
              <li>Inc. % = 0.11%</li>
            </ul>
            <strong>Scenariu:</strong> Scalping mic de 2% profit
          </div>
        </div>

        <div class="strategy-button-card buy-strat">
          <div class="strat-button-name">🟢 BUY → SELL GRID 5%</div>
          <div class="strat-button-desc">
            Setează automat:
            <ul>
              <li>Lower Price = Best Bid + 0.1%</li>
              <li>Upper Price = Best Bid + 5%</li>
              <li>Nr of Grids = 25</li>
            </ul>
            <strong>Scenariu:</strong> Scalping mediu de 5% profit
          </div>
        </div>

        <div class="strategy-button-card buy-strat">
          <div class="strat-button-name">🟢 BUY → SELL GRID 10-80%</div>
          <div class="strat-button-desc">
            Setează automat Upper Price la 10%, 20%, 50%, sau 80% peste Best Bid.
            <br><br>
            <strong>Scenariu:</strong> Swing trading cu target mare de profit
          </div>
        </div>

        <div class="strategy-button-card sell-strat">
          <div class="strat-button-name">🔴 SELL → BUY GRID 2%</div>
          <div class="strat-button-desc">
            Setează automat:
            <ul>
              <li>Lower Price = Best Ask - 2%</li>
              <li>Upper Price = Best Ask + 0.1%</li>
              <li>Nr of Grids = 25</li>
            </ul>
            <strong>Scenariu:</strong> Short selling mic de 2%
          </div>
        </div>

        <div class="strategy-button-card sell-strat">
          <div class="strat-button-name">🔴 SELL → BUY GRID 10-80%</div>
          <div class="strat-button-desc">
            Setează automat Lower Price la 10%, 20%, 50%, sau 80% sub Best Ask.
            <br><br>
            <strong>Scenariu:</strong> Short selling cu target mare (piață în scădere)
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 4: COMPLETE DEMO -->
    <div class="section demo-section">
      <h2 class="section-title">🎮 Demo Complete: BUY → SELL Strategy</h2>

      <div class="demo-config">
        <h3>📋 Configurație Exemplu (LCX/USDC)</h3>
        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">Price Start:</span>
            <span class="config-value">0.0400 USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Amount Price Start:</span>
            <span class="config-value">200 USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Lower Price:</span>
            <span class="config-value">0.0396 USDC (-1%)</span>
          </div>
          <div class="config-item">
            <span class="config-label">Upper Price:</span>
            <span class="config-value">0.0480 USDC (+20%)</span>
          </div>
          <div class="config-item">
            <span class="config-label">Amount:</span>
            <span class="config-value">100 USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Nr of Grids:</span>
            <span class="config-value">10</span>
          </div>
          <div class="config-item">
            <span class="config-label">Inc. % Buy:</span>
            <span class="config-value">0.11%</span>
          </div>
          <div class="config-item">
            <span class="config-label">Inc. % Sell:</span>
            <span class="config-value">0.11%</span>
          </div>
        </div>
      </div>

      <div class="demo-step">
        <h3>📊 Ciclu 1: Plasare Ordere Inițiale (BUY)</h3>

        <div class="info-box">
          <strong>🎯 Obiectiv:</strong> Plasăm 10 BUY orders între Lower (0.0396) și Price Start (0.0400)
          <br><br>
          <strong>Grid Spacing:</strong> (0.0400 - 0.0396) / 10 = 0.0004 USDC
        </div>

        <table class="demo-table">
          <thead>
            <tr>
              <th>Grid</th>
              <th>Price (USDC)</th>
              <th>Amount (USDC)</th>
              <th>LCX Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>0.0396</td><td>100.00</td><td>2,525.25</td></tr>
            <tr><td>2</td><td>0.03964</td><td>100.11</td><td>2,525.51</td></tr>
            <tr><td>3</td><td>0.03968</td><td>100.22</td><td>2,525.77</td></tr>
            <tr><td>4</td><td>0.03972</td><td>100.33</td><td>2,526.03</td></tr>
            <tr><td>5</td><td>0.03976</td><td>100.44</td><td>2,526.29</td></tr>
            <tr><td>6</td><td>0.03980</td><td>100.55</td><td>2,526.56</td></tr>
            <tr><td>7</td><td>0.03984</td><td>100.66</td><td>2,526.82</td></tr>
            <tr><td>8</td><td>0.03988</td><td>100.77</td><td>2,527.08</td></tr>
            <tr><td>9</td><td>0.03992</td><td>100.88</td><td>2,527.34</td></tr>
            <tr><td>10</td><td>0.03996</td><td>100.99</td><td>2,527.60</td></tr>
          </tbody>
        </table>
      </div>

      <div class="demo-step">
        <h3>🔄 Ciclu 2: După BUY Grid 1 FILLED</h3>

        <div class="event-box buy-event">
          <strong>✅ Eveniment:</strong> BUY Grid 1 FILLED la 0.0396 USDC
          <br>
          💰 Ai cumpărat 2,525.25 LCX pentru 100 USDC
        </div>

        <div class="calc-box">
          <h4>📐 Calculul SELL Order Automat</h4>
          <div class="calc-example">
            <ul>
              <li>Preț BUY executat: 0.0396 USDC</li>
              <li>Upper Price configurată: 0.0480 USDC</li>
              <li>➜ Botul plasează automat <strong>SELL order la 0.0480 USDC</strong></li>
              <li>Qty: 2,525.25 LCX (exact cât ai cumpărat)</li>
              <li>💰 <strong>Profit estimat:</strong> (0.0480 - 0.0396) × 2,525.25 = <strong>21.21 USDC profit</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="insights-section">
        <h3>💡 Key Insights (Concluzii Importante)</h3>

        <div class="insight-grid">
          <div class="insight-card">
            <div class="insight-icon">🎯</div>
            <div class="insight-title">FrontRun = Anticipare</div>
            <div class="insight-text">
              Botul plasează ordere în avans, anticipând mișcările de preț. Nu așteaptă ca prețul să ajungă la nivel - ordinele sunt deja plasate!
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">⚡</div>
            <div class="insight-title">Execuție Automată</div>
            <div class="insight-text">
              După ce un BUY este executat, botul plasează automat SELL la Upper Price. Invers pentru SELL → BUY strategy.
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">📊</div>
            <div class="insight-title">Scalping Multi-Level</div>
            <div class="insight-text">
              Cu 25 grids, botul poate profita din multiple mișcări mici de preț simultan, maximizând profitul din volatilitate.
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">💰</div>
            <div class="insight-title">Incremental Amount</div>
            <div class="insight-text">
              Incremental Amount permite scaling progresiv - cumperi/vinzi mai mult la nivele mai avantajoase de preț.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>📝 Documentație creată pentru Crypto App v2.2</p>
      <p>💡 Pentru întrebări sau suport, contactați echipa de dezvoltare</p>
    </div>
  </div>
</template>

<script setup>
// Page component for FrontRun Bot documentation
</script>

<style scoped>
.readme-container {
  padding: 12px;
  max-width: 1600px;
  margin: 0 auto;
  background: #0a0a0a;
  color: #d0d0d0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
}

.main-title {
  font-size: 20px;
  font-weight: 700;
  color: #f39c12;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 8px rgba(243, 156, 18, 0.4);
  padding: 8px;
  background: #0f0f0f;
  border-radius: 6px;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.section {
  margin-bottom: 15px;
  padding: 12px;
  background: #0f0f0f;
  border-radius: 6px;
  border: 1px solid #222;
}

.intro-section {
  border: 1px solid #05f5ed;
  background: linear-gradient(135deg, #0a1a2e 0%, #0f1520 100%);
}

.how-it-works-section {
  border: 1px solid #10eb04;
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
}

.demo-section {
  border: 1px solid #f39c12;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1410 100%);
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #f5a623;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.param-card {
  background: #0a0a0a;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
  transition: all 0.2s ease;
}

.param-card:hover {
  border-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.15);
  transform: translateY(-1px);
}

.param-card.highlight {
  border: 1px solid #10eb04;
  background: linear-gradient(135deg, #0a0a0a 0%, #0a2e01 100%);
}

.param-name {
  font-size: 11px;
  font-weight: 700;
  color: #f39c12;
  margin-bottom: 6px;
  text-shadow: 0 0 4px rgba(243, 156, 18, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.param-desc {
  font-size: 10px;
  line-height: 1.4;
  color: #999;
}

.param-desc ul {
  margin: 6px 0;
  padding-left: 15px;
}

.param-desc li {
  margin: 3px 0;
}

.param-desc strong {
  color: #f5a623;
  font-weight: 600;
}

.info-box {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 10px;
}

.info-box p, .info-box ul {
  margin: 4px 0;
  line-height: 1.4;
}

.warning-box {
  background: linear-gradient(135deg, #2e0a01 0%, #1a0a0a 100%);
  border: 1px solid #e90a15;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  color: #ffaaaa;
  font-size: 10px;
}

.warning-box strong {
  color: #ff6666;
  font-size: 11px;
  font-weight: 700;
}

.how-it-works-card {
  background: #0a0a0a;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
  margin-bottom: 10px;
}

.how-title {
  font-size: 11px;
  color: #10eb04;
  margin-bottom: 8px;
  text-shadow: 0 0 6px rgba(16, 235, 4, 0.4);
  font-weight: 700;
  text-transform: uppercase;
}

.strategy-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.strategy-card {
  background: #000;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
}

.buy-strategy {
  border-color: #10eb04;
}

.sell-strategy {
  border-color: #e90a15;
}

.strategy-name {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 8px;
  padding: 6px;
  text-align: center;
  border-radius: 3px;
  text-transform: uppercase;
}

.buy-strategy .strategy-name {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  border: 1px solid #10eb04;
}

.sell-strategy .strategy-name {
  background: rgba(233, 10, 21, 0.1);
  color: #e90a15;
  border: 1px solid #e90a15;
}

.strategy-desc {
  font-size: 9px;
  line-height: 1.3;
  color: #999;
}

.strategy-desc ul {
  margin: 6px 0;
  padding-left: 12px;
}

.calc-box {
  background: #0f0f0f;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #f39c12;
  margin-bottom: 8px;
}

.param-explanation {
  font-size: 9px;
  line-height: 1.4;
  margin-bottom: 8px;
  color: #999;
}

.calc-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: #000;
  border-radius: 4px;
  margin: 8px 0;
  border: 1px solid #10eb04;
}

.formula-label {
  font-size: 10px;
  font-weight: 700;
  color: #f5a623;
}

.formula-value {
  font-size: 10px;
  font-weight: 700;
  color: #10eb04;
  text-shadow: 0 0 6px rgba(16, 235, 4, 0.4);
}

.calc-example {
  padding: 6px 8px;
  background: #0a0a0a;
  border-radius: 4px;
  font-size: 9px;
}

.calc-example ul {
  margin: 4px 0;
  padding-left: 12px;
}

.amount-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.amount-card {
  background: #000;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #f39c12;
}

.amount-name {
  font-size: 10px;
  font-weight: 700;
  color: #f5a623;
  margin-bottom: 6px;
  text-align: center;
  padding: 4px;
  background: #0f0f0f;
  border-radius: 3px;
}

.amount-desc {
  font-size: 9px;
  line-height: 1.3;
  color: #999;
}

.amount-desc ul {
  margin: 6px 0;
  padding-left: 12px;
}

.strategy-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.strategy-button-card {
  background: #000;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
  transition: all 0.2s ease;
}

.strategy-button-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(243, 156, 18, 0.2);
}

.buy-strat {
  border-color: #10eb04;
}

.sell-strat {
  border-color: #e90a15;
}

.strat-button-name {
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 6px;
  padding: 4px;
  text-align: center;
  border-radius: 3px;
  text-transform: uppercase;
}

.buy-strat .strat-button-name {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  border: 1px solid #10eb04;
}

.sell-strat .strat-button-name {
  background: rgba(233, 10, 21, 0.1);
  color: #e90a15;
  border: 1px solid #e90a15;
}

.strat-button-desc {
  font-size: 8px;
  line-height: 1.3;
  color: #999;
}

.strat-button-desc ul {
  margin: 4px 0;
  padding-left: 10px;
}

.demo-config {
  background: #0a0a0a;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid #f39c12;
}

.demo-config h3 {
  color: #f5a623;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 6px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 8px;
  background: #0f0f0f;
  border-radius: 3px;
  border: 1px solid #222;
  font-size: 9px;
}

.config-label {
  color: #777;
  font-weight: 600;
}

.config-value {
  color: #f39c12;
  font-weight: 700;
}

.demo-step {
  margin-bottom: 15px;
  padding: 10px;
  background: #0a0a0a;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
}

.demo-step h3 {
  color: #05f5ed;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  margin-top: 8px;
}

.demo-table th {
  background: #0f0f0f;
  color: #f5a623;
  padding: 4px 6px;
  text-align: center;
  border-bottom: 1px solid #333;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 8px;
}

.demo-table td {
  padding: 3px 6px;
  text-align: center;
  border-bottom: 1px solid #1a1a1a;
  color: #999;
}

.demo-table td:first-child {
  color: #10eb04;
  font-weight: 700;
}

.demo-table tbody tr:hover {
  background: #0f0f0f;
}

.event-box {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 10px;
  margin-bottom: 8px;
}

.buy-event {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
  color: #aaffaa;
}

.insights-section {
  margin-top: 12px;
  padding: 10px;
  background: #0a0a0a;
  border-radius: 4px;
  border: 1px solid #05f5ed;
}

.insights-section h3 {
  color: #05f5ed;
  font-size: 12px;
  margin-bottom: 8px;
  text-shadow: 0 0 6px rgba(5, 245, 237, 0.4);
  font-weight: 700;
  text-transform: uppercase;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.insight-card {
  background: linear-gradient(135deg, #0a1a2e 0%, #0f1520 100%);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #05f5ed;
  transition: all 0.2s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(5, 245, 237, 0.2);
  border-color: #10eb04;
}

.insight-icon {
  font-size: 20px;
  text-align: center;
  margin-bottom: 6px;
}

.insight-title {
  font-size: 10px;
  font-weight: 700;
  color: #05f5ed;
  text-align: center;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.insight-text {
  font-size: 9px;
  line-height: 1.3;
  color: #999;
}

.footer {
  text-align: center;
  padding: 10px;
  background: #0f0f0f;
  border-radius: 4px;
  border: 1px solid #222;
  margin-top: 15px;
}

.footer p {
  margin: 4px 0;
  color: #666;
  font-size: 9px;
}
</style>
