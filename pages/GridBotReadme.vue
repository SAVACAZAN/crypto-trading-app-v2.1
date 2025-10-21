<template>
  <div class="readme-container">
    <h1 class="main-title">📚 Grid Bot Documentation</h1>

    <!-- SECTION 0: HOW IT WORKS -->
    <div class="section how-it-works-section">
      <h2 class="section-title">⚙️ Cum Funcționează Grid Bot-ul (Modul de Calcul)</h2>

      <div class="info-box">
        <p><strong>🎯 Conceptul de bază:</strong> Grid Bot-ul creează o "grilă" (grid) de ordere BUY și SELL între două prețuri (Lower și Upper), plasate uniform la intervale egale.</p>
      </div>

      <!-- MID PRICE CALCULATION -->
      <div class="how-it-works-card">
        <h3 class="how-title">📊 Pas 1: Calculul Mid Price (Preț de Referință)</h3>

        <div class="calc-box">
          <div class="calc-formula">
            <span class="formula-label">Mid Price =</span>
            <span class="formula-value">(Best Bid + Best Ask) / 2</span>
          </div>

          <div class="calc-example">
            <strong>📊 Date Live ({{ demoConfig.pair }}):</strong>
            <div v-if="loading" style="color: #f5a623; padding: 10px;">
              ⏳ Se încarcă date din ticker...
            </div>
            <ul v-else-if="tickerData">
              <li>Best Bid (cel mai mare preț BUY din Order Book) = <span class="highlight-green">{{ tickerData.bid }} USDC</span></li>
              <li>Best Ask (cel mai mic preț SELL din Order Book) = <span class="highlight-red">{{ tickerData.ask }} USDC</span></li>
              <li>➜ Mid Price = ({{ tickerData.bid }} + {{ tickerData.ask }}) / 2 = <span class="highlight-yellow">{{ demoConfig.midPrice }} USDC</span></li>
            </ul>
            <ul v-else>
              <li>Best Bid (cel mai mare preț BUY din Order Book) = <span class="highlight-green">0.0398 USDC</span></li>
              <li>Best Ask (cel mai mic preț SELL din Order Book) = <span class="highlight-red">0.0402 USDC</span></li>
              <li>➜ Mid Price = (0.0398 + 0.0402) / 2 = <span class="highlight-yellow">0.0400 USDC</span></li>
              <li style="color: #f39c12; margin-top: 8px;">💡 <strong>Selectează un ticker din navbar pentru date live!</strong></li>
            </ul>
          </div>

          <div class="info-note">
            <strong>💡 De ce Mid Price?</strong><br>
            Mid Price este "prețul de echilibru" între cerere (bid) și ofertă (ask). Botul folosește acest preț ca punct de referință pentru a împărți gridurile în două părți: BUY orders SUB mid price și SELL orders PESTE mid price.
          </div>
        </div>
      </div>

      <!-- GRID FORMATION FOR BUY & SELL -->
      <div class="how-it-works-card">
        <h3 class="how-title">📐 Pas 2: Calculul Upper & Lower Price (±10%)</h3>

        <div class="warning-box" style="margin-bottom: 10px;">
          <strong>💡 Sugestie Automată:</strong><br>
          Poți folosi prețurile din Order Book pentru a calcula automat Upper & Lower:
          <br><br>
          <strong>Lower Price:</strong> Best Bid - 10% = Bid × 0.90
          <br>
          <strong>Upper Price:</strong> Best Ask + 10% = Ask × 1.10
          <br><br>
          <strong>📊 Calculat din ticker ({{ demoConfig.pair }}):</strong>
          <ul v-if="tickerData">
            <li>Mid Price = {{ demoConfig.midPrice}} USDC → Lower = {{ demoConfig.midPrice }} × 0.90 = <strong>{{ demoConfig.lowerPrice }} USDC</strong></li>
            <li>Mid Price = {{ demoConfig.midPrice }} USDC → Upper = {{ demoConfig.midPrice }} × 1.10 = <strong>{{ demoConfig.upperPrice }} USDC</strong></li>
          </ul>
          <ul v-else>
            <li>Best Bid = 0.0398 USDC → Lower = 0.0398 × 0.90 = <strong>0.03582 USDC</strong></li>
            <li>Best Ask = 0.0402 USDC → Upper = 0.0402 × 1.10 = <strong>0.04422 USDC</strong></li>
            <li style="color: #f39c12; margin-top: 8px;">💡 <strong>Selectează un ticker din navbar!</strong></li>
          </ul>
        </div>

        <h3 class="how-title">📐 Pas 3: Formarea Gridurilor (Buy & Sell Mode)</h3>

        <div class="warning-box" style="margin-bottom: 20px;">
          <strong>⚠️ IMPORTANT pentru "Buy & Sell":</strong><br>
          Când selectezi <strong>Orders Side = "Buy & Sell"</strong>, botul împarte cele 10 grids în:
          <ul>
            <li><strong>5 grids BUY</strong> - plasate între Lower Price și Mid Price</li>
            <li><strong>5 grids SELL</strong> - plasate între Mid Price și Upper Price</li>
          </ul>
        </div>

        <div class="grid-formation-visual">
          <div class="visual-section">
            <h4 style="color: #10eb04; text-align: center;">🟢 BUY Grids (Lower → Mid)</h4>

            <div class="warning-box" style="margin-bottom: 8px; font-size: 9px;">
              <strong>⚠️ IMPORTANT:</strong> BUY orders sunt plasate în ordine <strong>DESCRESCĂTOARE</strong> (de la cel mai mare preț la cel mai mic).
              <br>
              → Primul BUY grid este cel mai aproape de Mid, ultimul este la Lower.
            </div>

            <div class="formula-box">
              <div class="formula-line">
                <span>Grid Spacing (BUY) =</span>
                <span class="formula-highlight">(Mid Price - Lower Price) / 5</span>
              </div>
            </div>

            <div class="example-box">
              <strong>📊 Grids calculate dinamic ({{ demoConfig.pair }}):</strong>
              <ul>
                <li>Lower Price = <span class="highlight-value">{{ demoConfig.lowerPrice }} USDC</span></li>
                <li>Mid Price = <span class="highlight-value">{{ demoConfig.midPrice }} USDC</span></li>
                <li>Grid Spacing = ({{ demoConfig.midPrice }} - {{ demoConfig.lowerPrice }}) / 5 = <span class="highlight-value">{{ ((demoConfig.midPrice - demoConfig.lowerPrice) / 5).toFixed(6) }} USDC</span></li>
              </ul>

              <table class="mini-table" style="margin-top: 15px;">
                <thead>
                  <tr>
                    <th>BUY Grid</th>
                    <th>Price (↓)</th>
                    <th>Amount (USDC)</th>
                    <th>Qty ({{ demoConfig.pair.split('/')[0] }})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(grid, index) in buyGridPrices" :key="index">
                    <td>{{ grid.grid }}</td>
                    <td>${{ grid.price.toFixed(6) }}</td>
                    <td>{{ grid.amount.toFixed(2) }}</td>
                    <td>{{ grid.qty.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="visual-divider">↕️</div>

          <div class="visual-section">
            <h4 style="color: #e90a15; text-align: center;">🔴 SELL Grids (Mid → Upper)</h4>

            <div class="warning-box" style="margin-bottom: 8px; font-size: 9px;">
              <strong>⚠️ IMPORTANT:</strong> SELL orders sunt plasate în ordine <strong>CRESCĂTOARE</strong> (de la cel mai mic preț la cel mai mare).
              <br>
              → Primul SELL grid este cel mai aproape de Mid, ultimul este la Upper.
            </div>

            <div class="formula-box">
              <div class="formula-line">
                <span>Grid Spacing (SELL) =</span>
                <span class="formula-highlight">(Upper Price - Mid Price) / 5</span>
              </div>
            </div>

            <div class="example-box">
              <strong>📊 Grids calculate dinamic ({{ demoConfig.pair }}):</strong>
              <ul>
                <li>Mid Price = <span class="highlight-value">{{ demoConfig.midPrice }} USDC</span></li>
                <li>Upper Price = <span class="highlight-value">{{ demoConfig.upperPrice }} USDC</span></li>
                <li>Grid Spacing = ({{ demoConfig.upperPrice }} - {{ demoConfig.midPrice }}) / 5 = <span class="highlight-value">{{ ((demoConfig.upperPrice - demoConfig.midPrice) / 5).toFixed(6) }} USDC</span></li>
              </ul>

              <table class="mini-table" style="margin-top: 15px;">
                <thead>
                  <tr>
                    <th>SELL Grid</th>
                    <th>Price (↑)</th>
                    <th>Amount (USDC)</th>
                    <th>Qty ({{ demoConfig.pair.split('/')[0] }})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(grid, index) in sellGridPrices" :key="index">
                    <td>{{ grid.grid }}</td>
                    <td>${{ grid.price.toFixed(6) }}</td>
                    <td>{{ grid.amount.toFixed(2) }}</td>
                    <td>{{ grid.qty.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="info-note" style="margin-top: 20px;">
          <strong>🎯 Rezultat Final ({{ demoConfig.pair }}):</strong><br>
          Cu 10 grids și "Buy & Sell" mode, vei avea:
          <ul>
            <li><strong>5 ordere BUY</strong> plasate uniform între {{ demoConfig.lowerPrice }} și {{ demoConfig.midPrice }} USDC (sub mid price)</li>
            <li><strong>5 ordere SELL</strong> plasate uniform între {{ demoConfig.midPrice }} și {{ demoConfig.upperPrice }} USDC (peste mid price)</li>
          </ul>
          Toate ordinele sunt distribuite <strong>UNIFORM</strong> cu spacing constant în fiecare zonă!
          <div v-if="!tickerData" style="color: #f39c12; margin-top: 8px;">
            💡 <strong>Selectează un ticker din navbar pentru a vedea calcule live!</strong>
          </div>
        </div>
      </div>

      <!-- BUY ONLY / SELL ONLY MODES -->
      <div class="how-it-works-card">
        <h3 class="how-title">🔀 Moduri Alternative (Buy Only / Sell Only)</h3>

        <div class="mode-comparison">
          <div class="mode-card">
            <div class="mode-name">🟢 Buy Only</div>
            <div class="mode-desc">
              Toate cele 10 grids sunt ordere BUY, distribuite uniform între Lower și Upper Price.
              <br><br>
              <strong>Spacing:</strong> (Upper - Lower) / 10
              <br>
              <strong>Exemplu:</strong> (0.05 - 0.03) / 10 = 0.002 USDC per grid
            </div>
          </div>

          <div class="mode-card">
            <div class="mode-name">🔴 Sell Only</div>
            <div class="mode-desc">
              Toate cele 10 grids sunt ordere SELL, distribuite uniform între Lower și Upper Price.
              <br><br>
              <strong>Spacing:</strong> (Upper - Lower) / 10
              <br>
              <strong>Exemplu:</strong> (0.05 - 0.03) / 10 = 0.002 USDC per grid
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 1: BASIC PARAMETERS -->
    <div class="section">
      <h2 class="section-title">🎯 Basic Parameters</h2>

      <div class="param-grid">
        <div class="param-card">
          <div class="param-name">Lower Price</div>
          <div class="param-desc">
            Prețul minim al grid-ului. Toate ordinele BUY vor fi plasate între acest preț și Upper Price.
            <br><br>
            <strong>Exemplu:</strong> Lower = 0.03 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Upper Price</div>
          <div class="param-desc">
            Prețul maxim al grid-ului. Toate ordinele SELL vor fi plasate între Lower Price și acest preț.
            <br><br>
            <strong>Exemplu:</strong> Upper = 0.05 USDC
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Number of Grids</div>
          <div class="param-desc">
            Numărul de nivele (grids) între Lower și Upper. Prețurile sunt distribuite uniform.
            <br><br>
            <strong>Exemplu:</strong> 10 grids → 10 ordere BUY + 10 ordere SELL
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Amount Type</div>
          <div class="param-desc">
            Cum se calculează cantitatea pentru fiecare ordin:
            <ul>
              <li><strong>Qty Per Grid:</strong> Cantitate fixă pentru fiecare grid</li>
              <li><strong>Total Amount:</strong> Buget total împărțit la grids</li>
              <li><strong>Incremental Amount:</strong> Cantitate care crește progresiv (cu increment %)</li>
            </ul>
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Amount</div>
          <div class="param-desc">
            Valoarea în USDC (quote currency):
            <ul>
              <li><strong>Qty Per Grid:</strong> USDC per grid (ex: 100 USDC/grid)</li>
              <li><strong>Total Amount:</strong> Buget total (ex: 1000 USDC total)</li>
              <li><strong>Incremental:</strong> USDC pentru primul grid</li>
            </ul>
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Orders Side</div>
          <div class="param-desc">
            Ce tipuri de ordere se plasează:
            <ul>
              <li><strong>Buy & Sell:</strong> Grid complet (BUY + SELL)</li>
              <li><strong>Buy Only:</strong> Doar ordere BUY</li>
              <li><strong>Sell Only:</strong> Doar ordere SELL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: INCREMENTAL PARAMETERS -->
    <div class="section">
      <h2 class="section-title">📈 Incremental Amount (Progressive Scaling)</h2>

      <div class="info-box">
        <p>
          <strong>Incremental Amount</strong> este o strategie de creștere progresivă a cantității pentru fiecare grid.
          <br>
          ⚠️ Se aplică DOAR la <strong>crearea inițială a grid-ului</strong>, NU după filled orders!
        </p>
      </div>

      <div class="warning-box" style="margin-bottom: 10px;">
        <strong>📐 Formula Exactă (din GridBotLib.js):</strong>
        <br><br>
        <code style="color: #10eb04; font-size: 10px;">
          Qty per Grid = (Amount + ((Amount / 100) × (Increment% × Index))) / Price
        </code>
        <br><br>
        Unde <strong>Index</strong> = poziția gridului (1, 2, 3, ..., 10)
      </div>

      <div class="param-grid">
        <div class="param-card">
          <div class="param-name">Inc. % Amount Buy</div>
          <div class="param-desc">
            Procent cu care crește <strong>Amount-ul (USDC)</strong> pentru fiecare grid BUY, bazat pe index.
            <br><br>
            <strong>Exemplu (Amount = 100 USDC, Increment = 1%):</strong>
            <ul>
              <li>Grid 1 (index=1): 100 + (100 × 0.01 × 1) = <strong>101 USDC</strong></li>
              <li>Grid 2 (index=2): 100 + (100 × 0.01 × 2) = <strong>102 USDC</strong></li>
              <li>Grid 3 (index=3): 100 + (100 × 0.01 × 3) = <strong>103 USDC</strong></li>
              <li>Grid 5 (index=5): 100 + (100 × 0.01 × 5) = <strong>105 USDC</strong></li>
            </ul>
            <br>
            ➜ BUY orders sunt <strong>DESCRESCĂTOARE</strong> în preț (de la cel mai mare la cel mai mic)
            <br>
            ➜ Cantitatea crește progresiv pe măsură ce prețul scade (buy more when cheaper!)
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Inc. % Amount Sell</div>
          <div class="param-desc">
            Procent cu care crește <strong>Amount-ul (USDC)</strong> pentru fiecare grid SELL, bazat pe index.
            <br><br>
            <strong>Exemplu (Amount = 100 USDC, Increment = 1%):</strong>
            <ul>
              <li>Grid 1 (index=1): 100 + (100 × 0.01 × 1) = <strong>101 USDC</strong></li>
              <li>Grid 2 (index=2): 100 + (100 × 0.01 × 2) = <strong>102 USDC</strong></li>
              <li>Grid 3 (index=3): 100 + (100 × 0.01 × 3) = <strong>103 USDC</strong></li>
              <li>Grid 5 (index=5): 100 + (100 × 0.01 × 5) = <strong>105 USDC</strong></li>
            </ul>
            <br>
            ➜ SELL orders sunt <strong>CRESCĂTOARE</strong> în preț (de la cel mai mic la cel mai mare)
            <br>
            ➜ Cantitatea crește progresiv pe măsură ce prețul crește (sell more when higher!)
          </div>
        </div>
      </div>

      <div class="info-box">
        <strong>🔑 Diferența Cheie:</strong>
        <br>
        • <strong>Incremental Amount:</strong> Se aplică la crearea grid-ului (prima dată când botul plasează ordinele)
        <br>
        • <strong>Deviation Amount:</strong> Se aplică după ce un ordin este FILLED (în cicluri ulterioare)
      </div>
    </div>

    <!-- SECTION 3: DEVIATION PARAMETERS -->
    <div class="section">
      <h2 class="section-title">🔄 Deviation (Rebound Strategy)</h2>

      <div class="warning-box">
        <strong>⚠️ ATENȚIE:</strong> Deviation se aplică DOAR când un ordin este FILLED (executat)!
        <br>
        Următorul ordin (în ciclu) va fi plasat cu deviation aplicată.
      </div>

      <div class="param-grid">
        <div class="param-card highlight">
          <div class="param-name">Deviation Price Buy (%)</div>
          <div class="param-desc">
            Procent cu care SCADE prețul pentru următorul ordin BUY după ce un <strong>SELL este FILLED</strong>.
            <br><br>
            <strong>Logică:</strong> După ce vinzi (SELL filled), vrei să cumperi (BUY) mai jos → profit din diferență!
            <br><br>
            <strong>Exemplu:</strong>
            <ul>
              <li><strong>SELL</strong> Grid 1 filled la 0.0460 USDC (ai vândut)</li>
              <li>Deviation Price Buy = 10%</li>
              <li>➜ Următorul <strong>BUY</strong> la: 0.0460 × (1 - 0.10) = <strong>0.0414 USDC</strong></li>
              <li>💰 Profit: ai vândut la 0.0460, cumperi la 0.0414 = 0.0046 USDC/token</li>
            </ul>
          </div>
        </div>

        <div class="param-card highlight">
          <div class="param-name">Deviation Price Sell (%)</div>
          <div class="param-desc">
            Procent cu care CREȘTE prețul pentru următorul ordin SELL după ce un <strong>BUY este FILLED</strong>.
            <br><br>
            <strong>Logică:</strong> După ce cumperi (BUY filled), vrei să vinzi (SELL) mai sus → profit din diferență!
            <br><br>
            <strong>Exemplu:</strong>
            <ul>
              <li><strong>BUY</strong> Grid 1 filled la 0.0400 USDC (ai cumpărat)</li>
              <li>Deviation Price Sell = 11%</li>
              <li>➜ Următorul <strong>SELL</strong> la: 0.0400 × (1 + 0.11) = <strong>0.0444 USDC</strong></li>
              <li>💰 Profit: ai cumpărat la 0.0400, vinzi la 0.0444 = 0.0044 USDC/token</li>
            </ul>
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Deviation Amount Buy (%)</div>
          <div class="param-desc">
            Procent cu care se MODIFICĂ cantitatea pentru următorul ordin BUY după ce un <strong>SELL este FILLED</strong>.
            <br><br>
            <strong>Exemplu:</strong>
            <ul>
              <li><strong>SELL</strong> filled: 100 USDC worth sold</li>
              <li>Deviation Amount Buy = 0.1% (increase)</li>
              <li>➜ Următorul <strong>BUY</strong>: 100.1 USDC</li>
            </ul>
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Deviation Amount Sell (%)</div>
          <div class="param-desc">
            Procent cu care se MODIFICĂ cantitatea pentru următorul ordin SELL după ce un <strong>BUY este FILLED</strong>.
            <br><br>
            <strong>Exemplu:</strong>
            <ul>
              <li><strong>BUY</strong> filled: 100 USDC worth bought</li>
              <li>Deviation Amount Sell = 2% (increase)</li>
              <li>➜ Următorul <strong>SELL</strong>: 102 USDC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 4: COMPLETE DEMO EXAMPLE -->
    <div class="section demo-section">
      <h2 class="section-title">🎮 Demo Complete: LCX/USDC Grid Bot</h2>

      <div class="demo-config">
        <h3>📋 Configurație Inițială (Date Din Ticker Live 📊)</h3>
        <div v-if="!tickerData" style="color: #f39c12; padding: 10px; border: 1px solid #f39c12; border-radius: 4px; margin-bottom: 10px;">
          💡 <strong>Selectează un ticker din navbar pentru a vedea demo cu prețuri live!</strong>
          <br>Valorile de mai jos sunt exemple statice.
        </div>
        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">Pair:</span>
            <span class="config-value">{{ demoConfig.pair }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Lower Price:</span>
            <span class="config-value">{{ demoConfig.lowerPrice }} USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Upper Price:</span>
            <span class="config-value">{{ demoConfig.upperPrice }} USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Mid Price:</span>
            <span class="config-value">{{ demoConfig.midPrice }} USDC</span>
          </div>
          <div class="config-item">
            <span class="config-label">Nr of Grids:</span>
            <span class="config-value">{{ demoConfig.nrOfGrids }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Amount Type:</span>
            <span class="config-value">Incremental Amount</span>
          </div>
          <div class="config-item">
            <span class="config-label">Amount:</span>
            <span class="config-value">{{ demoConfig.amount }} USDC (primul grid)</span>
          </div>
          <div class="config-item">
            <span class="config-label">Inc. % Amount Buy:</span>
            <span class="config-value">{{ demoConfig.incrementBuy }}%</span>
          </div>
          <div class="config-item">
            <span class="config-label">Inc. % Amount Sell:</span>
            <span class="config-value">{{ demoConfig.incrementSell }}%</span>
          </div>
          <div class="config-item highlight-dev">
            <span class="config-label">Deviation Price Buy:</span>
            <span class="config-value">{{ demoConfig.deviationPriceBuy }}%</span>
          </div>
          <div class="config-item highlight-dev">
            <span class="config-label">Deviation Price Sell:</span>
            <span class="config-value">{{ demoConfig.deviationPriceSell }}%</span>
          </div>
          <div class="config-item highlight-dev">
            <span class="config-label">Deviation Amount Buy:</span>
            <span class="config-value">{{ demoConfig.deviationAmountBuy }}%</span>
          </div>
          <div class="config-item highlight-dev">
            <span class="config-label">Deviation Amount Sell:</span>
            <span class="config-value">{{ demoConfig.deviationAmountSell }}%</span>
          </div>
        </div>
      </div>

      <!-- INITIAL GRID ORDERS -->
      <div class="demo-step">
        <h3>📊 Ciclu 1: Ordere Inițiale (Create Grid Bot)</h3>

        <div class="orders-container">
          <!-- BUY ORDERS -->
          <div class="orders-column buy-column">
            <div class="column-title buy-title">🟢 BUY Orders (10 grids)</div>

            <table class="orders-table">
              <thead>
                <tr>
                  <th>Grid</th>
                  <th>Price (USDC)</th>
                  <th>Amount (USDC)</th>
                  <th>LCX Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>0.03000</td><td>100.00</td><td>3,333.33</td></tr>
                <tr><td>2</td><td>0.03222</td><td>101.00</td><td>3,134.48</td></tr>
                <tr><td>3</td><td>0.03444</td><td>102.01</td><td>2,962.21</td></tr>
                <tr><td>4</td><td>0.03667</td><td>103.03</td><td>2,810.52</td></tr>
                <tr><td>5</td><td>0.03889</td><td>104.06</td><td>2,675.97</td></tr>
                <tr><td>6</td><td>0.04111</td><td>105.10</td><td>2,556.09</td></tr>
                <tr><td>7</td><td>0.04333</td><td>106.15</td><td>2,449.72</td></tr>
                <tr><td>8</td><td>0.04556</td><td>107.21</td><td>2,353.26</td></tr>
                <tr><td>9</td><td>0.04778</td><td>108.29</td><td>2,266.73</td></tr>
                <tr><td>10</td><td>0.05000</td><td>109.37</td><td>2,187.40</td></tr>
              </tbody>
            </table>
          </div>

          <!-- SELL ORDERS -->
          <div class="orders-column sell-column">
            <div class="column-title sell-title">🔴 SELL Orders (10 grids)</div>

            <table class="orders-table">
              <thead>
                <tr>
                  <th>Grid</th>
                  <th>Price (USDC)</th>
                  <th>Amount (USDC)</th>
                  <th>LCX Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>0.03222</td><td>100.00</td><td>3,104.21</td></tr>
                <tr><td>2</td><td>0.03444</td><td>101.00</td><td>2,932.36</td></tr>
                <tr><td>3</td><td>0.03667</td><td>102.01</td><td>2,781.65</td></tr>
                <tr><td>4</td><td>0.03889</td><td>103.03</td><td>2,649.91</td></tr>
                <tr><td>5</td><td>0.04111</td><td>104.06</td><td>2,530.98</td></tr>
                <tr><td>6</td><td>0.04333</td><td>105.10</td><td>2,425.45</td></tr>
                <tr><td>7</td><td>0.04556</td><td>106.15</td><td>2,329.70</td></tr>
                <tr><td>8</td><td>0.04778</td><td>107.21</td><td>2,243.79</td></tr>
                <tr><td>9</td><td>0.05000</td><td>108.29</td><td>2,165.80</td></tr>
                <tr><td>10</td><td>0.05000</td><td>109.37</td><td>2,187.40</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="info-box">
          <strong>💡 Explicație Increment:</strong>
          <ul>
            <li>Grid 1: Amount = 100 USDC</li>
            <li>Grid 2: Amount = 100 × 1.01 = 101 USDC (+1%)</li>
            <li>Grid 3: Amount = 101 × 1.01 = 102.01 USDC (+1%)</li>
            <li>...</li>
            <li>Grid 10: Amount = 109.37 USDC</li>
          </ul>
          <strong>Price Spacing:</strong> (0.05 - 0.03) / 10 = 0.00222 USDC per grid
        </div>
      </div>

      <!-- CYCLE 2: AFTER FIRST SELL FILLED -->
      <div class="demo-step">
        <h3>🔄 Ciclu 2: După ce SELL Grid 1 este FILLED</h3>

        <div class="cycle-event">
          <div class="event-box filled-event sell-event">
            <strong>✅ Eveniment:</strong> SELL Grid 1 FILLED la 0.03222 USDC (vândut 3,104.21 LCX)
            <br>
            💰 Ai vândut → acum vrei să cumperi mai jos cu BUY!
          </div>
        </div>

        <div class="deviation-calc">
          <h4>📐 Calculul Noului Ordin BUY (cu Deviation Buy)</h4>

          <div class="calc-steps">
            <div class="calc-step">
              <span class="step-label">Preț la care s-a executat SELL:</span>
              <span class="step-value">0.03222 USDC</span>
            </div>
            <div class="calc-step highlight-calc">
              <span class="step-label">Deviation Price Buy aplicată:</span>
              <span class="step-value">-10% (cumperi MAI JOS)</span>
            </div>
            <div class="calc-step">
              <span class="step-label">➜ Nou preț BUY:</span>
              <span class="step-value">0.03222 × (1 - 0.10) = <strong>0.02900 USDC</strong></span>
            </div>
            <div class="calc-step">
              <span class="step-label">Amount SELL care s-a executat:</span>
              <span class="step-value">100.00 USDC</span>
            </div>
            <div class="calc-step highlight-calc">
              <span class="step-label">Deviation Amount Buy aplicată:</span>
              <span class="step-value">+0.1%</span>
            </div>
            <div class="calc-step">
              <span class="step-label">➜ Nou amount BUY:</span>
              <span class="step-value">100.00 × (1 + 0.001) = 100.10 USDC</span>
            </div>
          </div>

          <div class="result-box buy-result">
            <strong>🎯 Rezultat:</strong> Noul ordin BUY se plasează la:
            <br>
            <span class="result-price">Price: 0.02900 USDC</span>
            <span class="result-amount">Amount: 100.10 USDC</span>
            <span class="result-qty">Qty: 3,451.72 LCX</span>
            <br><br>
            <span class="profit-note">💰 Profit potențial: Ai vândut la 0.03222, cumperi la 0.02900 = 0.00322 USDC/LCX (10% profit)</span>
          </div>
        </div>
      </div>

      <!-- CYCLE 3: AFTER FIRST BUY FILLED -->
      <div class="demo-step">
        <h3>🔄 Ciclu 3: După ce BUY Grid 1 este FILLED</h3>

        <div class="cycle-event">
          <div class="event-box filled-event buy-event">
            <strong>✅ Eveniment:</strong> BUY Grid 1 FILLED la 0.03000 USDC (cumpărat 3,333.33 LCX)
            <br>
            💰 Ai cumpărat → acum vrei să vinzi mai sus cu SELL!
          </div>
        </div>

        <div class="deviation-calc">
          <h4>📐 Calculul Noului Ordin SELL (cu Deviation Sell)</h4>

          <div class="calc-steps">
            <div class="calc-step">
              <span class="step-label">Preț la care s-a executat BUY:</span>
              <span class="step-value">0.03000 USDC</span>
            </div>
            <div class="calc-step highlight-calc">
              <span class="step-label">Deviation Price Sell aplicată:</span>
              <span class="step-value">+11% (vinzi MAI SUS)</span>
            </div>
            <div class="calc-step">
              <span class="step-label">➜ Nou preț SELL:</span>
              <span class="step-value">0.03000 × (1 + 0.11) = <strong>0.03330 USDC</strong></span>
            </div>
            <div class="calc-step">
              <span class="step-label">Amount BUY care s-a executat:</span>
              <span class="step-value">100.00 USDC</span>
            </div>
            <div class="calc-step highlight-calc">
              <span class="step-label">Deviation Amount Sell aplicată:</span>
              <span class="step-value">+2%</span>
            </div>
            <div class="calc-step">
              <span class="step-label">➜ Nou amount SELL:</span>
              <span class="step-value">100.00 × (1 + 0.02) = 102.00 USDC</span>
            </div>
          </div>

          <div class="result-box sell-result">
            <strong>🎯 Rezultat:</strong> Noul ordin SELL se plasează la:
            <br>
            <span class="result-price">Price: 0.03330 USDC</span>
            <span class="result-amount">Amount: 102.00 USDC</span>
            <span class="result-qty">Qty: 3,063.06 LCX</span>
            <br><br>
            <span class="profit-note">💰 Profit potențial: Ai cumpărat la 0.03000, vinzi la 0.03330 = 0.00330 USDC/LCX (11% profit)</span>
          </div>
        </div>
      </div>

      <!-- KEY INSIGHTS -->
      <div class="insights-section">
        <h3>💡 Key Insights (Concluzii Importante)</h3>

        <div class="insight-grid">
          <div class="insight-card">
            <div class="insight-icon">🎯</div>
            <div class="insight-title">Deviation = Rebound Strategy</div>
            <div class="insight-text">
              Deviation permite botului să "reboundeze" după ordere filled:
              <ul>
                <li>BUY filled → următorul BUY mai jos (catch dips)</li>
                <li>SELL filled → următorul SELL mai sus (ride pumps)</li>
              </ul>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">⏱️</div>
            <div class="insight-title">Deviation se aplică DOAR la Filled</div>
            <div class="insight-text">
              IMPORTANT: Deviation NU se aplică la crearea inițială a grid-ului!
              <br><br>
              Se aplică doar când un ordin este EXECUTAT (filled) și se plasează următorul ordin în ciclu.
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">🔢</div>
            <div class="insight-title">Increment vs Deviation</div>
            <div class="insight-text">
              <strong>Increment:</strong> Modifică cantitatea între grids (la început)
              <br><br>
              <strong>Deviation:</strong> Modifică prețul și cantitatea DUPĂ filled (în cicluri)
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">📈</div>
            <div class="insight-title">Compound Effect</div>
            <div class="insight-text">
              După mai multe cicluri, deviation creează un efect compus:
              <ul>
                <li>BUY orders coboară progresiv (buy the dip dip)</li>
                <li>SELL orders urcă progresiv (sell the moon)</li>
                <li>Amount-urile cresc/scad gradual</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 5: PRICE GROUP -->
    <div class="section">
      <h2 class="section-title">🎲 Price Group (Advanced)</h2>

      <div class="param-grid">
        <div class="param-card">
          <div class="param-name">Use Price Group</div>
          <div class="param-desc">
            Activează funcționalitatea Price Group pentru a plasa ordere în "grupuri" de prețuri specifice.
            <br><br>
            Util pentru a alinia ordinele cu nivele psihologice (ex: 0.10, 0.20, 0.30).
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Price Group Buy</div>
          <div class="param-desc">
            Rotunjește prețurile BUY la acest interval.
            <br><br>
            <strong>Exemplu:</strong> Price Group Buy = 0.001
            <br>
            → Prețuri vor fi 0.030, 0.031, 0.032 (nu 0.03044)
          </div>
        </div>

        <div class="param-card">
          <div class="param-name">Price Group Sell</div>
          <div class="param-desc">
            Rotunjește prețurile SELL la acest interval.
            <br><br>
            <strong>Exemplu:</strong> Price Group Sell = 0.005
            <br>
            → Prețuri vor fi 0.035, 0.040, 0.045 (nivele "rotunde")
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
import { useAppStore } from '~/stores/app.store';
import { ref, computed, watch, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();

// Reactive data for dynamic demo
const tickerData = ref(null);
const loading = ref(true);
const demoConfig = ref({
  pair: 'LCX/USDC',
  nrOfGrids: 10,
  lowerPrice: 0.03,
  upperPrice: 0.05,
  midPrice: 0.04,
  amount: 100,
  incrementBuy: 1,
  incrementSell: 1,
  deviationPriceBuy: 10,
  deviationPriceSell: 11,
  deviationAmountBuy: 0.1,
  deviationAmountSell: 2
});

// Load ticker data from store
async function loadTickerData() {
  loading.value = true;

  try {
    const selectedTicker = app.getSelectedTicker;
    const selectedExchange = app.getSelectedExchange;

    if (!selectedTicker || !selectedExchange) {
      console.log('📊 No ticker selected, using default LCX/USDC demo');
      loading.value = false;
      return;
    }

    console.log('📊 Loading ticker data:', selectedTicker, selectedExchange);

    // Fetch ticker from API
    const userID = useCookie('userID');
    const response = await $fetch('/api/v1/fetchTicker', {
      method: 'GET',
      query: {
        userID: userID.value,
        exchange: selectedExchange,
        symbol: selectedTicker
      }
    });

    if (response && response.success) {
      tickerData.value = response.data;

      // Calculate dynamic prices
      const bid = parseFloat(response.data.bid);
      const ask = parseFloat(response.data.ask);
      const last = parseFloat(response.data.last);

      // Calculate mid price
      const midPrice = (bid + ask) / 2;

      // Calculate Lower/Upper (±10%)
      const lowerPrice = midPrice * 0.90;
      const upperPrice = midPrice * 1.10;

      // Update demo config
      demoConfig.value = {
        ...demoConfig.value,
        pair: selectedTicker,
        lowerPrice: parseFloat(lowerPrice.toFixed(6)),
        upperPrice: parseFloat(upperPrice.toFixed(6)),
        midPrice: parseFloat(midPrice.toFixed(6))
      };

      console.log('✅ Demo config updated:', demoConfig.value);
    }

  } catch (error) {
    console.error('❌ Error loading ticker:', error);
  } finally {
    loading.value = false;
  }
}

// Calculate BUY grid prices (DESCENDING - from mid to lower)
const buyGridPrices = computed(() => {
  if (!demoConfig.value) return [];

  const grids = [];
  const midPrice = demoConfig.value.midPrice;
  const lowerPrice = demoConfig.value.lowerPrice;
  const spacing = (midPrice - lowerPrice) / 5;

  // Generate 5 BUY grids from mid to lower (descending)
  for (let i = 0; i < 5; i++) {
    const price = midPrice - (spacing * (i + 1));
    const amountUSDC = calculateIncrementalAmount(demoConfig.value.amount, demoConfig.value.incrementBuy, i + 1);

    grids.push({
      grid: i + 1,
      price: parseFloat(price.toFixed(6)),
      amount: amountUSDC,
      qty: parseFloat((amountUSDC / price).toFixed(2))
    });
  }

  return grids.reverse(); // Reverse to show descending order (highest to lowest)
});

// Calculate SELL grid prices (ASCENDING - from mid to upper)
const sellGridPrices = computed(() => {
  if (!demoConfig.value) return [];

  const grids = [];
  const midPrice = demoConfig.value.midPrice;
  const upperPrice = demoConfig.value.upperPrice;
  const spacing = (upperPrice - midPrice) / 5;

  // Generate 5 SELL grids from mid to upper (ascending)
  for (let i = 0; i < 5; i++) {
    const price = midPrice + (spacing * (i + 1));
    const amountUSDC = calculateIncrementalAmount(demoConfig.value.amount, demoConfig.value.incrementSell, i + 1);

    grids.push({
      grid: i + 1,
      price: parseFloat(price.toFixed(6)),
      amount: amountUSDC,
      qty: parseFloat((amountUSDC / price).toFixed(2))
    });
  }

  return grids;
});

// Calculate incremental amount based on index
function calculateIncrementalAmount(baseAmount, incrementPercent, index) {
  // Formula: Amount + ((Amount / 100) × (Increment% × Index))
  const amount = baseAmount + ((baseAmount / 100) * (incrementPercent * index));
  return parseFloat(amount.toFixed(2));
}

// Calculate quantity for grid
function calculateQuantity(amountUSDC, price) {
  if (!price || price === 0) return 0;
  return parseFloat((amountUSDC / price).toFixed(2));
}

// Watch for ticker changes in store
watch(() => app.getSelectedTicker, () => {
  loadTickerData();
});

watch(() => app.getSelectedExchange, () => {
  loadTickerData();
});

// Load on mount
onMounted(() => {
  loadTickerData();
});
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
  color: #10eb04;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.4);
  padding: 8px;
  background: #0f0f0f;
  border-radius: 6px;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.section {
  margin-bottom: 15px;
  padding: 12px;
  background: #0f0f0f;
  border-radius: 6px;
  border: 1px solid #222;
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
  border-color: #10eb04;
  box-shadow: 0 0 10px rgba(16, 235, 4, 0.15);
  transform: translateY(-1px);
}

.param-card.highlight {
  border: 1px solid #f39c12;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1410 100%);
}

.param-name {
  font-size: 11px;
  font-weight: 700;
  color: #10eb04;
  margin-bottom: 6px;
  text-shadow: 0 0 4px rgba(16, 235, 4, 0.3);
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

/* DEMO SECTION STYLES */
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

.config-item.highlight-dev {
  border: 1px solid #f39c12;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1410 100%);
}

.config-label {
  color: #777;
  font-weight: 600;
}

.config-value {
  color: #10eb04;
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

.orders-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.orders-column {
  background: #000;
  padding: 8px;
  border-radius: 4px;
}

.buy-column {
  border: 1px solid #10eb04;
}

.sell-column {
  border: 1px solid #e90a15;
}

.column-title {
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  padding: 5px;
  border-radius: 3px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.buy-title {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  border: 1px solid #10eb04;
}

.sell-title {
  background: rgba(233, 10, 21, 0.1);
  color: #e90a15;
  border: 1px solid #e90a15;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.orders-table th {
  background: #0f0f0f;
  color: #f5a623;
  padding: 4px 6px;
  text-align: right;
  border-bottom: 1px solid #333;
  font-weight: 700;
  font-size: 8px;
  text-transform: uppercase;
}

.orders-table th:first-child {
  text-align: center;
}

.orders-table td {
  padding: 3px 6px;
  text-align: right;
  border-bottom: 1px solid #1a1a1a;
  color: #999;
}

.orders-table td:first-child {
  text-align: center;
  color: #10eb04;
  font-weight: 700;
}

.orders-table tbody tr:hover {
  background: #0f0f0f;
}

.cycle-event {
  margin-bottom: 8px;
}

.event-box {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.filled-event {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
  color: #aaffaa;
}

.sell-event {
  background: linear-gradient(135deg, #2e0a01 0%, #1a0a0a 100%);
  border: 1px solid #e90a15;
  color: #ffaaaa;
}

.buy-event {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
  color: #aaffaa;
}

.profit-note {
  display: block;
  margin-top: 6px;
  padding: 5px 8px;
  background: rgba(245, 166, 35, 0.1);
  border-left: 2px solid #f5a623;
  border-radius: 3px;
  color: #f5a623;
  font-weight: 600;
  font-size: 9px;
}

.deviation-calc {
  background: #000;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f39c12;
  margin-bottom: 10px;
}

.deviation-calc h4 {
  color: #f5a623;
  font-size: 11px;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
}

.calc-steps {
  margin-bottom: 10px;
}

.calc-step {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  margin-bottom: 4px;
  background: #0f0f0f;
  border-radius: 3px;
  border: 1px solid #222;
  font-size: 9px;
}

.calc-step.highlight-calc {
  border: 1px solid #f39c12;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1410 100%);
}

.step-label {
  color: #777;
  font-weight: 600;
}

.step-value {
  color: #10eb04;
  font-weight: 700;
}

.result-box {
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.buy-result {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
  color: #10eb04;
}

.sell-result {
  background: linear-gradient(135deg, #2e0a01 0%, #1a0a0a 100%);
  border: 1px solid #e90a15;
  color: #ff6666;
}

.result-price, .result-amount, .result-qty {
  display: block;
  margin: 3px 0;
  font-size: 9px;
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

.insight-text ul {
  margin: 4px 0;
  padding-left: 12px;
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

/* HOW IT WORKS SECTION STYLES */
.how-it-works-section {
  border: 1px solid #05f5ed;
  background: linear-gradient(135deg, #0a1a2e 0%, #0f1520 100%);
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
  color: #05f5ed;
  margin-bottom: 8px;
  text-shadow: 0 0 6px rgba(5, 245, 237, 0.4);
  font-weight: 700;
  text-transform: uppercase;
}

.calc-box {
  background: #0f0f0f;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #f39c12;
}

.calc-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: #000;
  border-radius: 4px;
  margin-bottom: 8px;
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
  margin-bottom: 6px;
  font-size: 9px;
}

.calc-example ul {
  margin: 4px 0;
  padding-left: 12px;
}

.highlight-green {
  color: #10eb04;
  font-weight: 700;
}

.highlight-red {
  color: #e90a15;
  font-weight: 700;
}

.highlight-yellow {
  color: #f5a623;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(245, 166, 35, 0.4);
}

.highlight-value {
  color: #05f5ed;
  font-weight: 700;
}

.info-note {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border-left: 2px solid #10eb04;
  padding: 6px 8px;
  border-radius: 3px;
  margin-top: 6px;
  font-size: 9px;
}

.grid-formation-visual {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  margin: 10px 0;
}

.visual-section {
  background: #000;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
}

.visual-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #f39c12;
}

.formula-box {
  background: #0f0f0f;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #f39c12;
  margin-bottom: 6px;
}

.formula-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 9px;
}

.formula-highlight {
  color: #f5a623;
  font-weight: 700;
  font-size: 9px;
}

.example-box {
  padding: 6px 8px;
  background: #0a0a0a;
  border-radius: 4px;
  font-size: 9px;
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
}

.mini-table th {
  background: #0f0f0f;
  color: #f5a623;
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #333;
  font-weight: 700;
  text-transform: uppercase;
}

.mini-table td {
  padding: 2px 4px;
  text-align: center;
  border-bottom: 1px solid #1a1a1a;
  color: #999;
}

.mini-table td:first-child {
  color: #10eb04;
  font-weight: 700;
}

.mini-table tbody tr:hover {
  background: #0f0f0f;
}

.mode-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-card {
  background: #000;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
  transition: all 0.2s ease;
}

.mode-card:hover {
  border-color: #10eb04;
  box-shadow: 0 0 12px rgba(16, 235, 4, 0.2);
  transform: translateY(-1px);
}

.mode-name {
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 6px;
  text-align: center;
  padding: 5px;
  background: #0f0f0f;
  border-radius: 3px;
  text-transform: uppercase;
}

.mode-desc {
  font-size: 9px;
  line-height: 1.3;
  color: #999;
}
</style>
