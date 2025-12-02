# PowerShell script to create all Palantir pages

$pages = @(
    @{Path="Bots/BotTemplates"; Title="BOT TEMPLATES"; Icon="📋"; Color="#10eb04"; Desc="Pre-configured Templates"},
    @{Path="Bots/BotPerformance"; Title="BOT PERFORMANCE"; Icon="📈"; Color="#00d4ff"; Desc="Performance Tracking"},
    @{Path="Bots/BotScheduler"; Title="BOT SCHEDULER"; Icon="⏰"; Color="#f5a623"; Desc="Scheduled Execution"},
    @{Path="Bots/BotBacktest"; Title="BOT BACKTEST"; Icon="🔬"; Color="#8a2be2"; Desc="Strategy Backtesting"},
    @{Path="Analytics/MarketHeatmap"; Title="MARKET HEATMAP"; Icon="🗺️"; Color="#f52a09"; Desc="Visual Market Overview"},
    @{Path="Analytics/CorrelationMatrix"; Title="CORRELATION MATRIX"; Icon="🔗"; Color="#00d4ff"; Desc="Asset Correlations"},
    @{Path="Analytics/SentimentAnalysis"; Title="SENTIMENT ANALYSIS"; Icon="💭"; Color="#10eb04"; Desc="Market Sentiment"},
    @{Path="Analytics/VolumeProfile"; Title="VOLUME PROFILE"; Icon="📊"; Color="#f5a623"; Desc="Volume Analysis"},
    @{Path="Analytics/OnChainMetrics"; Title="ON-CHAIN METRICS"; Icon="⛓️"; Color="#8a2be2"; Desc="Blockchain Data"},
    @{Path="Risk/PortfolioRisk"; Title="PORTFOLIO RISK"; Icon="⚠️"; Color="#f52a09"; Desc="Risk Assessment"},
    @{Path="Risk/StopLossManager"; Title="STOP-LOSS MANAGER"; Icon="🛑"; Color="#f52a09"; Desc="Stop-Loss Control"},
    @{Path="Risk/PositionSizing"; Title="POSITION SIZING"; Icon="💰"; Color="#10eb04"; Desc="Size Calculator"},
    @{Path="Risk/DrawdownAnalysis"; Title="DRAWDOWN ANALYSIS"; Icon="📉"; Color="#f5a623"; Desc="Drawdown Tracking"},
    @{Path="Automation/RulesEngine"; Title="RULES ENGINE"; Icon="⚙️"; Color="#00d4ff"; Desc="Automation Builder"},
    @{Path="Automation/Webhooks"; Title="WEBHOOKS"; Icon="🔔"; Color="#10eb04"; Desc="Webhook Management"},
    @{Path="Automation/AlertCenter"; Title="ALERT CENTER"; Icon="🚨"; Color="#f52a09"; Desc="Alert Management"},
    @{Path="Reports/DailyReport"; Title="DAILY REPORT"; Icon="📋"; Color="#00d4ff"; Desc="Daily Summary"},
    @{Path="Reports/TaxReport"; Title="TAX REPORT"; Icon="💼"; Color="#f5a623"; Desc="Tax Reporting"},
    @{Path="Insights/AIInsights"; Title="AI INSIGHTS"; Icon="🤖"; Color="#8a2be2"; Desc="AI Recommendations"},
    @{Path="Social/CopyTrading"; Title="COPY TRADING"; Icon="👥"; Color="#10eb04"; Desc="Copy Traders"},
    @{Path="Social/SignalSharing"; Title="SIGNAL SHARING"; Icon="📡"; Color="#00d4ff"; Desc="Share Signals"},
    @{Path="Tools/StrategyBuilder"; Title="STRATEGY BUILDER"; Icon="🔧"; Color="#f5a623"; Desc="Visual Builder"},
    @{Path="Settings/PalantirSettings"; Title="SETTINGS"; Icon="⚙️"; Color="#666"; Desc="System Settings"}
)

foreach ($page in $pages) {
    $template = @"
<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid $($page.Color);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
        <div style="font-size: 24px;">$($page.Icon)</div>
        <div>
          <h1 style="margin: 0; font-size: 20px; color: $($page.Color); font-weight: 700;">$($page.Title)</h1>
          <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">$($page.Desc)</p>
        </div>
      </div>
    </div>
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 30px; border-radius: 8px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">$($page.Icon)</div>
      <div style="color: $($page.Color); font-size: 18px; font-weight: 700; margin-bottom: 10px;">$($page.Title)</div>
      <div style="color: #888; font-size: 12px;">$($page.Desc) - Coming Soon</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
</script>
"@
    
    $filePath = "pages/PalantirApp/$($page.Path).vue"
    Set-Content -Path $filePath -Value $template
    Write-Host "Created: $filePath" -ForegroundColor Green
}

Write-Host "`nAll 23 pages created successfully!" -ForegroundColor Cyan
