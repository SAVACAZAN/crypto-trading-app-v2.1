<template>
  <div class="voice-commands-wrapper">
    <!-- Voice Button -->
    <button
      @click="toggleListening"
      :class="['voice-btn', { 'listening': isListening, 'processing': isProcessing }]"
      :disabled="!isSupported"
    >
      <div class="icon-wrapper">
        <svg v-if="!isListening && !isProcessing" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
          <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z" fill="currentColor"/>
          <path d="M11 22H13V24H11V22Z" fill="currentColor"/>
        </svg>
        <svg v-else-if="isListening" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="currentColor">
            <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
            <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="63" stroke-dashoffset="0">
            <animate attributeName="stroke-dashoffset" values="63;0" dur="0.8s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <span v-if="!isListening && !isProcessing">🎤 Voice</span>
      <span v-else-if="isListening" class="pulse">Listening...</span>
      <span v-else>Processing...</span>
    </button>

    <!-- Transcript Display -->
    <transition name="fade">
      <div v-if="transcript" class="transcript-box">
        <div class="transcript-label">You said:</div>
        <div class="transcript-text">"{{ transcript }}"</div>
        <div v-if="commandResult" class="command-result" :class="commandResult.success ? 'success' : 'error'">
          {{ commandResult.message }}
        </div>
      </div>
    </transition>

    <!-- Voice Commands Help -->
    <transition name="fade">
      <div v-if="showHelp" class="voice-help">
        <div class="help-header">
          <span>Voice Commands</span>
          <button @click="showHelp = false" class="close-btn">✕</button>
        </div>
        <div class="help-content">
          <div class="help-section">
            <div class="help-title">Quick Strategy Launch (Just say the name!):</div>
            <ul v-if="strategies.length > 0">
              <li v-for="strategy in strategies" :key="strategy.name">
                "{{ strategy.name }}" - {{ strategy.description }} ({{ strategy.lowerPrice }}-{{ strategy.upperPrice }}, {{ strategy.grids }} grids)
              </li>
            </ul>
            <ul v-else>
              <li style="color: #888;">Loading strategies...</li>
            </ul>
          </div>
          <div class="help-section">
            <div class="help-title">Grid Bot Controls:</div>
            <ul>
              <li>"Start grid bot on LCX/USDC"</li>
              <li>"Stop all bots"</li>
              <li>"Show my bots"</li>
              <li>"Create new bot"</li>
            </ul>
          </div>
          <div class="help-section">
            <div class="help-title">Information:</div>
            <ul>
              <li>"Show profit today"</li>
              <li>"Show total profit"</li>
              <li>"Show balance"</li>
              <li>"What is my portfolio worth"</li>
            </ul>
          </div>
          <div class="help-section">
            <div class="help-title">Navigation:</div>
            <ul>
              <li>"Go to trading"</li>
              <li>"Show orders"</li>
              <li>"Open settings"</li>
            </ul>
          </div>
        </div>
      </div>
    </transition>

    <!-- Help Icon -->
    <button @click="showHelp = !showHelp" class="help-icon" title="Voice Commands Help">
      ?
    </button>

    <!-- Voice Toggle -->
    <button @click="voiceEnabled = !voiceEnabled" class="voice-toggle" :title="voiceEnabled ? 'Mute Voice' : 'Enable Voice'">
      <span v-if="voiceEnabled">🔊</span>
      <span v-else>🔇</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['command', 'transcript'])

const isSupported = ref(false)
const isListening = ref(false)
const isProcessing = ref(false)
const transcript = ref('')
const commandResult = ref(null)
const showHelp = ref(false)
const strategies = ref([])

let recognition = null
let transcriptTimeout = null
let speechSynthesis = null
let voiceEnabled = ref(true)

// Text-to-Speech function
const speak = (text) => {
  if (!voiceEnabled.value) return

  try {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.1 // Slightly faster
    utterance.pitch = 1.0
    utterance.volume = 1.0

    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Speech synthesis error:', error)
  }
}

// Load strategies from API
const loadStrategies = async () => {
  try {
    const response = await $fetch('/api/v1/getVoiceStrategies')
    if (response.success && response.data) {
      strategies.value = response.data
      console.log(`[Voice Commands] Loaded ${strategies.value.length} strategies`)
    }
  } catch (error) {
    console.error('[Voice Commands] Error loading strategies:', error)
  }
}

onMounted(async () => {
  // Load strategies first
  await loadStrategies()
  // Check if browser supports Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (SpeechRecognition) {
    isSupported.value = true

    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isListening.value = true
      transcript.value = ''
      commandResult.value = null
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      transcript.value = speechResult
      isListening.value = false
      isProcessing.value = true

      emit('transcript', speechResult)

      // Process command
      processCommand(speechResult)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false
      isProcessing.value = false

      if (event.error === 'no-speech') {
        commandResult.value = { success: false, message: 'No speech detected. Please try again.' }
      } else if (event.error === 'not-allowed') {
        commandResult.value = { success: false, message: 'Microphone access denied. Please allow microphone access.' }
      } else {
        commandResult.value = { success: false, message: `Error: ${event.error}` }
      }

      clearTranscriptAfterDelay()
    }

    recognition.onend = () => {
      isListening.value = false
      isProcessing.value = false
    }
  } else {
    console.warn('Speech Recognition API not supported in this browser')
  }
})

onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
  if (transcriptTimeout) {
    clearTimeout(transcriptTimeout)
  }
})

const toggleListening = () => {
  if (!recognition) return

  if (isListening.value) {
    recognition.stop()
  } else {
    recognition.start()
  }
}

const clearTranscriptAfterDelay = () => {
  if (transcriptTimeout) {
    clearTimeout(transcriptTimeout)
  }
  transcriptTimeout = setTimeout(() => {
    transcript.value = ''
    commandResult.value = null
  }, 5000)
}

const processCommand = async (command) => {
  const lowerCommand = command.toLowerCase().trim()

  try {
    // Check if command matches any loaded strategy
    let strategyMatched = false

    for (const strategy of strategies.value) {
      // Check main name and all aliases
      const allNames = [strategy.name.toLowerCase(), ...strategy.aliases]

      // First check for exact matches, then check if command contains the name
      const exactMatch = allNames.some(name => lowerCommand === name)
      const partialMatch = allNames.some(name => lowerCommand.includes(name) && name.length > 3)

      if (exactMatch || partialMatch) {
        // Replace "BOT" with "ROBOT" for speech (e.g., TOPBOT -> TOP ROBOT)
        const strategyNameClean = strategy.name.replace(/BOT$/i, 'ROBOT').trim()
        const message = `Gata, am creat ${strategyNameClean}`
        commandResult.value = {
          success: true,
          message: message
        }

        // Speak the confirmation
        speak(message)

        emit('command', {
          action: 'start-strategy',
          strategy: strategy.name,
          symbol: strategy.symbol,
          lowerPrice: strategy.lowerPrice,
          upperPrice: strategy.upperPrice,
          grids: strategy.grids,
          amount: strategy.amount,
          amountType: strategy.amountType,
          ordersSide: strategy.ordersSide
        })
        strategyMatched = true
        break
      }
    }

    // Grid Bot Commands (original format)
    if (!strategyMatched && (lowerCommand.includes('start grid bot') || lowerCommand.includes('create grid bot'))) {
      const symbolMatch = lowerCommand.match(/on\s+([a-z]+\/[a-z]+)/i)
      if (symbolMatch) {
        const symbol = symbolMatch[1].toUpperCase()
        commandResult.value = {
          success: true,
          message: `Starting grid bot on ${symbol}...`
        }
        emit('command', { action: 'start-bot', symbol })
      } else {
        commandResult.value = {
          success: false,
          message: 'Please specify a trading pair (e.g., "on LCX/USDC") or use a strategy name like "TOPBOT"'
        }
      }
    }

    // Stop bots
    else if (lowerCommand.includes('stop all bots')) {
      const msg = 'Opresc toți roboții'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'stop-all-bots' })
    }

    // Show bots
    else if (lowerCommand.includes('show my bots') || lowerCommand.includes('show bots')) {
      const msg = 'Afișez roboții tăi'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'show-bots' })
    }

    // Create new bot
    else if (lowerCommand.includes('create new bot') || lowerCommand.includes('new bot')) {
      const msg = 'Deschid formularul de creare'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'create-bot' })
    }

    // Show profit
    else if (lowerCommand.includes('show profit today') || lowerCommand.includes('profit today')) {
      const msg = 'Calculez profitul de azi'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'show-profit-today' })
    }

    else if (lowerCommand.includes('show total profit') || lowerCommand.includes('total profit')) {
      const msg = 'Calculez profitul total'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'show-total-profit' })
    }

    // Show balance
    else if (lowerCommand.includes('show balance') || lowerCommand.includes('my balance')) {
      const msg = 'Verific balanța ta'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'show-balance' })
    }

    // Portfolio worth
    else if (lowerCommand.includes('portfolio worth') || lowerCommand.includes('portfolio value')) {
      const msg = 'Calculez valoarea portofoliului'
      speak(msg)
      commandResult.value = {
        success: true,
        message: msg
      }
      emit('command', { action: 'show-portfolio' })
    }

    // Navigation
    else if (lowerCommand.includes('go to trading') || lowerCommand.includes('open trading')) {
      commandResult.value = {
        success: true,
        message: 'Opening trading page...'
      }
      router.push('/trade')
    }

    else if (lowerCommand.includes('show orders') || lowerCommand.includes('my orders')) {
      commandResult.value = {
        success: true,
        message: 'Opening orders page...'
      }
      emit('command', { action: 'show-orders' })
    }

    else if (lowerCommand.includes('open settings') || lowerCommand.includes('go to settings')) {
      commandResult.value = {
        success: true,
        message: 'Opening settings...'
      }
      router.push('/profile')
    }

    // Unknown command
    else {
      commandResult.value = {
        success: false,
        message: 'Command not recognized. Say "help" for available commands.'
      }
    }

  } catch (error) {
    console.error('Error processing command:', error)
    commandResult.value = {
      success: false,
      message: 'Error processing command'
    }
  }

  isProcessing.value = false
  clearTranscriptAfterDelay()
}
</script>

<style scoped>
.voice-commands-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.voice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #555;
}

.voice-btn.listening {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: pulse 1.5s ease-in-out infinite;
}

.voice-btn.processing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
  }
  50% {
    box-shadow: 0 4px 30px rgba(245, 87, 108, 0.8);
  }
}

.icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse {
  animation: textPulse 1s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.transcript-box {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 16px;
  max-width: 350px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.transcript-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.transcript-text {
  font-size: 14px;
  color: #fff;
  font-style: italic;
  margin-bottom: 10px;
}

.command-result {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.command-result.success {
  background: rgba(24, 160, 88, 0.2);
  border: 1px solid #18a058;
  color: #18a058;
}

.command-result.error {
  background: rgba(208, 48, 80, 0.2);
  border: 1px solid #d03050;
  color: #d03050;
}

.voice-help {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.help-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 16px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-title {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-content li {
  font-size: 13px;
  color: #ddd;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.help-content li:before {
  content: "▸";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.help-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  color: #667eea;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.help-icon:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

.voice-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(24, 160, 88, 0.2);
  border: 1px solid rgba(24, 160, 88, 0.4);
  color: #18a058;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.voice-toggle:hover {
  background: rgba(24, 160, 88, 0.3);
  transform: scale(1.1);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Scrollbar styling */
.help-content::-webkit-scrollbar {
  width: 6px;
}

.help-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.help-content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

.help-content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}
</style>
