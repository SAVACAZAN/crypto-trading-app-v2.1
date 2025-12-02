// Import WhatsApp Web.js as CommonJS module
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

// Store client instance globally (in production, use Redis or session storage)
let whatsappClient = null;
let qrCode = null;
let isReady = false;
let clientInfo = null;

export default defineEventHandler(async (event) => {
  try {
    // If client already exists and is ready, return status
    if (whatsappClient && isReady) {
      return {
        success: true,
        status: 'ready',
        qrCode: null,
        clientInfo: clientInfo,
        message: 'WhatsApp client is already connected'
      };
    }

    // If client exists but not ready, return current QR code
    if (whatsappClient && qrCode) {
      return {
        success: true,
        status: 'qr_code',
        qrCode: qrCode,
        clientInfo: null,
        message: 'Scan the QR code to authenticate'
      };
    }

    // Initialize new WhatsApp client
    console.log('🚀 [WHATSAPP] Initializing WhatsApp Web.js client...');

    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: 'whatsapp-client-1'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // QR Code generation
    whatsappClient.on('qr', (qr) => {
      console.log('📱 [WHATSAPP] QR Code generated. Scan with your phone.');
      qrCode = qr;
      isReady = false;
    });

    // Client ready
    whatsappClient.on('ready', async () => {
      console.log('✅ [WHATSAPP] Client is ready!');
      isReady = true;
      qrCode = null;

      // Get client info
      try {
        const info = whatsappClient.info;
        clientInfo = {
          pushname: info.pushname,
          wid: info.wid.user,
          platform: info.platform
        };
        console.log('📱 [WHATSAPP] Connected as:', clientInfo.pushname);
      } catch (error) {
        console.error('❌ [WHATSAPP] Error getting client info:', error);
      }
    });

    // Authentication success
    whatsappClient.on('authenticated', () => {
      console.log('🔐 [WHATSAPP] Authentication successful!');
    });

    // Authentication failure
    whatsappClient.on('auth_failure', (msg) => {
      console.error('❌ [WHATSAPP] Authentication failed:', msg);
      qrCode = null;
      isReady = false;
      whatsappClient = null;
    });

    // Disconnected
    whatsappClient.on('disconnected', (reason) => {
      console.log('🔌 [WHATSAPP] Client disconnected:', reason);
      qrCode = null;
      isReady = false;
      clientInfo = null;
      whatsappClient = null;
    });

    // Initialize the client
    await whatsappClient.initialize();

    // Wait a bit for QR code generation
    await new Promise(resolve => setTimeout(resolve, 5000));

    return {
      success: true,
      status: qrCode ? 'qr_code' : 'initializing',
      qrCode: qrCode,
      clientInfo: null,
      message: qrCode ? 'Scan the QR code with WhatsApp on your phone' : 'Initializing WhatsApp client...'
    };

  } catch (error) {
    console.error('❌ [WHATSAPP] Initialization error:', error);
    return {
      success: false,
      status: 'error',
      message: error.message || 'Failed to initialize WhatsApp client',
      error: error.toString()
    };
  }
});

// Export client getter for other endpoints
export function getWhatsAppClient() {
  return { client: whatsappClient, isReady, clientInfo };
}
