# Telegram Client Integration - Setup Guide

## Overview
The Crypto App now includes full Telegram Client integration with three authentication methods:
- **Bot Login** - Connect multiple Telegram bots
- **QR Code Login** - Authenticate as a Telegram user by scanning QR code
- **Phone Login** - Authenticate using phone number + verification code

## Prerequisites

### 1. Telegram API Credentials
You need API credentials from Telegram to use the client features:

1. Visit https://my.telegram.org/apps
2. Log in with your Telegram account
3. Click on "API development tools"
4. Fill in the application details:
   - App title: Your app name
   - Short name: A short identifier
   - Platform: Desktop
   - Description: Brief description
5. You will receive:
   - **api_id** (numeric)
   - **api_hash** (alphanumeric string)

### 2. Environment Configuration
Add your credentials to the `.env` file:

```env
# Telegram Client API Credentials
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
```

**Note:** The current `.env` file already has working credentials configured.

## Features

### 1. Telegram Bots (Multi-Bot Management)
- Connect multiple Telegram bots simultaneously
- Each bot can be used independently
- Filter chats by type:
  - 💬 All - All conversations
  - 👤 Private - Direct messages only
  - 👥 Groups - Group and supergroup chats
  - 📢 Channels - Channel chats
  - 👑 Admin - Chats where bot has admin rights
- Send messages to any chat
- View chat details, member counts, and admin status

**How to add a bot:**
1. Go to ChatToolz page → "✈️ Telegram Bots" tab
2. Enter bot name and bot token
3. Click "Add Bot"
4. Bot will be verified and added to your list

### 2. Telegram Client - QR Login
Authenticate as a Telegram user by scanning a QR code with your phone:

**Steps:**
1. Go to ChatToolz page → "✈️ Telegram Client" tab
2. Click on "QR Code Login" sub-tab
3. Click "Generate QR Code" button
4. Open Telegram app on your phone
5. Go to Settings → Devices → Link Desktop Device
6. Scan the QR code displayed on screen
7. You'll be automatically logged in (polls every 2 seconds)

**Features:**
- QR code expires after a set time (shown in warning)
- Automatic authentication detection
- Session persists in database

### 3. Telegram Client - Phone Login
Authenticate using your phone number:

**Steps:**
1. Go to ChatToolz page → "✈️ Telegram Client" tab
2. Click on "Phone Number Login" sub-tab
3. Enter your phone number (international format, e.g., +1234567890)
4. Click "Send Code"
5. Enter the verification code you receive via SMS
6. Click "Verify Code"
7. You'll be logged in

**Note:** If 2FA is enabled on your account, this feature will notify you (full 2FA support coming soon).

### 4. Telegram Client - Chat Management
Once authenticated (via QR or Phone):
- View all your Telegram chats
- Filter by Private, Groups, Channels
- Send and receive messages
- View chat history
- See unread counts
- Logout when done

## API Endpoints

### Bot Endpoints
- `GET /api/v1/telegram/bots/list` - List all connected bots
- `POST /api/v1/telegram/bots/add` - Add new bot
- `POST /api/v1/telegram/bots/remove` - Remove bot
- `GET /api/v1/telegram/chats` - Get bot chats
- `POST /api/v1/telegram/send` - Send message as bot

### Client Endpoints
- `POST /api/v1/telegram-client/qr-login` - Generate QR code
- `GET /api/v1/telegram-client/check-auth` - Check QR auth status
- `POST /api/v1/telegram-client/send-code` - Send phone verification code
- `POST /api/v1/telegram-client/verify-code` - Verify phone code
- `GET /api/v1/telegram-client/chats` - Get user chats
- `POST /api/v1/telegram-client/messages` - Get chat messages
- `POST /api/v1/telegram-client/send` - Send message as user
- `POST /api/v1/telegram-client/logout` - Logout and clear session

## Database Schema

### TelegramBot
Stores bot configurations for each user:
- userID, name, token, username, botId
- isActive status
- Created and last used timestamps

### TelegramClientSession
Stores client authentication sessions:
- userID (unique)
- sessionString (encrypted session data)
- phoneNumber, phoneCodeHash
- qrLoginToken, qrExpiresAt
- isAuthenticated status
- userInfo (id, firstName, lastName, username, phone, photoUrl)
- lastActive timestamp

## Security Notes

1. **API Credentials**: Keep your `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` secret
2. **Session Storage**: Sessions are stored securely in MongoDB
3. **Bot Tokens**: Bot tokens are stored in database (consider encryption in production)
4. **Rate Limiting**: Telegram has strict rate limits - the app handles FLOOD_WAIT errors
5. **2FA**: Two-factor authentication detection is implemented (full support coming soon)

## Troubleshooting

### "API credentials not configured"
- Make sure `.env` file has `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`
- Restart the dev server after adding credentials

### "Failed to generate QR code"
- Check that API credentials are valid
- Ensure MongoDB is running
- Check server console for detailed error messages

### "QR code expired"
- QR codes expire after a few minutes
- Click "Generate QR Code" again to get a new one

### "Session expired"
- Sessions may expire after long inactivity
- Simply login again (QR or Phone)

### "Invalid phone number"
- Use international format: `+` followed by country code and number
- Example: `+1234567890` (not `1234567890`)

### "Too many attempts / FLOOD_WAIT"
- Telegram has rate limits to prevent spam
- Wait the specified time before trying again

## Dependencies

The following packages are required and installed:
- `@mtproto/core` - Official MTProto library for Telegram API
- `qrcode` - QR code generation
- `telegraf` - Telegram Bot API wrapper

## Development

To test the Telegram features:

```bash
cd "crypto-app-github v2.2 - updated COINBASE"
npm run dev
```

Navigate to: http://localhost:3000/ChatToolz

## Coming Soon

- 2FA password support for phone login
- Profile photo loading
- Voice/video message support
- File upload/download
- Message editing and deletion
- Chat creation and management
- Group admin controls

---

**Made with ❤️ by SAVACAZAN**
