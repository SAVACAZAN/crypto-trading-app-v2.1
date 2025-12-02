<template>
  <Transition name="fade">
    <div v-if="showOverlay" class="welcome-overlay" @click="closeOverlay">
      <div class="welcome-card" @click.stop>
        <!-- Close Button -->
        <button class="close-btn" @click="closeOverlay" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Welcome Content -->
        <div class="welcome-content">
          <!-- Header with Emoji -->
          <div class="welcome-header">
            <h1 class="welcome-title">
              <span class="emoji-icon">🚀</span>
              <span class="title-text">Welcome to Crypto App</span>
              <span class="emoji-icon">✨</span>
            </h1>
            <p class="welcome-subtitle">Advanced Multi-Exchange Trading Platform</p>
          </div>

          <!-- Features Grid -->
          <div class="features-grid">
            <div class="feature-card">
              <span class="feature-icon">💹</span>
              <h3>Multi-Exchange Trading</h3>
              <p>Trade across multiple exchanges with unified interface</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🤖</span>
              <h3>DCA & Grid Bots</h3>
              <p>Automated trading strategies with AI-powered optimization</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">📊</span>
              <h3>Portfolio Management</h3>
              <p>Track and manage your crypto holdings in real-time</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">⚡</span>
              <h3>Real-Time Trading</h3>
              <p>Lightning-fast order execution and market data</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">📈</span>
              <h3>Technical Indicators</h3>
              <p>Advanced charting with professional indicators</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🧠</span>
              <h3>ML Strategies</h3>
              <p>Machine learning powered trading strategies</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🎰</span>
              <h3>Casino & Betting</h3>
              <p>Integrated gaming and betting services</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">💰</span>
              <h3>Multi-Exchange Support</h3>
              <p>LCX, Coinbase, Kraken, Bitrue and more</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🏛️</span>
              <h3>Palantir Platform</h3>
              <p>Governance, bots deployment & system architecture</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">📈</span>
              <h3>Stock Trading</h3>
              <p>Trade stocks alongside crypto on unified platform</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">🔗</span>
              <h3>Web3 Tools</h3>
              <p>Blockchain integration and decentralized services</p>
            </div>

            <div class="feature-card">
              <span class="feature-icon">👥</span>
              <h3>Social Profiles</h3>
              <p>Connect and share strategies with the community</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="welcome-footer">
            <div class="made-with-love">
              <span class="heart-icon">❤️</span>
              <span>Made with love by</span>
              <span class="creator-name">SAVACAZAN</span>
              <span class="heart-icon">💜</span>
            </div>
            <n-button type="primary" size="large" class="get-started-btn" @click="closeOverlay">
              Get Started
              <template #icon>
                <span style="font-size: 18px;">🚀</span>
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const showOverlay = ref(true);

// Check localStorage to see if user has seen the welcome overlay
onMounted(() => {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  if (hasSeenWelcome === 'true') {
    showOverlay.value = false;
  }
});

const closeOverlay = () => {
  showOverlay.value = false;
  localStorage.setItem('hasSeenWelcome', 'true');
};

// Allow ESC key to close
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && showOverlay.value) {
      closeOverlay();
    }
  };
  window.addEventListener('keydown', handleEscape);
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
  });
});
</script>

<style scoped>
/* Overlay Background */
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* Welcome Card */
.welcome-card {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(10, 1, 24, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%);
  border-radius: 24px;
  border: 2px solid rgba(16, 235, 4, 0.3);
  box-shadow: 0 25px 50px rgba(16, 235, 4, 0.2),
              0 0 100px rgba(5, 245, 237, 0.15);
  padding: 40px;
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.6);
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #ff4444;
}

/* Welcome Content */
.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Header */
.welcome-header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(16, 235, 4, 0.2);
}

.welcome-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 0 0 15px 0;
  font-size: 48px;
  font-weight: 900;
}

.emoji-icon {
  font-size: 52px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title-text {
  background: linear-gradient(135deg, #10eb04, #05f5ed, #10eb04);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient 3s linear infinite;
}

@keyframes gradient {
  to { background-position: 200% center; }
}

.welcome-subtitle {
  margin: 0;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(16, 235, 4, 0.15);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(16, 235, 4, 0.4);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 30px rgba(16, 235, 4, 0.15);
}

.feature-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.feature-card:nth-child(1) .feature-icon { animation-delay: 0s; }
.feature-card:nth-child(2) .feature-icon { animation-delay: 0.2s; }
.feature-card:nth-child(3) .feature-icon { animation-delay: 0.4s; }
.feature-card:nth-child(4) .feature-icon { animation-delay: 0.6s; }
.feature-card:nth-child(5) .feature-icon { animation-delay: 0.8s; }
.feature-card:nth-child(6) .feature-icon { animation-delay: 1s; }
.feature-card:nth-child(7) .feature-icon { animation-delay: 1.2s; }
.feature-card:nth-child(8) .feature-icon { animation-delay: 1.4s; }
.feature-card:nth-child(9) .feature-icon { animation-delay: 1.6s; }
.feature-card:nth-child(10) .feature-icon { animation-delay: 1.8s; }
.feature-card:nth-child(11) .feature-icon { animation-delay: 2s; }
.feature-card:nth-child(12) .feature-icon { animation-delay: 2.2s; }

.feature-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #10eb04;
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* Footer */
.welcome-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 20px;
  border-top: 2px solid rgba(16, 235, 4, 0.2);
}

.made-with-love {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.heart-icon {
  font-size: 24px;
  animation: heartbeat 1.5s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.creator-name {
  font-weight: 900;
  font-size: 22px;
  background: linear-gradient(135deg, #ff00ff, #00ffff, #ff00ff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient 3s linear infinite;
  letter-spacing: 1px;
}

.get-started-btn {
  font-size: 18px;
  font-weight: 700;
  padding: 0 40px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  border: none;
  box-shadow: 0 8px 24px rgba(16, 235, 4, 0.3);
  transition: all 0.3s ease;
}

.get-started-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(16, 235, 4, 0.4);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar Styling */
.welcome-card::-webkit-scrollbar {
  width: 8px;
}

.welcome-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.welcome-card::-webkit-scrollbar-thumb {
  background: rgba(16, 235, 4, 0.3);
  border-radius: 4px;
}

.welcome-card::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 235, 4, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-card {
    padding: 24px;
  }

  .welcome-title {
    font-size: 32px;
    gap: 12px;
  }

  .emoji-icon {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 20px;
  }

  .feature-icon {
    font-size: 40px;
  }

  .made-with-love {
    font-size: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .creator-name {
    font-size: 18px;
  }
}
</style>
