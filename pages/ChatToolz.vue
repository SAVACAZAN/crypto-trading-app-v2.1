<template>
  <div class="chat-toolz-page">
    <n-space vertical :size="20">
      <!-- Header -->
      <n-card style="background: linear-gradient(135deg, #1a1a1a 0%, #1f2d1a 100%); border: 2px solid #25d366;">
        <template #header>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="padding: 12px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border-radius: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 style="margin: 0; font-size: 28px; color: #25d366;">💬 ChatToolz</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #888;">
                WhatsApp & Telegram Integration • Read & Send Messages
              </p>
            </div>
          </div>
        </template>
      </n-card>

      <!-- Tabs -->
      <n-tabs type="line" animated>
        <!-- WhatsApp Tab -->
        <n-tab-pane name="whatsapp" tab="📱 WhatsApp Web">
          <n-space vertical :size="20">

            <!-- Connection Status -->
            <n-card v-if="!whatsapp.isReady" title="🔐 Connect Your WhatsApp" style="border: 1px solid #25d366;">
              <n-space vertical :size="16" align="center">
                <n-alert v-if="!whatsapp.qrCode && !whatsapp.initializing" type="info">
                  Click the button below to generate a QR code and connect your WhatsApp account.
                </n-alert>

                <n-spin v-if="whatsapp.initializing" size="large">
                  <template #description>
                    <div style="margin-top: 12px; color: #25d366;">Initializing WhatsApp client...</div>
                  </template>
                </n-spin>

                <!-- QR Code Display -->
                <div v-if="whatsapp.qrCode" style="text-align: center;">
                  <n-alert type="success" style="margin-bottom: 16px;">
                    <strong>Scan this QR code with your WhatsApp mobile app:</strong>
                    <div style="font-size: 12px; margin-top: 8px;">
                      1. Open WhatsApp on your phone<br>
                      2. Tap Menu (⋮) or Settings<br>
                      3. Tap "Linked Devices"<br>
                      4. Tap "Link a Device"<br>
                      5. Scan this QR code
                    </div>
                  </n-alert>
                  <div style="padding: 20px; background: white; display: inline-block; border-radius: 8px;">
                    <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsapp.qrCode)}`"
                         alt="WhatsApp QR Code"
                         style="width: 300px; height: 300px;" />
                  </div>
                  <n-button @click="checkWhatsAppStatus" type="primary" style="margin-top: 16px;">
                    🔄 Check Connection Status
                  </n-button>
                </div>

                <n-button v-if="!whatsapp.qrCode && !whatsapp.initializing"
                          @click="initializeWhatsApp"
                          type="primary"
                          size="large"
                          :loading="whatsapp.connecting">
                  🚀 Initialize WhatsApp Connection
                </n-button>
              </n-space>
            </n-card>

            <!-- Connected - Show Account Info -->
            <n-card v-if="whatsapp.isReady" style="border: 1px solid #25d366;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 24px;">✅</span>
                    </div>
                    <div>
                      <div style="font-size: 18px; font-weight: 700; color: #25d366;">Connected</div>
                      <div style="font-size: 14px; color: #888;">{{ whatsapp.clientInfo?.pushname || 'WhatsApp User' }}</div>
                    </div>
                  </div>
                  <n-button @click="loadWhatsAppChats" size="small" :loading="whatsapp.loadingChats">
                    🔄 Refresh Chats
                  </n-button>
                </div>
              </template>
            </n-card>

            <!-- Chats List -->
            <n-card v-if="whatsapp.isReady" title="💬 Your Conversations" style="border: 1px solid #25d366;">
              <n-spin :show="whatsapp.loadingChats">
                <n-list bordered v-if="whatsapp.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                  <n-list-item
                    v-for="chat in whatsapp.chats"
                    :key="chat.id"
                    @click="selectWhatsAppChat(chat)"
                    style="cursor: pointer;"
                    :class="{ 'selected-contact': whatsapp.selectedChat?.id === chat.id }"
                  >
                    <n-space align="center" :size="12">
                      <div style="width: 48px; height: 48px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                        {{ chat.name.charAt(0).toUpperCase() }}
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div style="font-weight: 600; color: #25d366;">
                            {{ chat.name }}
                            <n-tag v-if="chat.isGroup" size="tiny" type="info" style="margin-left: 8px;">Group</n-tag>
                          </div>
                          <div v-if="chat.unreadCount > 0" style="background: #25d366; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                            {{ chat.unreadCount }}
                          </div>
                        </div>
                        <div style="font-size: 12px; color: #888; margin-top: 4px;">
                          {{ chat.lastMessage?.body?.substring(0, 50) }}{{ chat.lastMessage?.body?.length > 50 ? '...' : '' }}
                        </div>
                      </div>
                    </n-space>
                  </n-list-item>
                </n-list>
                <n-empty v-else description="No chats available" style="padding: 40px;">
                  <template #icon>
                    <div style="font-size: 48px;">💬</div>
                  </template>
                </n-empty>
              </n-spin>
            </n-card>

            <!-- Chat Messages -->
            <n-card v-if="whatsapp.selectedChat" style="border: 1px solid #25d366;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ whatsapp.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #25d366;">
                      {{ whatsapp.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadWhatsAppMessages" :loading="whatsapp.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="whatsapp.loadingMessages">
                <div class="chat-container" ref="whatsappChatContainer">
                  <div v-for="msg in whatsapp.messages" :key="msg.id" :class="['message', msg.fromMe ? 'sent' : 'received']">
                    <div class="message-content">
                      <div class="message-text">{{ msg.body }}</div>
                      <div class="message-time">{{ formatTime(msg.timestamp * 1000) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="whatsapp.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendWhatsAppMessage"
                    style="flex: 1;"
                  />
                  <n-button type="primary" @click="sendWhatsAppMessage" :loading="whatsapp.sending" :disabled="!whatsapp.newMessage.trim()">
                    📤 Send
                  </n-button>
                </n-space>
              </n-spin>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Telegram Bots Tab -->
        <n-tab-pane name="telegram" tab="🤖 Telegram Bots">
          <n-space vertical :size="20">

            <!-- Multi-Bot Management -->
            <n-card title="🤖 Telegram Bot Manager" style="border: 1px solid #0088cc;">
              <n-space vertical :size="16">
                <n-alert type="info">
                  <strong>Manage Multiple Telegram Bots:</strong>
                  <div style="font-size: 13px; margin-top: 8px;">
                    Add multiple bots by getting tokens from <strong>@BotFather</strong>. Each bot can manage different chats independently.
                  </div>
                </n-alert>

                <!-- Add New Bot Form -->
                <n-card title="➕ Add New Bot" size="small" style="border: 1px solid rgba(0, 136, 204, 0.3);">
                  <n-space vertical :size="12">
                    <n-input
                      v-model:value="telegram.newBotName"
                      placeholder="Bot Name (e.g., Support Bot)"
                      size="large"
                    >
                      <template #prefix>
                        <span style="font-size: 16px;">📝</span>
                      </template>
                    </n-input>

                    <n-input
                      v-model:value="telegram.newBotToken"
                      placeholder="Bot Token from @BotFather"
                      type="password"
                      show-password-on="click"
                      size="large"
                    >
                      <template #prefix>
                        <span style="font-size: 16px;">🔑</span>
                      </template>
                    </n-input>

                    <n-button
                      @click="addTelegramBot"
                      type="primary"
                      size="large"
                      :loading="telegram.connecting"
                      :disabled="!telegram.newBotToken.trim() || !telegram.newBotName.trim()"
                      block
                    >
                      <template #icon>
                        <span style="font-size: 18px;">➕</span>
                      </template>
                      Add Bot
                    </n-button>
                  </n-space>
                </n-card>

                <!-- Connected Bots List -->
                <n-card title="📋 Your Connected Bots" size="small" style="border: 1px solid rgba(0, 136, 204, 0.3);">
                  <n-list bordered v-if="telegram.bots.length > 0">
                    <n-list-item
                      v-for="(bot, index) in telegram.bots"
                      :key="bot.id"
                      style="cursor: pointer;"
                      :class="{ 'selected-bot': telegram.selectedBot?.id === bot.id }"
                      @click="selectBot(bot)"
                    >
                      <n-space align="center" justify="space-between" style="width: 100%;">
                        <n-space align="center" :size="12">
                          <div style="width: 48px; height: 48px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">🤖</span>
                          </div>
                          <div>
                            <div style="font-weight: 700; color: #0088cc; font-size: 16px;">
                              {{ bot.name }}
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 2px;">
                              @{{ bot.username || 'Loading...' }}
                            </div>
                          </div>
                        </n-space>
                        <n-space :size="8">
                          <n-tag :type="bot.isActive ? 'success' : 'warning'" size="small">
                            {{ bot.isActive ? '✅ Active' : '⚠️ Inactive' }}
                          </n-tag>
                          <n-button
                            size="small"
                            type="error"
                            @click.stop="removeBot(bot.id)"
                            ghost
                          >
                            🗑️
                          </n-button>
                        </n-space>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No bots connected" style="padding: 40px;">
                    <template #icon>
                      <div style="font-size: 48px;">🤖</div>
                    </template>
                    <template #extra>
                      <div style="font-size: 13px; color: #888; margin-top: 8px;">
                        Add your first bot using the form above
                      </div>
                    </template>
                  </n-empty>
                </n-card>
              </n-space>
            </n-card>

            <!-- Selected Bot Chats with Tabs -->
            <n-card v-if="telegram.selectedBot" style="border: 1px solid #0088cc;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 24px;">💬</span>
                    </div>
                    <div>
                      <div style="font-size: 18px; font-weight: 700; color: #0088cc;">
                        {{ telegram.selectedBot.name }} - Conversations
                      </div>
                      <div style="font-size: 14px; color: #888;">@{{ telegram.selectedBot.username }}</div>
                    </div>
                  </div>
                  <n-button @click="loadTelegramChats" size="small" :loading="telegram.loadingChats">
                    🔄 Refresh All
                  </n-button>
                </div>
              </template>

              <!-- Tabs for different chat types -->
              <n-tabs type="segment" animated>
                <!-- All Chats -->
                <n-tab-pane name="all" :tab="`💬 All (${telegram.chats.length})`">
                  <n-spin :show="telegram.loadingChats">
                    <n-list bordered v-if="telegram.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                      <n-list-item
                        v-for="chat in telegram.chats"
                        :key="chat.id"
                        @click="selectTelegramChat(chat)"
                        style="cursor: pointer;"
                        :class="{ 'selected-contact': telegram.selectedChat?.id === chat.id }"
                      >
                        <n-space align="center" :size="12">
                          <div :style="getChatAvatarStyle(chat)">
                            {{ getChatIcon(chat) }}
                          </div>
                          <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <div style="font-weight: 600; color: #0088cc;">
                                {{ chat.name }}
                                <n-tag v-if="chat.type !== 'private'" size="tiny" :type="getChatTypeColor(chat.type)" style="margin-left: 8px;">
                                  {{ getChatTypeLabel(chat.type) }}
                                </n-tag>
                                <n-tag v-if="chat.isAdmin" size="tiny" type="success" style="margin-left: 4px;">
                                  👑 Admin
                                </n-tag>
                              </div>
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">
                              {{ chat.description || (chat.participants_count ? `${chat.participants_count} members` : 'Direct chat') }}
                            </div>
                          </div>
                        </n-space>
                      </n-list-item>
                    </n-list>
                    <n-empty v-else description="No chats available" style="padding: 40px;">
                      <template #icon>
                        <div style="font-size: 48px;">💬</div>
                      </template>
                      <template #extra>
                        <div style="font-size: 13px; color: #888; margin-top: 8px;">
                          Send a message to your bot to see conversations here
                        </div>
                      </template>
                    </n-empty>
                  </n-spin>
                </n-tab-pane>

                <!-- Private Chats -->
                <n-tab-pane name="private" :tab="`👤 Private (${getPrivateChats.length})`">
                  <n-spin :show="telegram.loadingChats">
                    <n-list bordered v-if="getPrivateChats.length > 0" style="max-height: 400px; overflow-y: auto;">
                      <n-list-item
                        v-for="chat in getPrivateChats"
                        :key="chat.id"
                        @click="selectTelegramChat(chat)"
                        style="cursor: pointer;"
                        :class="{ 'selected-contact': telegram.selectedChat?.id === chat.id }"
                      >
                        <n-space align="center" :size="12">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                            {{ chat.name.charAt(0).toUpperCase() }}
                          </div>
                          <div style="flex: 1;">
                            <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">Private conversation</div>
                          </div>
                        </n-space>
                      </n-list-item>
                    </n-list>
                    <n-empty v-else description="No private chats" style="padding: 40px;">
                      <template #icon>
                        <div style="font-size: 48px;">👤</div>
                      </template>
                    </n-empty>
                  </n-spin>
                </n-tab-pane>

                <!-- Groups -->
                <n-tab-pane name="groups" :tab="`👥 Groups (${getGroupChats.length})`">
                  <n-spin :show="telegram.loadingChats">
                    <n-list bordered v-if="getGroupChats.length > 0" style="max-height: 400px; overflow-y: auto;">
                      <n-list-item
                        v-for="chat in getGroupChats"
                        :key="chat.id"
                        @click="selectTelegramChat(chat)"
                        style="cursor: pointer;"
                        :class="{ 'selected-contact': telegram.selectedChat?.id === chat.id }"
                      >
                        <n-space align="center" :size="12">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                            👥
                          </div>
                          <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <div style="font-weight: 600; color: #0088cc;">
                                {{ chat.name }}
                                <n-tag v-if="chat.isAdmin" size="tiny" type="success" style="margin-left: 8px;">
                                  👑 Admin
                                </n-tag>
                              </div>
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">
                              {{ chat.participants_count ? `${chat.participants_count} members` : 'Group chat' }}
                            </div>
                          </div>
                        </n-space>
                      </n-list-item>
                    </n-list>
                    <n-empty v-else description="No groups" style="padding: 40px;">
                      <template #icon>
                        <div style="font-size: 48px;">👥</div>
                      </template>
                    </n-empty>
                  </n-spin>
                </n-tab-pane>

                <!-- Channels -->
                <n-tab-pane name="channels" :tab="`📢 Channels (${getChannelChats.length})`">
                  <n-spin :show="telegram.loadingChats">
                    <n-list bordered v-if="getChannelChats.length > 0" style="max-height: 400px; overflow-y: auto;">
                      <n-list-item
                        v-for="chat in getChannelChats"
                        :key="chat.id"
                        @click="selectTelegramChat(chat)"
                        style="cursor: pointer;"
                        :class="{ 'selected-contact': telegram.selectedChat?.id === chat.id }"
                      >
                        <n-space align="center" :size="12">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                            📢
                          </div>
                          <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <div style="font-weight: 600; color: #0088cc;">
                                {{ chat.name }}
                                <n-tag v-if="chat.isAdmin" size="tiny" type="success" style="margin-left: 8px;">
                                  👑 Admin
                                </n-tag>
                              </div>
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">
                              {{ chat.participants_count ? `${chat.participants_count} subscribers` : 'Channel' }}
                            </div>
                          </div>
                        </n-space>
                      </n-list-item>
                    </n-list>
                    <n-empty v-else description="No channels" style="padding: 40px;">
                      <template #icon>
                        <div style="font-size: 48px;">📢</div>
                      </template>
                    </n-empty>
                  </n-spin>
                </n-tab-pane>

                <!-- Admin Only -->
                <n-tab-pane name="admin" :tab="`👑 Admin (${getAdminChats.length})`">
                  <n-spin :show="telegram.loadingChats">
                    <n-list bordered v-if="getAdminChats.length > 0" style="max-height: 400px; overflow-y: auto;">
                      <n-list-item
                        v-for="chat in getAdminChats"
                        :key="chat.id"
                        @click="selectTelegramChat(chat)"
                        style="cursor: pointer;"
                        :class="{ 'selected-contact': telegram.selectedChat?.id === chat.id }"
                      >
                        <n-space align="center" :size="12">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ffd89b, #19547b); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                            👑
                          </div>
                          <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <div style="font-weight: 600; color: #0088cc;">
                                {{ chat.name }}
                                <n-tag size="tiny" :type="getChatTypeColor(chat.type)" style="margin-left: 8px;">
                                  {{ getChatTypeLabel(chat.type) }}
                                </n-tag>
                              </div>
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">
                              {{ chat.participants_count ? `${chat.participants_count} ${chat.type === 'channel' ? 'subscribers' : 'members'}` : 'Admin privileges' }}
                            </div>
                          </div>
                        </n-space>
                      </n-list-item>
                    </n-list>
                    <n-empty v-else description="Bot is not admin anywhere" style="padding: 40px;">
                      <template #icon>
                        <div style="font-size: 48px;">👑</div>
                      </template>
                      <template #extra>
                        <div style="font-size: 13px; color: #888; margin-top: 8px;">
                          Make your bot an admin in groups or channels to see them here
                        </div>
                      </template>
                    </n-empty>
                  </n-spin>
                </n-tab-pane>
              </n-tabs>
            </n-card>

            <!-- Telegram Chat -->
            <n-card v-if="telegram.selectedChat" style="border: 1px solid #0088cc;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ telegram.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0088cc;">
                      {{ telegram.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadTelegramMessages" :loading="telegram.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="telegram.loadingMessages">
                <div class="chat-container" ref="telegramChatContainer">
                  <div v-for="msg in telegram.messages" :key="msg.id" :class="['message', msg.fromMe ? 'sent' : 'received']">
                    <div class="message-content">
                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ formatTime(msg.timestamp * 1000) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="telegram.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendTelegramMessage"
                    style="flex: 1;"
                  />
                  <n-button type="primary" @click="sendTelegramMessage" :loading="telegram.sending" :disabled="!telegram.newMessage.trim()">
                    📤 Send
                  </n-button>
                </n-space>
              </n-spin>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Telegram Client Tab (QR + Phone Login) -->
        <n-tab-pane name="telegram-client" tab="✈️ Telegram Client">
          <n-space vertical :size="20">

            <!-- Login Method Selection -->
            <n-card v-if="!telegramClient.isAuthenticated" title="🔐 Connect as Telegram User" style="border: 1px solid #0088cc;">
              <n-space vertical :size="16">
                <n-alert type="info">
                  <strong>Login as Telegram User (Not Bot):</strong>
                  <div style="font-size: 13px; margin-top: 8px;">
                    Connect your personal Telegram account to read and send messages as yourself. Choose your preferred login method below.
                  </div>
                </n-alert>

                <!-- Login Method Tabs -->
                <n-tabs type="segment" animated>
                  <!-- QR Code Login -->
                  <n-tab-pane name="qr" tab="📱 QR Code">
                    <n-space vertical :size="16" align="center" style="padding: 20px;">
                      <n-alert type="success" style="margin-bottom: 16px;">
                        <strong>Login with QR Code (Fastest Method):</strong>
                        <div style="font-size: 12px; margin-top: 8px;">
                          1. Click "Generate QR Code" below<br>
                          2. Open Telegram on your phone<br>
                          3. Go to Settings → Devices → Link Desktop Device<br>
                          4. Scan the QR code that appears below<br>
                          5. Confirm on your phone
                        </div>
                      </n-alert>

                      <!-- QR Code Display -->
                      <div v-if="telegramClient.qrCode" style="text-align: center;">
                        <div style="padding: 20px; background: white; display: inline-block; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                          <img :src="telegramClient.qrCode" alt="Telegram QR Code" style="width: 300px; height: 300px;" />
                        </div>
                        <n-alert type="warning" style="margin-top: 16px; max-width: 400px;">
                          <strong>⏱️ QR Code expires in 60 seconds</strong><br>
                          Scan it quickly with your Telegram app!
                        </n-alert>
                      </div>

                      <n-spin v-if="telegramClient.generatingQR" size="large">
                        <template #description>
                          <div style="margin-top: 12px; color: #0088cc;">Generating QR code...</div>
                        </template>
                      </n-spin>

                      <n-button
                        v-if="!telegramClient.qrCode && !telegramClient.generatingQR"
                        @click="generateQRCode"
                        type="primary"
                        size="large"
                        :loading="telegramClient.connecting"
                      >
                        <template #icon>
                          <span style="font-size: 20px;">📱</span>
                        </template>
                        Generate QR Code
                      </n-button>

                      <n-button
                        v-if="telegramClient.qrCode"
                        @click="generateQRCode"
                        size="medium"
                        ghost
                      >
                        🔄 Refresh QR Code
                      </n-button>
                    </n-space>
                  </n-tab-pane>

                  <!-- Phone Number Login -->
                  <n-tab-pane name="phone" tab="📞 Phone Number">
                    <n-space vertical :size="16" style="padding: 20px;">
                      <n-alert type="info">
                        <strong>Login with Phone Number:</strong>
                        <div style="font-size: 12px; margin-top: 8px;">
                          Enter your phone number and we'll send you a verification code via Telegram.
                        </div>
                      </n-alert>

                      <!-- Step 1: Enter Phone Number -->
                      <div v-if="!telegramClient.phoneCodeSent">
                        <n-input
                          v-model:value="telegramClient.phoneNumber"
                          placeholder="+40712345678 (with country code)"
                          size="large"
                          :disabled="telegramClient.connecting"
                        >
                          <template #prefix>
                            <span style="font-size: 18px;">📞</span>
                          </template>
                        </n-input>

                        <n-button
                          @click="sendPhoneCode"
                          type="primary"
                          size="large"
                          :loading="telegramClient.connecting"
                          :disabled="!telegramClient.phoneNumber.trim()"
                          block
                          style="margin-top: 12px;"
                        >
                          <template #icon>
                            <span style="font-size: 18px;">📤</span>
                          </template>
                          Send Verification Code
                        </n-button>
                      </div>

                      <!-- Step 2: Enter Verification Code -->
                      <div v-if="telegramClient.phoneCodeSent">
                        <n-alert type="success" style="margin-bottom: 16px;">
                          <strong>✅ Code sent to {{ telegramClient.phoneNumber }}</strong><br>
                          <div style="font-size: 12px; margin-top: 4px;">
                            Check your Telegram app for the verification code.
                          </div>
                        </n-alert>

                        <n-input
                          v-model:value="telegramClient.verificationCode"
                          placeholder="Enter 5-digit code"
                          size="large"
                          :disabled="telegramClient.connecting"
                          maxlength="5"
                        >
                          <template #prefix>
                            <span style="font-size: 18px;">🔢</span>
                          </template>
                        </n-input>

                        <n-button
                          @click="verifyPhoneCode"
                          type="primary"
                          size="large"
                          :loading="telegramClient.connecting"
                          :disabled="!telegramClient.verificationCode.trim()"
                          block
                          style="margin-top: 12px;"
                        >
                          <template #icon>
                            <span style="font-size: 18px;">✅</span>
                          </template>
                          Verify & Login
                        </n-button>

                        <n-button
                          @click="cancelPhoneLogin"
                          size="medium"
                          ghost
                          block
                          style="margin-top: 8px;"
                        >
                          ← Back to Phone Number
                        </n-button>
                      </div>
                    </n-space>
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>

            <!-- Connected User Info -->
            <n-card v-if="telegramClient.isAuthenticated" style="border: 1px solid #0088cc;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0088cc, #0066aa); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 28px;">👤</span>
                    </div>
                    <div>
                      <div style="font-size: 20px; font-weight: 700; color: #0088cc;">
                        {{ telegramClient.userInfo?.first_name }} {{ telegramClient.userInfo?.last_name }}
                      </div>
                      <div style="font-size: 14px; color: #888;">
                        @{{ telegramClient.userInfo?.username || 'No username' }} • ID: {{ telegramClient.userInfo?.id }}
                      </div>
                      <n-tag type="success" size="small" style="margin-top: 4px;">
                        ✅ Connected as User
                      </n-tag>
                    </div>
                  </div>
                  <n-space>
                    <n-button @click="loadClientChats" size="small" :loading="telegramClient.loadingChats">
                      🔄 Refresh Chats
                    </n-button>
                    <n-button @click="logoutClient" size="small" type="error" ghost>
                      🚪 Logout
                    </n-button>
                  </n-space>
                </div>
              </template>
            </n-card>

            <!-- Client Chats List -->
            <n-card v-if="telegramClient.isAuthenticated" title="💬 Your Conversations" style="border: 1px solid #0088cc;">
              <n-spin :show="telegramClient.loadingChats">
                <n-list bordered v-if="telegramClient.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                  <n-list-item
                    v-for="chat in telegramClient.chats"
                    :key="chat.id"
                    @click="selectClientChat(chat)"
                    style="cursor: pointer;"
                    :class="{ 'selected-contact': telegramClient.selectedChat?.id === chat.id }"
                  >
                    <n-space align="center" :size="12">
                      <div style="width: 48px; height: 48px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                        {{ chat.name.charAt(0).toUpperCase() }}
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div style="font-weight: 600; color: #0088cc;">
                            {{ chat.name }}
                            <n-tag v-if="chat.type === 'group' || chat.type === 'supergroup'" size="tiny" type="info" style="margin-left: 8px;">
                              {{ chat.type }}
                            </n-tag>
                          </div>
                          <div v-if="chat.unreadCount > 0" style="background: #0088cc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                            {{ chat.unreadCount }}
                          </div>
                        </div>
                        <div style="font-size: 12px; color: #888; margin-top: 4px;">
                          {{ chat.lastMessage?.text?.substring(0, 60) }}{{ chat.lastMessage?.text?.length > 60 ? '...' : '' }}
                        </div>
                      </div>
                    </n-space>
                  </n-list-item>
                </n-list>
                <n-empty v-else description="No chats available" style="padding: 40px;">
                  <template #icon>
                    <div style="font-size: 48px;">💬</div>
                  </template>
                  <template #extra>
                    <div style="font-size: 13px; color: #888; margin-top: 8px;">
                      Start a conversation on Telegram to see it here
                    </div>
                  </template>
                </n-empty>
              </n-spin>
            </n-card>

            <!-- Client Chat Messages -->
            <n-card v-if="telegramClient.selectedChat" style="border: 1px solid #0088cc;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ telegramClient.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0088cc;">
                      {{ telegramClient.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadClientMessages" :loading="telegramClient.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="telegramClient.loadingMessages">
                <div class="chat-container" ref="clientChatContainer">
                  <div v-for="msg in telegramClient.messages" :key="msg.id" :class="['message', msg.isOutgoing ? 'sent' : 'received']">
                    <!-- Sender Avatar (for received messages) -->
                    <div v-if="!msg.isOutgoing && msg.sender" class="message-avatar">
                      <div class="avatar-circle">
                        {{ (msg.sender.firstName || msg.sender.username || '?').charAt(0).toUpperCase() }}
                      </div>
                    </div>

                    <div class="message-content">
                      <!-- Sender Name (for received messages in groups) -->
                      <div v-if="!msg.isOutgoing && msg.sender && (telegramClient.selectedChat.type === 'group' || telegramClient.selectedChat.type === 'supergroup')" class="sender-name">
                        {{ msg.sender.firstName }} {{ msg.sender.lastName }}
                        <span v-if="msg.sender.username" class="sender-username">@{{ msg.sender.username }}</span>
                      </div>

                      <!-- Your Name (for sent messages) -->
                      <div v-if="msg.isOutgoing" class="sender-name sender-name-you">
                        You ({{ telegramClient.userInfo?.first_name }} {{ telegramClient.userInfo?.last_name }})
                      </div>

                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ formatTime(msg.date * 1000) }}</div>
                    </div>

                    <!-- Your Avatar (for sent messages) -->
                    <div v-if="msg.isOutgoing" class="message-avatar">
                      <div class="avatar-circle avatar-you">
                        {{ (telegramClient.userInfo?.first_name || 'Y').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="telegramClient.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendClientMessage"
                    style="flex: 1;"
                  />
                  <n-button type="primary" @click="sendClientMessage" :loading="telegramClient.sending" :disabled="!telegramClient.newMessage.trim()">
                    📤 Send
                  </n-button>
                </n-space>
              </n-spin>
            </n-card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

const notification = useNotification();
const userID = useCookie('userID');

// WhatsApp state
const whatsapp = ref({
  qrCode: null,
  isReady: false,
  initializing: false,
  connecting: false,
  clientInfo: null,
  chats: [],
  selectedChat: null,
  loadingChats: false,
  messages: [],
  loadingMessages: false,
  newMessage: '',
  sending: false
});

// Telegram state with multi-bot support
const telegram = ref({
  bots: [], // Array of connected bots
  selectedBot: null, // Currently selected bot
  newBotName: '',
  newBotToken: '',
  connecting: false,
  chats: [],
  selectedChat: null,
  loadingChats: false,
  messages: [],
  loadingMessages: false,
  newMessage: '',
  sending: false
});

// Telegram Client state (User authentication with MTProto)
const telegramClient = ref({
  isAuthenticated: false,
  userInfo: null,
  sessionString: null,

  // QR Code login
  qrCode: null,
  generatingQR: false,

  // Phone login
  phoneNumber: '',
  phoneCodeSent: false,
  verificationCode: '',
  phoneCodeHash: '',

  connecting: false,
  chats: [],
  selectedChat: null,
  loadingChats: false,
  messages: [],
  loadingMessages: false,
  newMessage: '',
  sending: false
});

// WhatsApp functions
async function initializeWhatsApp() {
  whatsapp.value.initializing = true;
  whatsapp.value.connecting = true;

  try {
    console.log('🚀 Initializing WhatsApp client...');

    const response = await $fetch('/api/v1/whatsapp/init', {
      method: 'POST'
    });

    console.log('✅ Init response:', response);

    if (response.success) {
      if (response.status === 'qr_code' && response.qrCode) {
        whatsapp.value.qrCode = response.qrCode;
        whatsapp.value.isReady = false;

        notification.success({
          content: 'QR Code Generated',
          meta: 'Scan the QR code with your WhatsApp mobile app',
          duration: 5000
        });

        // Auto-check status every 3 seconds
        const statusInterval = setInterval(async () => {
          await checkWhatsAppStatus();
          if (whatsapp.value.isReady) {
            clearInterval(statusInterval);
          }
        }, 3000);

      } else if (response.status === 'ready') {
        whatsapp.value.isReady = true;
        whatsapp.value.qrCode = null;
        whatsapp.value.clientInfo = response.clientInfo;

        notification.success({
          content: 'WhatsApp Connected',
          meta: `Connected as ${response.clientInfo?.pushname || 'WhatsApp User'}`,
          duration: 3000
        });

        await loadWhatsAppChats();
      }
    } else {
      throw new Error(response.message || 'Failed to initialize WhatsApp');
    }

  } catch (error) {
    console.error('❌ WhatsApp init error:', error);
    notification.error({
      content: 'Initialization Failed',
      meta: error.message || 'Failed to initialize WhatsApp client',
      duration: 5000
    });
  } finally {
    whatsapp.value.initializing = false;
    whatsapp.value.connecting = false;
  }
}

async function checkWhatsAppStatus() {
  try {
    const response = await $fetch('/api/v1/whatsapp/status');

    if (response.success && response.isReady) {
      whatsapp.value.isReady = true;
      whatsapp.value.qrCode = null;
      whatsapp.value.clientInfo = response.clientInfo;

      notification.success({
        content: 'WhatsApp Connected!',
        meta: `Connected as ${response.clientInfo?.pushname || 'WhatsApp User'}`,
        duration: 3000
      });

      await loadWhatsAppChats();
    }
  } catch (error) {
    console.error('❌ Status check error:', error);
  }
}

async function loadWhatsAppChats() {
  whatsapp.value.loadingChats = true;

  try {
    console.log('📱 Loading WhatsApp chats...');

    const response = await $fetch('/api/v1/whatsapp/chats');

    if (response.success) {
      whatsapp.value.chats = response.chats;

      console.log(`✅ Loaded ${response.chats.length} chats`);

      notification.success({
        content: 'Chats Loaded',
        meta: `Loaded ${response.chats.length} conversations`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || 'Failed to load chats');
    }

  } catch (error) {
    console.error('❌ Load chats error:', error);
    notification.error({
      content: 'Failed to Load Chats',
      meta: error.message || 'Could not fetch your conversations',
      duration: 3000
    });
  } finally {
    whatsapp.value.loadingChats = false;
  }
}

function selectWhatsAppChat(chat) {
  whatsapp.value.selectedChat = chat;
  whatsapp.value.messages = [];
  loadWhatsAppMessages();
}

async function loadWhatsAppMessages() {
  if (!whatsapp.value.selectedChat) return;

  whatsapp.value.loadingMessages = true;

  try {
    console.log(`📱 Loading messages for ${whatsapp.value.selectedChat.name}...`);

    const response = await $fetch('/api/v1/whatsapp/messages', {
      method: 'POST',
      body: {
        chatId: whatsapp.value.selectedChat.id,
        limit: 50
      }
    });

    if (response.success) {
      whatsapp.value.messages = response.messages.reverse(); // Reverse to show oldest first

      console.log(`✅ Loaded ${response.messages.length} messages`);
    } else {
      throw new Error(response.message || 'Failed to load messages');
    }

  } catch (error) {
    console.error('❌ Load messages error:', error);
    notification.error({
      content: 'Failed to Load Messages',
      meta: error.message || 'Could not fetch messages',
      duration: 3000
    });
  } finally {
    whatsapp.value.loadingMessages = false;
  }
}

async function sendWhatsAppMessage() {
  if (!whatsapp.value.newMessage.trim() || !whatsapp.value.selectedChat) return;

  whatsapp.value.sending = true;

  try {
    console.log(`📤 Sending message to ${whatsapp.value.selectedChat.name}...`);

    const response = await $fetch('/api/v1/whatsapp/send', {
      method: 'POST',
      body: {
        chatId: whatsapp.value.selectedChat.id,
        message: whatsapp.value.newMessage
      }
    });

    if (response.success) {
      // Add message to UI immediately
      whatsapp.value.messages.push({
        id: response.messageId,
        body: whatsapp.value.newMessage,
        timestamp: Date.now() / 1000,
        fromMe: true
      });

      whatsapp.value.newMessage = '';

      console.log('✅ Message sent successfully');

      notification.success({
        content: 'Message Sent',
        meta: 'Your message was delivered',
        duration: 2000
      });
    } else {
      throw new Error(response.message || 'Failed to send message');
    }

  } catch (error) {
    console.error('❌ Send message error:', error);
    notification.error({
      content: 'Failed to Send Message',
      meta: error.message || 'Could not send your message',
      duration: 3000
    });
  } finally {
    whatsapp.value.sending = false;
  }
}

// Load saved bots and Telegram config on mount
onMounted(async () => {
  await loadSavedBots();
  await loadSavedTelegramConfig();
});

// Load saved bots from backend
async function loadSavedBots() {
  try {
    const response = await $fetch('/api/v1/telegram/bots/list', {
      query: { userID: userID.value }
    });

    if (response.success && response.bots) {
      telegram.value.bots = response.bots;

      // Auto-select first bot if available
      if (telegram.value.bots.length > 0 && !telegram.value.selectedBot) {
        selectBot(telegram.value.bots[0]);
      }
    }
  } catch (error) {
    console.error('❌ Error loading saved bots:', error);
  }
}

// Add new Telegram bot
async function addTelegramBot() {
  if (!telegram.value.newBotToken.trim() || !telegram.value.newBotName.trim()) {
    notification.warning({
      content: 'Missing Information',
      meta: 'Please enter both bot name and token',
      duration: 3000
    });
    return;
  }

  telegram.value.connecting = true;

  try {
    console.log('🚀 Adding new Telegram bot...');

    const response = await $fetch('/api/v1/telegram/bots/add', {
      method: 'POST',
      body: {
        userID: userID.value,
        botName: telegram.value.newBotName,
        botToken: telegram.value.newBotToken
      }
    });

    if (response.success) {
      // Add bot to list
      telegram.value.bots.push({
        id: response.bot.id,
        name: telegram.value.newBotName,
        username: response.bot.username,
        token: telegram.value.newBotToken,
        isActive: true
      });

      // Clear form
      telegram.value.newBotName = '';
      telegram.value.newBotToken = '';

      // Auto-select the new bot
      selectBot(telegram.value.bots[telegram.value.bots.length - 1]);

      notification.success({
        content: 'Bot Added Successfully! 🎉',
        meta: `@${response.bot.username} is now connected`,
        duration: 3000
      });
    } else {
      throw new Error(response.message || 'Failed to add bot');
    }

  } catch (error) {
    console.error('❌ Error adding bot:', error);
    notification.error({
      content: 'Failed to Add Bot',
      meta: error.message || 'Invalid bot token. Check @BotFather',
      duration: 5000
    });
  } finally {
    telegram.value.connecting = false;
  }
}

// Select a bot
function selectBot(bot) {
  telegram.value.selectedBot = bot;
  telegram.value.chats = [];
  telegram.value.selectedChat = null;
  telegram.value.messages = [];

  // Load chats for this bot
  loadTelegramChats();
}

// Remove a bot
async function removeBot(botId) {
  try {
    const response = await $fetch('/api/v1/telegram/bots/remove', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: botId
      }
    });

    if (response.success) {
      // Remove from list
      telegram.value.bots = telegram.value.bots.filter(b => b.id !== botId);

      // Clear selection if this was the selected bot
      if (telegram.value.selectedBot?.id === botId) {
        telegram.value.selectedBot = null;
        telegram.value.chats = [];
        telegram.value.selectedChat = null;
      }

      notification.success({
        content: 'Bot Removed',
        meta: 'Bot has been disconnected',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('❌ Error removing bot:', error);
    notification.error({
      content: 'Failed to Remove Bot',
      meta: error.message,
      duration: 3000
    });
  }
}

async function loadTelegramChats() {
  if (!telegram.value.selectedBot) return;

  telegram.value.loadingChats = true;

  try {
    console.log('📱 Loading Telegram chats...');

    const response = await $fetch('/api/v1/telegram/chats', {
      query: {
        botId: telegram.value.selectedBot.id
      }
    });

    if (response.success) {
      telegram.value.chats = response.chats;

      console.log(`✅ Loaded ${response.chats.length} chats`);

      notification.success({
        content: 'Chats Loaded',
        meta: `Loaded ${response.chats.length} conversations`,
        duration: 2000
      });
    } else {
      throw new Error(response.message || 'Failed to load chats');
    }

  } catch (error) {
    console.error('❌ Load Telegram chats error:', error);
    notification.error({
      content: 'Failed to Load Chats',
      meta: error.message || 'Could not fetch conversations',
      duration: 3000
    });
  } finally {
    telegram.value.loadingChats = false;
  }
}

function selectTelegramChat(chat) {
  telegram.value.selectedChat = chat;
  telegram.value.messages = [];
  loadTelegramMessages();
}

async function loadTelegramMessages() {
  if (!telegram.value.selectedChat) return;

  // Bot API cannot retrieve old messages - only new ones via updates
  // Show a message to user
  telegram.value.messages = [];

  notification.info({
    content: 'Telegram Bot Limitation',
    meta: 'Bots can only see new messages. Send a message to this chat to test!',
    duration: 5000
  });

  telegram.value.loadingMessages = false;
}

async function sendTelegramMessage() {
  if (!telegram.value.newMessage.trim() || !telegram.value.selectedChat || !telegram.value.selectedBot) return;

  telegram.value.sending = true;

  try {
    console.log(`📤 Sending message to ${telegram.value.selectedChat.name}...`);

    const response = await $fetch('/api/v1/telegram/send', {
      method: 'POST',
      body: {
        botId: telegram.value.selectedBot.id,
        chatId: telegram.value.selectedChat.id,
        message: telegram.value.newMessage
      }
    });

    if (response.success) {
      // Add message to UI immediately
      telegram.value.messages.push({
        id: response.messageId,
        text: telegram.value.newMessage,
        timestamp: response.timestamp,
        fromMe: true
      });

      telegram.value.newMessage = '';

      console.log('✅ Message sent successfully');

      notification.success({
        content: 'Message Sent',
        meta: 'Your message was delivered',
        duration: 2000
      });
    } else {
      throw new Error(response.message || 'Failed to send message');
    }

  } catch (error) {
    console.error('❌ Send Telegram message error:', error);
    notification.error({
      content: 'Failed to Send Message',
      meta: error.message || 'Could not send your message',
      duration: 3000
    });
  } finally {
    telegram.value.sending = false;
  }
}

// Telegram Client functions (MTProto)
async function generateQRCode() {
  telegramClient.value.generatingQR = true;
  telegramClient.value.connecting = true;

  try {
    console.log('📱 Generating QR code for Telegram client...');

    const response = await $fetch('/api/v1/telegram-client/qr-login', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    });

    if (response.success) {
      telegramClient.value.qrCode = response.qrCodeDataUrl;

      notification.success({
        content: 'QR Code Generated',
        meta: 'Scan with your Telegram app',
        duration: 3000
      });

      // Poll for authentication
      checkQRAuth();
    } else {
      throw new Error(response.message || 'Failed to generate QR code');
    }

  } catch (error) {
    console.error('❌ QR generation error:', error);
    notification.error({
      content: 'Failed to Generate QR Code',
      meta: error.message,
      duration: 5000
    });
  } finally {
    telegramClient.value.generatingQR = false;
    telegramClient.value.connecting = false;
  }
}

async function checkQRAuth() {
  const maxAttempts = 60; // 60 seconds
  let attempts = 0;

  console.log('🔍 Starting QR auth polling...');

  const pollInterval = setInterval(async () => {
    attempts++;
    console.log(`🔄 Checking auth... attempt ${attempts}/${maxAttempts}`);

    if (attempts > maxAttempts || telegramClient.value.isAuthenticated) {
      clearInterval(pollInterval);
      if (!telegramClient.value.isAuthenticated) {
        telegramClient.value.qrCode = null;
        console.log('⏱️ QR Code expired after 60 seconds');
        notification.warning({
          content: 'QR Code Expired',
          meta: 'Please generate a new QR code',
          duration: 3000
        });
      }
      return;
    }

    try {
      const response = await $fetch('/api/v1/telegram-client/check-auth', {
        query: { userID: userID.value }
      });

      console.log('📡 Check auth response:', response);

      if (response.success && response.isAuthenticated) {
        clearInterval(pollInterval);
        console.log('✅ Authentication successful!');
        telegramClient.value.isAuthenticated = true;
        telegramClient.value.userInfo = response.userInfo;
        telegramClient.value.qrCode = null;

        notification.success({
          content: 'Successfully Connected!',
          meta: `Welcome ${response.userInfo.first_name}!`,
          duration: 3000
        });

        await loadClientChats();
      } else {
        console.log('⏳ Not authenticated yet, continuing to poll...');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    }
  }, 1000);
}

async function sendPhoneCode() {
  if (!telegramClient.value.phoneNumber.trim()) {
    notification.warning({
      content: 'Missing Phone Number',
      meta: 'Please enter your phone number with country code',
      duration: 3000
    });
    return;
  }

  telegramClient.value.connecting = true;

  try {
    console.log('📞 Sending verification code...');

    const response = await $fetch('/api/v1/telegram-client/send-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: telegramClient.value.phoneNumber
      }
    });

    if (response.success) {
      telegramClient.value.phoneCodeSent = true;
      telegramClient.value.phoneCodeHash = response.phoneCodeHash;

      notification.success({
        content: 'Code Sent!',
        meta: 'Check your Telegram app for the verification code',
        duration: 3000
      });
    } else {
      throw new Error(response.message || 'Failed to send code');
    }

  } catch (error) {
    console.error('❌ Send code error:', error);
    notification.error({
      content: 'Failed to Send Code',
      meta: error.message,
      duration: 5000
    });
  } finally {
    telegramClient.value.connecting = false;
  }
}

async function verifyPhoneCode() {
  if (!telegramClient.value.verificationCode.trim()) {
    notification.warning({
      content: 'Missing Code',
      meta: 'Please enter the verification code',
      duration: 3000
    });
    return;
  }

  telegramClient.value.connecting = true;

  try {
    console.log('✅ Verifying code...');

    const response = await $fetch('/api/v1/telegram-client/verify-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: telegramClient.value.phoneNumber,
        phoneCodeHash: telegramClient.value.phoneCodeHash,
        code: telegramClient.value.verificationCode
      }
    });

    if (response.success) {
      telegramClient.value.isAuthenticated = true;
      telegramClient.value.userInfo = response.userInfo;
      telegramClient.value.phoneCodeSent = false;
      telegramClient.value.verificationCode = '';

      notification.success({
        content: 'Successfully Logged In! 🎉',
        meta: `Welcome ${response.userInfo.first_name}!`,
        duration: 3000
      });

      await loadClientChats();
    } else {
      throw new Error(response.message || 'Invalid code');
    }

  } catch (error) {
    console.error('❌ Verify code error:', error);
    notification.error({
      content: 'Verification Failed',
      meta: error.message,
      duration: 5000
    });
  } finally {
    telegramClient.value.connecting = false;
  }
}

function cancelPhoneLogin() {
  telegramClient.value.phoneCodeSent = false;
  telegramClient.value.verificationCode = '';
  telegramClient.value.phoneCodeHash = '';
}

async function loadClientChats() {
  telegramClient.value.loadingChats = true;

  try {
    console.log('💬 Loading client chats...');

    const response = await $fetch('/api/v1/telegram-client/chats', {
      query: { userID: userID.value }
    });

    console.log('📡 Chats response:', response);

    if (response.success) {
      telegramClient.value.chats = response.chats;

      // Log chat types breakdown
      const chatTypes = response.chats.reduce((acc, chat) => {
        acc[chat.type] = (acc[chat.type] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Frontend - Chat types breakdown:', chatTypes);
      console.log('📋 Frontend - All chats:', response.chats.map(c => ({ id: c.id, name: c.name, type: c.type })));

      notification.success({
        content: 'Chats Loaded',
        meta: `Loaded ${response.chats.length} conversations`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('❌ Load client chats error:', error);
    notification.error({
      content: 'Failed to Load Chats',
      meta: error.message,
      duration: 3000
    });
  } finally {
    telegramClient.value.loadingChats = false;
  }
}

function selectClientChat(chat) {
  telegramClient.value.selectedChat = chat;
  telegramClient.value.messages = [];
  loadClientMessages();
}

async function loadClientMessages() {
  if (!telegramClient.value.selectedChat) return;

  telegramClient.value.loadingMessages = true;

  try {
    console.log(`💬 Loading messages for ${telegramClient.value.selectedChat.name} (type: ${telegramClient.value.selectedChat.type})...`);

    // First, try to load from database (historical messages)
    console.log('📚 Checking database for saved messages...');
    const historyResponse = await $fetch('/api/v1/telegram-client/messages-history', {
      query: {
        userID: userID.value,
        chatId: telegramClient.value.selectedChat.id,
        limit: 100
      }
    });

    if (historyResponse.success && historyResponse.messages.length > 0) {
      telegramClient.value.messages = historyResponse.messages;
      console.log(`✅ Loaded ${historyResponse.messages.length} messages from database`);
    }

    // Then fetch fresh messages from Telegram and merge/update
    console.log('🔄 Fetching fresh messages from Telegram...');
    const response = await $fetch('/api/v1/telegram-client/messages', {
      method: 'POST',
      body: {
        userID: userID.value,
        chatId: telegramClient.value.selectedChat.id,
        chatType: telegramClient.value.selectedChat.type,
        chatName: telegramClient.value.selectedChat.name,
        limit: 50
      }
    });

    if (response.success) {
      // Merge database messages with fresh messages (avoid duplicates)
      const existingIds = new Set(telegramClient.value.messages.map(m => m.id));
      const newMessages = response.messages.filter(m => !existingIds.has(m.id));

      // Combine and sort by date
      telegramClient.value.messages = [...telegramClient.value.messages, ...newMessages]
        .sort((a, b) => a.date - b.date);

      console.log(`✅ Total messages: ${telegramClient.value.messages.length}`);

      notification.success({
        content: 'Messages Loaded',
        meta: `Loaded ${telegramClient.value.messages.length} messages`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('❌ Load client messages error:', error);
    notification.error({
      content: 'Failed to Load Messages',
      meta: error.message,
      duration: 3000
    });
  } finally {
    telegramClient.value.loadingMessages = false;
  }
}

async function sendClientMessage() {
  if (!telegramClient.value.newMessage.trim() || !telegramClient.value.selectedChat) return;

  telegramClient.value.sending = true;

  try {
    console.log(`📤 Sending message to ${telegramClient.value.selectedChat.name}...`);

    const response = await $fetch('/api/v1/telegram-client/send', {
      method: 'POST',
      body: {
        userID: userID.value,
        chatId: telegramClient.value.selectedChat.id,
        chatType: telegramClient.value.selectedChat.type,
        chatName: telegramClient.value.selectedChat.name,
        message: telegramClient.value.newMessage
      }
    });

    if (response.success) {
      telegramClient.value.messages.push({
        id: response.messageId,
        text: telegramClient.value.newMessage,
        date: Date.now() / 1000,
        isOutgoing: true,
        sender: null
      });

      telegramClient.value.newMessage = '';

      notification.success({
        content: 'Message Sent',
        meta: 'Your message was delivered',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('❌ Send client message error:', error);
    notification.error({
      content: 'Failed to Send Message',
      meta: error.message,
      duration: 3000
    });
  } finally {
    telegramClient.value.sending = false;
  }
}

async function logoutClient() {
  try {
    await $fetch('/api/v1/telegram-client/logout', {
      method: 'POST',
      body: { userID: userID.value }
    });

    telegramClient.value.isAuthenticated = false;
    telegramClient.value.userInfo = null;
    telegramClient.value.chats = [];
    telegramClient.value.selectedChat = null;
    telegramClient.value.messages = [];

    notification.success({
      content: 'Logged Out',
      meta: 'You have been disconnected from Telegram',
      duration: 2000
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
}

// Load saved Telegram configuration from user profile
async function loadSavedTelegramConfig() {
  try {
    console.log('📥 Loading saved Telegram configuration...');

    const response = await $fetch('/api/v1/telegram-client/load-config', {
      query: { userID: userID.value }
    });

    if (response.success && response.hasConfig) {
      const config = response.telegramClient;

      // Pre-fill phone number
      if (config.phoneNumber) {
        telegramClient.value.phoneNumber = config.phoneNumber;
        console.log(`✅ Loaded saved phone number: ${config.phoneNumber}`);
      }

      // If user was authenticated, restore session
      if (config.isAuthenticated && config.userInfo) {
        telegramClient.value.isAuthenticated = true;
        telegramClient.value.userInfo = config.userInfo;

        console.log(`✅ Restored Telegram session for: ${config.userInfo.firstName}`);

        notification.success({
          content: 'Telegram Connected',
          meta: `Welcome back, ${config.userInfo.firstName}!`,
          duration: 3000
        });

        // Auto-load chats
        await loadClientChats();
      } else {
        console.log('ℹ️ Phone number saved but not authenticated');
      }
    } else {
      console.log('ℹ️ No saved Telegram configuration found');
    }
  } catch (error) {
    console.error('❌ Error loading saved Telegram config:', error);
    // Don't show error notification - just log it
    // User can still authenticate manually
  }
}

// Computed filters for Telegram Bot chats
const getPrivateChats = computed(() => {
  return telegram.value.chats.filter(chat => chat.type === 'private');
});

const getGroupChats = computed(() => {
  return telegram.value.chats.filter(chat => chat.type === 'group' || chat.type === 'supergroup');
});

const getChannelChats = computed(() => {
  return telegram.value.chats.filter(chat => chat.type === 'channel');
});

const getAdminChats = computed(() => {
  return telegram.value.chats.filter(chat => chat.isAdmin === true);
});

// Helper functions for chat display
function getChatIcon(chat) {
  if (chat.type === 'channel') return '📢';
  if (chat.type === 'group' || chat.type === 'supergroup') return '👥';
  return chat.name.charAt(0).toUpperCase();
}

function getChatAvatarStyle(chat) {
  const baseStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '18px'
  };

  if (chat.type === 'channel') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #4facfe, #00f2fe)', fontSize: '20px' };
  }
  if (chat.type === 'group' || chat.type === 'supergroup') {
    return { ...baseStyle, background: 'linear-gradient(135deg, #f093fb, #f5576c)', fontSize: '20px' };
  }
  if (chat.isAdmin) {
    return { ...baseStyle, background: 'linear-gradient(135deg, #ffd89b, #19547b)', fontSize: '20px' };
  }
  return { ...baseStyle, background: 'linear-gradient(135deg, #667eea, #764ba2)' };
}

function getChatTypeLabel(type) {
  const labels = {
    'private': 'Private',
    'group': 'Group',
    'supergroup': 'Group',
    'channel': 'Channel'
  };
  return labels[type] || type;
}

function getChatTypeColor(type) {
  const colors = {
    'private': 'default',
    'group': 'warning',
    'supergroup': 'warning',
    'channel': 'info'
  };
  return colors[type] || 'default';
}

// Utility functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.chat-toolz-page {
  width: 100%;
  padding: 20px;
}

.selected-contact {
  background: rgba(37, 211, 102, 0.1);
}

.selected-bot {
  background: rgba(0, 136, 204, 0.1);
  border-left: 4px solid #0088cc !important;
}

.chat-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  margin-top: 4px;
}

.avatar-circle.avatar-you {
  background: linear-gradient(135deg, #0088cc, #0066aa);
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.message.sent .message-content {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
}

/* Telegram variant */
.n-tab-pane[name="telegram"] .message.sent .message-content {
  background: linear-gradient(135deg, #0088cc 0%, #0066aa 100%);
}

.message.received .message-content {
  background: #2d2d2d;
  color: #e0e0e0;
}

.sender-name {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #0088cc;
}

.sender-name-you {
  color: #25d366;
}

.sender-username {
  font-size: 11px;
  font-weight: 400;
  color: #888;
  margin-left: 4px;
}

.message-text {
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  text-align: right;
}

/* WhatsApp Button Hover Effects */
a {
  text-decoration: none;
}

:deep(.n-button) {
  transition: all 0.3s ease;
}

:deep(.n-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}
</style>
