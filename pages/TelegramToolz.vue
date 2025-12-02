<template>
  <div class="telegram-toolz-page">
    <n-space vertical :size="24">
      <!-- Header -->
      <n-card style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border: 2px solid #0088cc; border-radius: 16px;">
        <template #header>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="padding: 16px; background: linear-gradient(135deg, #0088cc, #0066ff); border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 136, 204, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <div>
              <h1 style="margin: 0; font-size: 32px; color: #0088cc; font-weight: 800;">✈️ TelegramToolz</h1>
              <p style="margin: 4px 0 0 0; font-size: 15px; color: #aaa;">
                Manage Telegram Bots & User Accounts • Multi-Client Support
              </p>
            </div>
          </div>
        </template>
      </n-card>

      <!-- Main Tabs -->
      <n-tabs v-model:value="activeTab" type="card" animated size="large" style="--n-tab-border-radius: 12px;">
        <!-- Telegram Bots Tab -->
        <n-tab-pane name="bots" tab="🤖 Telegram Bots">
          <n-space vertical :size="20">
            <!-- Add New Bot Card -->
            <n-card title="➕ Add New Bot" size="small" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-space vertical :size="12">
                <n-input
                  v-model:value="newBot.name"
                  placeholder="Bot Name (e.g., My Trading Bot)"
                  size="large"
                >
                  <template #prefix>
                    <span style="font-size: 18px;">📝</span>
                  </template>
                </n-input>

                <n-input
                  v-model:value="newBot.token"
                  placeholder="Bot Token from @BotFather"
                  type="password"
                  show-password-on="click"
                  size="large"
                >
                  <template #prefix>
                    <span style="font-size: 18px;">🔑</span>
                  </template>
                </n-input>

                <n-button
                  @click="addBot"
                  type="primary"
                  size="large"
                  :loading="bots.loading"
                  :disabled="!newBot.name.trim() || !newBot.token.trim()"
                  block
                  style="background: linear-gradient(135deg, #0088cc, #0066ff); border: none;"
                >
                  <template #icon>
                    <span style="font-size: 20px;">➕</span>
                  </template>
                  Add Bot to Collection
                </n-button>
              </n-space>
            </n-card>

            <!-- Saved Bots Grid -->
            <n-card title="🤖 Your Bot Collection" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-spin :show="bots.loading">
                <div v-if="bots.list.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                  <div
                    v-for="bot in bots.list"
                    :key="bot._id"
                    @click="selectBot(bot)"
                    :class="['bot-card', { 'selected': selectedBot?._id === bot._id }]"
                  >
                    <div class="bot-card-header">
                      <div class="bot-avatar">
                        <span style="font-size: 28px;">🤖</span>
                      </div>
                      <div class="bot-info">
                        <div class="bot-name">{{ bot.name }}</div>
                        <div class="bot-username">@{{ bot.username || 'Loading...' }}</div>
                      </div>
                    </div>
                    <div class="bot-card-footer">
                      <n-tag :type="bot.isActive ? 'success' : 'warning'" size="small">
                        {{ bot.isActive ? '✅ Active' : '⚠️ Inactive' }}
                      </n-tag>
                      <n-button
                        size="small"
                        type="error"
                        @click.stop="removeBot(bot._id)"
                        ghost
                      >
                        🗑️ Remove
                      </n-button>
                    </div>
                  </div>
                </div>
                <n-empty v-else description="No bots saved" style="padding: 60px;">
                  <template #icon>
                    <div style="font-size: 64px;">🤖</div>
                  </template>
                  <template #extra>
                    <div style="font-size: 14px; color: #888; margin-top: 12px;">
                      Add your first bot using the form above
                    </div>
                  </template>
                </n-empty>
              </n-spin>
            </n-card>

            <!-- Selected Bot Details -->
            <n-card v-if="selectedBot" style="background: linear-gradient(135deg, #0f0c29, #302b63); border: 2px solid #0088cc; border-radius: 12px;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0088cc, #0066ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);">
                      <span style="font-size: 28px;">🤖</span>
                    </div>
                    <div>
                      <div style="font-size: 22px; font-weight: 700; color: #0088cc;">{{ selectedBot.name }}</div>
                      <div style="font-size: 14px; color: #888;">@{{ selectedBot.username }}</div>
                    </div>
                  </div>
                  <n-button @click="loadBotChats" size="small" :loading="selectedBot.loadingChats">
                    🔄 Refresh Chats
                  </n-button>
                </div>
              </template>

              <!-- Bot Chats with Tabs -->
              <n-tabs type="segment" animated>
                <n-tab-pane name="all" :tab="`💬 All (${selectedBot.chats?.length || 0})`">
                  <n-list bordered v-if="selectedBot.chats && selectedBot.chats.length > 0" style="max-height: 400px; overflow-y: auto; border-radius: 8px;">
                    <n-list-item
                      v-for="chat in selectedBot.chats"
                      :key="chat.id"
                      @click="selectBotChat(chat)"
                      style="cursor: pointer;"
                      :class="{ 'selected-chat': selectedBot.selectedChat?.id === chat.id }"
                    >
                      <n-space align="center" :size="12">
                        <div :style="getChatAvatarStyle(chat)">
                          {{ getChatIcon(chat) }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888; margin-top: 4px;">
                            {{ chat.description || (chat.participants_count ? `${chat.participants_count} members` : 'Direct chat') }}
                          </div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No chats" style="padding: 40px;">
                    <template #icon>
                      <div style="font-size: 48px;">💬</div>
                    </template>
                  </n-empty>
                </n-tab-pane>

                <n-tab-pane name="private" :tab="`👤 Private (${getPrivateChats(selectedBot.chats).length})`">
                  <n-list bordered v-if="getPrivateChats(selectedBot.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getPrivateChats(selectedBot.chats)" :key="chat.id" @click="selectBotChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">Private conversation</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No private chats" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👤</div></template></n-empty>
                </n-tab-pane>

                <n-tab-pane name="groups" :tab="`👥 Groups (${getGroupChats(selectedBot.chats).length})`">
                  <n-list bordered v-if="getGroupChats(selectedBot.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getGroupChats(selectedBot.chats)" :key="chat.id" @click="selectBotChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          👥
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.participants_count }} members</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No groups" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👥</div></template></n-empty>
                </n-tab-pane>

                <n-tab-pane name="channels" :tab="`📢 Channels (${getChannelChats(selectedBot.chats).length})`">
                  <n-list bordered v-if="getChannelChats(selectedBot.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getChannelChats(selectedBot.chats)" :key="chat.id" @click="selectBotChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          📢
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.participants_count }} subscribers</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No channels" style="padding: 40px;"><template #icon><div style="font-size: 48px;">📢</div></template></n-empty>
                </n-tab-pane>
              </n-tabs>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Telegram Client Tab (QR Code) -->
        <n-tab-pane name="client-qr" tab="📱 Client (QR Code)">
          <n-space vertical :size="20">
            <!-- QR Code Login Card -->
            <n-card title="📱 Login with QR Code" size="small" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
                  <n-space vertical :size="16" align="center">
                    <n-alert type="info" style="text-align: left;">
                      <strong>Quick Login with QR Code:</strong>
                      <div style="font-size: 13px; margin-top: 8px;">
                        1. Click "Generate QR Code" below<br>
                        2. Open Telegram app on your phone<br>
                        3. Go to Settings → Devices → Link Desktop Device<br>
                        4. Scan the QR code<br>
                        5. Confirm on your phone
                      </div>
                    </n-alert>

                    <div v-if="newClient.qrCode" style="text-align: center;">
                      <div style="padding: 20px; background: white; display: inline-block; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);">
                        <img :src="newClient.qrCode" alt="Telegram QR Code" style="width: 300px; height: 300px;" />
                      </div>
                      <n-alert type="warning" style="margin-top: 16px; max-width: 400px;">
                        <strong>⏱️ QR Code expires in 60 seconds</strong><br>
                        Scan it quickly!
                      </n-alert>
                      <n-button @click="generateQRCode" size="medium" ghost style="margin-top: 12px;">
                        🔄 Refresh QR Code
                      </n-button>
                    </div>

                    <n-spin v-if="newClient.generatingQR" size="large">
                      <template #description>
                        <div style="margin-top: 12px; color: #0088cc;">Generating QR code...</div>
                      </template>
                    </n-spin>

                    <n-button
                      v-if="!newClient.qrCode && !newClient.generatingQR"
                      @click="generateQRCode"
                      type="primary"
                      size="large"
                      :loading="newClient.connecting"
                      style="background: linear-gradient(135deg, #0088cc, #0066ff); border: none;"
                    >
                      <template #icon>
                        <span style="font-size: 20px;">📱</span>
                      </template>
                      Generate QR Code
                    </n-button>
                  </n-space>
            </n-card>

            <!-- Saved User Accounts List -->
            <n-card title="👤 Your User Accounts" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-spin :show="clients.loading">
                <div v-if="clients.list.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                  <div
                    v-for="client in clients.list"
                    :key="client._id"
                    @click="selectClient(client)"
                    :class="['client-card', { 'selected': selectedClient?._id === client._id }]"
                  >
                    <div class="client-card-header">
                      <div class="client-avatar">
                        <span style="font-size: 28px;">👤</span>
                      </div>
                      <div class="client-info">
                        <div class="client-name">{{ client.userInfo?.firstName }} {{ client.userInfo?.lastName }}</div>
                        <div class="client-username">@{{ client.userInfo?.username || 'No username' }}</div>
                        <div class="client-phone">{{ client.phoneNumber }}</div>
                      </div>
                    </div>
                    <div class="client-card-footer">
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <n-tag :type="client.isAuthenticated ? 'success' : 'error'" size="small">
                          {{ client.isAuthenticated ? '✅ Connected' : '❌ Disconnected' }}
                        </n-tag>
                        <n-tag
                          :type="client.loginType === 'qr' ? 'info' : client.loginType === 'hacked' ? 'warning' : 'default'"
                          size="small"
                        >
                          {{ client.loginType === 'qr' ? '📱 QR' : client.loginType === 'hacked' ? '📲 Hacked' : '📞 SMS' }}
                        </n-tag>
                      </div>
                      <n-button
                        size="small"
                        type="error"
                        @click.stop="removeClient(client._id)"
                        ghost
                      >
                        🗑️ Remove
                      </n-button>
                    </div>
                  </div>
                </div>
                <n-empty v-else description="No accounts saved" style="padding: 60px;">
                  <template #icon>
                    <div style="font-size: 64px;">👤</div>
                  </template>
                  <template #extra>
                    <div style="font-size: 14px; color: #888; margin-top: 12px;">
                      Add your first user account using the login methods above
                    </div>
                  </template>
                </n-empty>
              </n-spin>
            </n-card>

            <!-- Selected Client Details -->
            <n-card v-if="selectedClient" style="background: linear-gradient(135deg, #0f0c29, #302b63); border: 2px solid #0088cc; border-radius: 12px;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #0088cc, #0066ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0, 136, 204, 0.5);">
                      <span style="font-size: 32px;">👤</span>
                    </div>
                    <div>
                      <div style="font-size: 24px; font-weight: 700; color: #0088cc;">
                        {{ selectedClient.userInfo?.firstName }} {{ selectedClient.userInfo?.lastName }}
                      </div>
                      <div style="font-size: 14px; color: #888;">
                        @{{ selectedClient.userInfo?.username || 'No username' }} • {{ selectedClient.phoneNumber }}
                      </div>
                      <n-tag :type="selectedClient.isAuthenticated ? 'success' : 'error'" size="small" style="margin-top: 6px;">
                        {{ selectedClient.isAuthenticated ? '✅ Connected' : '❌ Disconnected' }}
                      </n-tag>
                    </div>
                  </div>
                  <n-space>
                    <n-button @click="loadClientChats" size="small" :loading="selectedClient.loadingChats">
                      🔄 Refresh
                    </n-button>
                    <n-button @click="logoutClient" size="small" type="error" ghost>
                      🚪 Logout
                    </n-button>
                  </n-space>
                </div>
              </template>

              <!-- Client Chats with Tabs -->
              <n-tabs type="segment" animated>
                <n-tab-pane name="all" :tab="`💬 All (${selectedClient.chats?.length || 0})`">
                  <n-list bordered v-if="selectedClient.chats && selectedClient.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item
                      v-for="chat in selectedClient.chats"
                      :key="chat.id"
                      @click="selectClientChat(chat)"
                      style="cursor: pointer;"
                      :class="{ 'selected-chat': selectedClient.selectedChat?.id === chat.id }"
                    >
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888; margin-top: 4px;">
                            {{ chat.lastMessage?.text?.substring(0, 60) }}{{ chat.lastMessage?.text?.length > 60 ? '...' : '' }}
                          </div>
                        </div>
                        <div v-if="chat.unreadCount > 0" style="background: #0088cc; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                          {{ chat.unreadCount }}
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No chats" style="padding: 40px;">
                    <template #icon>
                      <div style="font-size: 48px;">💬</div>
                    </template>
                  </n-empty>
                </n-tab-pane>

                <n-tab-pane name="groups" :tab="`👥 Groups (${getGroupChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getGroupChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getGroupChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          👥
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No groups" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👥</div></template></n-empty>
                </n-tab-pane>

                <n-tab-pane name="contacts" :tab="`👤 Contacts (${getPrivateChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getPrivateChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getPrivateChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No contacts" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👤</div></template></n-empty>
                </n-tab-pane>

                <n-tab-pane name="channels" :tab="`📢 Channels (${getChannelChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getChannelChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getChannelChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          📢
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #0088cc;">{{ chat.name }}</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No channels" style="padding: 40px;"><template #icon><div style="font-size: 48px;">📢</div></template></n-empty>
                </n-tab-pane>
              </n-tabs>
            </n-card>

            <!-- Client Chat Messages -->
            <n-card v-if="selectedClient && selectedClient.selectedChat" style="border: 1px solid #0088cc; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ selectedClient.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0088cc;">
                      {{ selectedClient.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadClientMessages" :loading="selectedClient.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="selectedClient.loadingMessages">
                <div class="chat-container">
                  <div v-for="msg in selectedClient.messages" :key="msg.id" :class="['message', msg.isOutgoing ? 'sent' : 'received']">
                    <!-- Sender Avatar (for received messages) -->
                    <div v-if="!msg.isOutgoing && msg.sender" class="message-avatar">
                      <div class="avatar-circle">
                        {{ (msg.sender.firstName || msg.sender.username || '?').charAt(0).toUpperCase() }}
                      </div>
                    </div>

                    <div class="message-content">
                      <!-- Sender Name (for received messages in groups) -->
                      <div v-if="!msg.isOutgoing && msg.sender && (selectedClient.selectedChat.type === 'group' || selectedClient.selectedChat.type === 'supergroup')" class="sender-name">
                        {{ msg.sender.firstName }} {{ msg.sender.lastName }}
                        <span v-if="msg.sender.username" class="sender-username">@{{ msg.sender.username }}</span>
                      </div>

                      <!-- Your Name (for sent messages) -->
                      <div v-if="msg.isOutgoing" class="sender-name sender-name-you">
                        You ({{ selectedClient.userInfo?.firstName }} {{ selectedClient.userInfo?.lastName }})
                      </div>

                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ formatTime(msg.date * 1000) }}</div>
                    </div>

                    <!-- Your Avatar (for sent messages) -->
                    <div v-if="msg.isOutgoing" class="message-avatar">
                      <div class="avatar-circle avatar-you">
                        {{ (selectedClient.userInfo?.firstName || 'Y').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="selectedClient.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendClientMessage"
                    style="flex: 1;"
                  />
                  <n-button type="primary" @click="sendClientMessage" :loading="selectedClient.sending" :disabled="!selectedClient.newMessage || !selectedClient.newMessage.trim()">
                    📤 Send
                  </n-button>
                </n-space>
              </n-spin>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Telegram Client Tab (SMS/Phone) -->
        <n-tab-pane name="client-sms" tab="📞 Client (SMS)">
          <n-space vertical :size="20">
            <!-- SMS Login Card -->
            <n-card title="📞 Login with Phone Number (SMS)" size="small" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-space vertical :size="16">
                <n-alert type="info">
                  <strong>Classic Login with Phone Number:</strong>
                  <div style="font-size: 13px; margin-top: 8px;">
                    Enter your phone number and Telegram will send you a verification code via SMS or call.
                  </div>
                </n-alert>

                <div v-if="!newClient.phoneCodeSent">
                  <n-input
                    v-model:value="newClient.phoneNumber"
                    placeholder="+40712345678 (with country code)"
                    size="large"
                    :disabled="newClient.connecting"
                  >
                    <template #prefix>
                      <span style="font-size: 18px;">📞</span>
                    </template>
                  </n-input>

                  <n-button
                    @click="sendPhoneCode"
                    type="primary"
                    size="large"
                    :loading="newClient.connecting"
                    :disabled="!newClient.phoneNumber.trim()"
                    block
                    style="margin-top: 12px; background: linear-gradient(135deg, #0088cc, #0066ff); border: none;"
                  >
                    <template #icon>
                      <span style="font-size: 18px;">📤</span>
                    </template>
                    Send Verification Code
                  </n-button>
                </div>

                <div v-if="newClient.phoneCodeSent">
                  <n-alert type="success" style="margin-bottom: 16px;">
                    <strong>✅ Code sent to {{ newClient.phoneNumber }}</strong><br>
                    <div style="font-size: 12px; margin-top: 4px;">
                      Check your SMS or Telegram app for the verification code.
                    </div>
                  </n-alert>

                  <n-input
                    v-model:value="newClient.verificationCode"
                    placeholder="Enter 5-digit code"
                    size="large"
                    :disabled="newClient.connecting"
                    maxlength="5"
                  >
                    <template #prefix>
                      <span style="font-size: 18px;">🔢</span>
                    </template>
                  </n-input>

                  <n-space :size="12" style="margin-top: 12px;">
                    <n-button
                      @click="verifyPhoneCode"
                      type="primary"
                      size="large"
                      :loading="newClient.connecting"
                      :disabled="!newClient.verificationCode.trim()"
                      style="flex: 1; background: linear-gradient(135deg, #0088cc, #0066ff); border: none;"
                    >
                      <template #icon>
                        <span style="font-size: 18px;">✅</span>
                      </template>
                      Verify Code
                    </n-button>
                    <n-button @click="cancelPhoneLogin" size="large" style="flex: 0.3;">
                      ❌
                    </n-button>
                  </n-space>
                </div>
              </n-space>
            </n-card>

            <!-- Saved User Accounts List (SMS) -->
            <n-card title="👤 Your SMS-Authenticated Accounts" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-spin :show="clients.loading">
                <div v-if="clients.list.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                  <div
                    v-for="client in clients.list"
                    :key="client._id"
                    @click="selectClient(client)"
                    :class="['client-card', { 'selected': selectedClient?._id === client._id }]"
                  >
                    <div class="client-card-header">
                      <div class="client-avatar">
                        <span style="font-size: 32px;">👤</span>
                      </div>
                      <div class="client-info">
                        <div class="client-name">{{ client.phoneNumber }}</div>
                        <div class="client-username" v-if="client.userInfo">
                          {{ client.userInfo.firstName }} {{ client.userInfo.lastName }}
                        </div>
                      </div>
                    </div>
                    <div class="client-card-footer">
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <n-tag :type="client.isAuthenticated ? 'success' : 'warning'" size="small">
                          {{ client.isAuthenticated ? '✅ Connected' : '⚠️ Disconnected' }}
                        </n-tag>
                        <n-tag
                          :type="client.loginType === 'qr' ? 'info' : client.loginType === 'hacked' ? 'warning' : 'default'"
                          size="small"
                        >
                          {{ client.loginType === 'qr' ? '📱 QR' : client.loginType === 'hacked' ? '📲 Hacked' : '📞 SMS' }}
                        </n-tag>
                      </div>
                      <n-button
                        size="small"
                        type="error"
                        @click.stop="logoutClient(client._id)"
                        ghost
                      >
                        🗑️ Logout
                      </n-button>
                    </div>
                  </div>
                </div>
                <n-empty v-else description="No authenticated accounts" style="padding: 40px;">
                  <template #icon>
                    <div style="font-size: 64px;">📞</div>
                  </template>
                </n-empty>
              </n-spin>

              <n-button
                v-if="clients.list.length > 0"
                @click="loadClientChats"
                type="primary"
                size="medium"
                :loading="selectedClient?.loadingChats"
                :disabled="!selectedClient"
                ghost
                style="margin-top: 16px; width: 100%;"
              >
                <template #icon>
                  <span style="font-size: 16px;">📥</span>
                </template>
                Load Chats for Selected Account
              </n-button>
            </n-card>

            <!-- Client Chats Panel (SMS) -->
            <n-card v-if="selectedClient && selectedClient.chats && selectedClient.chats.length > 0" title="💬 Chats & Messages" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: 12px;">
              <n-tabs type="card" animated>
                <!-- All Chats -->
                <n-tab-pane name="all" :tab="`📋 All (${selectedClient.chats.length})`">
                  <n-list bordered v-if="selectedClient.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item
                      v-for="chat in selectedClient.chats"
                      :key="chat.id"
                      @click="selectClientChat(chat)"
                      style="cursor: pointer;"
                      :class="{ 'selected-chat': selectedClient.selectedChat?.id === chat.id }"
                    >
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ getChatIcon(chat) }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.type }} • {{ chat.memberCount || 0 }} members</div>
                        </div>
                        <n-tag v-if="chat.unreadCount > 0" type="error" size="small" round>
                          {{ chat.unreadCount }}
                        </n-tag>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No chats available" style="padding: 40px;"><template #icon><div style="font-size: 48px;">💬</div></template></n-empty>
                </n-tab-pane>

                <!-- Groups -->
                <n-tab-pane name="groups" :tab="`👥 Groups (${getGroupChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getGroupChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getGroupChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          👥
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.memberCount || 0 }} members</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No groups" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👥</div></template></n-empty>
                </n-tab-pane>

                <!-- Contacts -->
                <n-tab-pane name="contacts" :tab="`👤 Contacts (${getPrivateChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getPrivateChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getPrivateChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.username ? `@${chat.username}` : 'Private Contact' }}</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No contacts" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👤</div></template></n-empty>
                </n-tab-pane>

                <!-- Channels -->
                <n-tab-pane name="channels" :tab="`📢 Channels (${getChannelChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getChannelChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getChannelChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          📢
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.memberCount || 0 }} subscribers</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No channels" style="padding: 40px;"><template #icon><div style="font-size: 48px;">📢</div></template></n-empty>
                </n-tab-pane>
              </n-tabs>
            </n-card>

            <!-- Messages Display Card (SMS) -->
            <n-card v-if="selectedClient && selectedClient.selectedChat" style="border: 1px solid #0088cc; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ selectedClient.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #0088cc;">
                      {{ selectedClient.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadClientMessages" :loading="selectedClient.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="selectedClient.loadingMessages">
                <div class="chat-container">
                  <div v-for="msg in selectedClient.messages" :key="msg.id" :class="['message', msg.isOutgoing ? 'sent' : 'received']">
                    <!-- Sender Avatar (for received messages) -->
                    <div v-if="!msg.isOutgoing && msg.sender" class="message-avatar">
                      <div class="avatar-circle">
                        {{ (msg.sender.firstName || msg.sender.username || '?').charAt(0).toUpperCase() }}
                      </div>
                    </div>

                    <div class="message-content">
                      <!-- Sender Name (for received messages in groups) -->
                      <div v-if="!msg.isOutgoing && msg.sender && (selectedClient.selectedChat.type === 'group' || selectedClient.selectedChat.type === 'supergroup')" class="sender-name">
                        {{ msg.sender.firstName }} {{ msg.sender.lastName }}
                        <span v-if="msg.sender.username" class="sender-username">@{{ msg.sender.username }}</span>
                      </div>

                      <!-- Your Name (for sent messages) -->
                      <div v-if="msg.isOutgoing" class="sender-name sender-name-you">
                        You ({{ selectedClient.userInfo?.firstName }} {{ selectedClient.userInfo?.lastName }})
                      </div>

                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ formatTime(msg.date * 1000) }}</div>
                    </div>

                    <!-- Your Avatar (for sent messages) -->
                    <div v-if="msg.isOutgoing" class="message-avatar">
                      <div class="avatar-circle avatar-you">
                        {{ (selectedClient.userInfo?.firstName || 'Y').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="selectedClient.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendClientMessage"
                    style="flex: 1;"
                  />
                  <n-button type="primary" @click="sendClientMessage" :loading="selectedClient.sending" :disabled="!selectedClient.newMessage || !selectedClient.newMessage.trim()">
                    📤 Send
                  </n-button>
                </n-space>
              </n-spin>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Hacked Free Phone Number Tab -->
        <n-tab-pane name="client-hacked" tab="📲 Hacked Free Phone">
          <n-space vertical :size="20">
            <!-- Quick Login Card (Hardcoded Phone + Code) -->
            <n-card title="⚡ Quick Login (Hardcoded Number + Code)" size="small" style="background: linear-gradient(135deg, #1a0f2e, #0f0a1e); border: 2px solid rgba(255, 215, 0, 0.6); border-radius: 12px;">
              <n-space vertical :size="16">
                <n-alert type="warning">
                  <strong>⚡ Quick Login with Hardcoded Credentials:</strong>
                  <div style="font-size: 13px; margin-top: 8px;">
                    Enter phone number and code you already have. This will request a new code from Telegram, then immediately verify with your code. Make sure the code is still valid (usually 5 minutes)!
                  </div>
                </n-alert>

                <n-input
                  v-model:value="quickLogin.phoneNumber"
                  placeholder="Phone number (hardcoded)"
                  size="large"
                  :disabled="quickLogin.connecting"
                >
                  <template #prefix>
                    <span style="font-size: 18px;">📞</span>
                  </template>
                </n-input>

                <n-input
                  v-model:value="quickLogin.verificationCode"
                  placeholder="Verification code (hardcoded)"
                  size="large"
                  :disabled="quickLogin.connecting"
                  maxlength="5"
                >
                  <template #prefix>
                    <span style="font-size: 18px;">🔑</span>
                  </template>
                </n-input>

                <n-button
                  @click="quickLoginWithHardcodedData"
                  type="success"
                  size="large"
                  :loading="quickLogin.connecting"
                  block
                  style="background: linear-gradient(135deg, #FFD700, #FFA500); border: none; color: #000; font-weight: 700;"
                >
                  <template #icon>
                    <span style="font-size: 20px;">⚡</span>
                  </template>
                  Quick Login (Hardcoded)
                </n-button>
              </n-space>
            </n-card>

            <!-- Hacked Phone Login Card -->
            <n-card title="📲 Login with Free Phone Number (from Internet)" size="small" style="background: linear-gradient(135deg, #2d1b3d, #1a0f2e); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 12px;">
              <n-space vertical :size="16">
                <n-alert type="warning">
                  <strong>⚠️ Using Free Phone Numbers from Internet:</strong>
                  <div style="font-size: 13px; margin-top: 8px;">
                    Use temporary phone numbers from services like receive-sms-online.info, sms-activate.org, or similar.
                    These numbers are publicly accessible - use only for testing purposes!
                  </div>
                </n-alert>

                <div v-if="!newClient.phoneCodeSent">
                  <n-input
                    v-model:value="newClient.phoneNumber"
                    placeholder="+1234567890 (free number from internet)"
                    size="large"
                    :disabled="newClient.connecting"
                  >
                    <template #prefix>
                      <span style="font-size: 18px;">📲</span>
                    </template>
                  </n-input>

                  <n-button
                    @click="sendPhoneCode"
                    type="warning"
                    size="large"
                    :loading="newClient.connecting"
                    :disabled="!newClient.phoneNumber.trim()"
                    block
                    style="margin-top: 12px; background: linear-gradient(135deg, #ff0080, #ff8c00); border: none;"
                  >
                    <template #icon>
                      <span style="font-size: 18px;">📤</span>
                    </template>
                    Send Code to Free Number
                  </n-button>
                </div>

                <div v-if="newClient.phoneCodeSent">
                  <n-alert type="success" style="margin-bottom: 16px;">
                    <strong>✅ Code sent to {{ newClient.phoneNumber }}</strong><br>
                    <div style="font-size: 12px; margin-top: 4px;">
                      Check the SMS receiving website for the verification code. Refresh the page if needed.
                    </div>
                  </n-alert>

                  <n-input
                    v-model:value="newClient.verificationCode"
                    placeholder="Enter 5-digit code from website"
                    size="large"
                    :disabled="newClient.connecting"
                    maxlength="5"
                  >
                    <template #prefix>
                      <span style="font-size: 18px;">🔢</span>
                    </template>
                  </n-input>

                  <n-space :size="12" style="margin-top: 12px;">
                    <n-button
                      @click="verifyPhoneCode"
                      type="warning"
                      size="large"
                      :loading="newClient.connecting"
                      :disabled="!newClient.verificationCode.trim()"
                      style="flex: 1; background: linear-gradient(135deg, #ff0080, #ff8c00); border: none;"
                    >
                      <template #icon>
                        <span style="font-size: 18px;">✅</span>
                      </template>
                      Verify Code
                    </n-button>
                    <n-button @click="cancelPhoneLogin" size="large" style="flex: 0.3;">
                      ❌
                    </n-button>
                  </n-space>
                </div>
              </n-space>
            </n-card>

            <!-- Saved Hacked Accounts List -->
            <n-card title="🔓 Your Hacked/Free Number Accounts" style="background: linear-gradient(135deg, #2d1b3d, #1a0f2e); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 12px;">
              <n-spin :show="clients.loading">
                <div v-if="clients.list.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                  <div
                    v-for="client in clients.list"
                    :key="client._id"
                    @click="selectClient(client)"
                    :class="['client-card', { 'selected': selectedClient?._id === client._id }]"
                  >
                    <div class="client-card-header">
                      <div class="client-avatar">
                        <span style="font-size: 32px;">📲</span>
                      </div>
                      <div class="client-info">
                        <div class="client-name">{{ client.phoneNumber }}</div>
                        <div class="client-username" v-if="client.userInfo">
                          {{ client.userInfo.firstName }} {{ client.userInfo.lastName }}
                        </div>
                      </div>
                    </div>
                    <div class="client-card-footer">
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <n-tag :type="client.isAuthenticated ? 'success' : 'warning'" size="small">
                          {{ client.isAuthenticated ? '✅ Connected' : '⚠️ Disconnected' }}
                        </n-tag>
                        <n-tag
                          :type="client.loginType === 'qr' ? 'info' : client.loginType === 'hacked' ? 'warning' : 'default'"
                          size="small"
                        >
                          {{ client.loginType === 'qr' ? '📱 QR' : client.loginType === 'hacked' ? '📲 Hacked' : '📞 SMS' }}
                        </n-tag>
                      </div>
                      <n-button
                        size="small"
                        type="error"
                        @click.stop="logoutClient(client._id)"
                        ghost
                      >
                        🗑️ Logout
                      </n-button>
                    </div>
                  </div>
                </div>
                <n-empty v-else description="No hacked accounts" style="padding: 40px;">
                  <template #icon>
                    <div style="font-size: 64px;">📲</div>
                  </template>
                </n-empty>
              </n-spin>

              <n-button
                v-if="clients.list.length > 0"
                @click="loadClientChats"
                type="warning"
                size="medium"
                :loading="selectedClient?.loadingChats"
                :disabled="!selectedClient"
                ghost
                style="margin-top: 16px; width: 100%;"
              >
                <template #icon>
                  <span style="font-size: 16px;">📥</span>
                </template>
                Load Chats for Selected Account
              </n-button>
            </n-card>

            <!-- Client Chats Panel (Hacked) -->
            <n-card v-if="selectedClient && selectedClient.chats && selectedClient.chats.length > 0" title="💬 Chats & Messages" style="background: linear-gradient(135deg, #2d1b3d, #1a0f2e); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 12px;">
              <n-tabs type="card" animated>
                <!-- All Chats -->
                <n-tab-pane name="all" :tab="`📋 All (${selectedClient.chats.length})`">
                  <n-list bordered v-if="selectedClient.chats.length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item
                      v-for="chat in selectedClient.chats"
                      :key="chat.id"
                      @click="selectClientChat(chat)"
                      style="cursor: pointer;"
                      :class="{ 'selected-chat': selectedClient.selectedChat?.id === chat.id }"
                    >
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: #ff0080; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ getChatIcon(chat) }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.type }} • {{ chat.memberCount || 0 }} members</div>
                        </div>
                        <n-tag v-if="chat.unreadCount > 0" type="error" size="small" round>
                          {{ chat.unreadCount }}
                        </n-tag>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No chats available" style="padding: 40px;"><template #icon><div style="font-size: 48px;">💬</div></template></n-empty>
                </n-tab-pane>

                <!-- Groups -->
                <n-tab-pane name="groups" :tab="`👥 Groups (${getGroupChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getGroupChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getGroupChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          👥
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.memberCount || 0 }} members</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No groups" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👥</div></template></n-empty>
                </n-tab-pane>

                <!-- Contacts -->
                <n-tab-pane name="contacts" :tab="`👤 Contacts (${getPrivateChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getPrivateChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getPrivateChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                          {{ chat.name.charAt(0).toUpperCase() }}
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.username ? `@${chat.username}` : 'Private Contact' }}</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No contacts" style="padding: 40px;"><template #icon><div style="font-size: 48px;">👤</div></template></n-empty>
                </n-tab-pane>

                <!-- Channels -->
                <n-tab-pane name="channels" :tab="`📢 Channels (${getChannelChats(selectedClient.chats).length})`">
                  <n-list bordered v-if="getChannelChats(selectedClient.chats).length > 0" style="max-height: 400px; overflow-y: auto;">
                    <n-list-item v-for="chat in getChannelChats(selectedClient.chats)" :key="chat.id" @click="selectClientChat(chat)" style="cursor: pointer;">
                      <n-space align="center" :size="12">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                          📢
                        </div>
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 15px;">{{ chat.name }}</div>
                          <div style="font-size: 12px; color: #888;">{{ chat.memberCount || 0 }} subscribers</div>
                        </div>
                      </n-space>
                    </n-list-item>
                  </n-list>
                  <n-empty v-else description="No channels" style="padding: 40px;"><template #icon><div style="font-size: 48px;">📢</div></template></n-empty>
                </n-tab-pane>
              </n-tabs>
            </n-card>

            <!-- Messages Display Card (Hacked) -->
            <n-card v-if="selectedClient && selectedClient.selectedChat" style="border: 1px solid #ff0080; background: linear-gradient(135deg, #2d1b3d, #1a0f2e); border-radius: 12px;">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #ff0080; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                      {{ selectedClient.selectedChat.name.charAt(0).toUpperCase() }}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #ff0080;">
                      {{ selectedClient.selectedChat.name }}
                    </div>
                  </div>
                  <n-button size="small" @click="loadClientMessages" :loading="selectedClient.loadingMessages">
                    🔄 Refresh
                  </n-button>
                </div>
              </template>

              <!-- Messages -->
              <n-spin :show="selectedClient.loadingMessages">
                <div class="chat-container">
                  <div v-for="msg in selectedClient.messages" :key="msg.id" :class="['message', msg.isOutgoing ? 'sent' : 'received']">
                    <!-- Sender Avatar (for received messages) -->
                    <div v-if="!msg.isOutgoing && msg.sender" class="message-avatar">
                      <div class="avatar-circle">
                        {{ (msg.sender.firstName || msg.sender.username || '?').charAt(0).toUpperCase() }}
                      </div>
                    </div>

                    <div class="message-content">
                      <!-- Sender Name (for received messages in groups) -->
                      <div v-if="!msg.isOutgoing && msg.sender && (selectedClient.selectedChat.type === 'group' || selectedClient.selectedChat.type === 'supergroup')" class="sender-name">
                        {{ msg.sender.firstName }} {{ msg.sender.lastName }}
                        <span v-if="msg.sender.username" class="sender-username">@{{ msg.sender.username }}</span>
                      </div>

                      <!-- Your Name (for sent messages) -->
                      <div v-if="msg.isOutgoing" class="sender-name sender-name-you">
                        You ({{ selectedClient.userInfo?.firstName }} {{ selectedClient.userInfo?.lastName }})
                      </div>

                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ formatTime(msg.date * 1000) }}</div>
                    </div>

                    <!-- Your Avatar (for sent messages) -->
                    <div v-if="msg.isOutgoing" class="message-avatar">
                      <div class="avatar-circle avatar-you">
                        {{ (selectedClient.userInfo?.firstName || 'Y').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Send Message -->
                <n-space :size="12" style="margin-top: 16px;">
                  <n-input
                    v-model:value="selectedClient.newMessage"
                    placeholder="Type a message..."
                    @keyup.enter="sendClientMessage"
                    style="flex: 1;"
                  />
                  <n-button type="warning" @click="sendClientMessage" :loading="selectedClient.sending" :disabled="!selectedClient.newMessage || !selectedClient.newMessage.trim()">
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
import { ref, onMounted } from 'vue';
import { useNotification } from 'naive-ui';

const userID = useCookie('userID');
const notification = useNotification();

const activeTab = ref('bots');

// Bots state
const newBot = ref({
  name: '',
  token: ''
});

const bots = ref({
  list: [],
  loading: false
});

const selectedBot = ref(null);

// Clients state
const newClient = ref({
  phoneNumber: '',
  verificationCode: '',
  phoneCodeHash: '',
  phoneCodeSent: false,
  qrCode: null,
  generatingQR: false,
  connecting: false
});

const clients = ref({
  list: [],
  loading: false
});

const selectedClient = ref(null);

// Quick Login state (hardcoded phone + code)
const quickLogin = ref({
  phoneNumber: '+1234567890', // Număr hardcodat - schimbă cu al tău
  verificationCode: '12345', // Cod hardcodat - schimbă cu al tău
  connecting: false
});

// Load saved bots and clients on mount
onMounted(async () => {
  console.log('📥 TelegramToolz: Loading saved data...');
  await loadSavedBots();
  await loadSavedClients();
});

// ========== BOT MANAGEMENT ==========

async function loadSavedBots() {
  bots.value.loading = true;
  try {
    console.log('🤖 Loading saved bots from database...');

    // Use the same endpoint as ChatToolz
    const response = await $fetch('/api/v1/telegram/bots/list', {
      query: { userID: userID.value }
    });

    if (response.success && response.bots) {
      bots.value.list = response.bots.map(bot => ({
        _id: bot._id,
        name: bot.name,
        username: bot.username,
        token: bot.token,
        botId: bot.botId,
        isActive: bot.isActive || true
      }));

      console.log(`✅ Loaded ${bots.value.list.length} saved bots`);

      // Auto-select first bot if available
      if (bots.value.list.length > 0 && !selectedBot.value) {
        selectBot(bots.value.list[0]);
      }
    }
  } catch (error) {
    console.error('❌ Error loading bots:', error);
  } finally {
    bots.value.loading = false;
  }
}

async function addBot() {
  if (!newBot.value.name.trim() || !newBot.value.token.trim()) {
    notification.warning({
      content: 'Missing Information',
      meta: 'Please provide bot name and token',
      duration: 3000
    });
    return;
  }

  bots.value.loading = true;

  try {
    console.log('🚀 Adding new Telegram bot...');

    // Use the same endpoint as ChatToolz
    const response = await $fetch('/api/v1/telegram/bots/add', {
      method: 'POST',
      body: {
        userID: userID.value,
        botName: newBot.value.name,
        botToken: newBot.value.token
      }
    });

    if (response.success) {
      notification.success({
        content: 'Bot Added Successfully! 🎉',
        meta: `@${response.bot.username} is now connected`,
        duration: 3000
      });

      // Clear form
      newBot.value.name = '';
      newBot.value.token = '';

      // Reload bots
      await loadSavedBots();
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
    bots.value.loading = false;
  }
}

async function removeBot(botId) {
  if (!confirm('Are you sure you want to remove this bot?')) return;

  try {
    // Use the same endpoint as ChatToolz
    const response = await $fetch('/api/v1/telegram/bots/remove', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: botId
      }
    });

    if (response.success) {
      notification.success({
        content: 'Bot Removed',
        meta: 'Bot has been deleted',
        duration: 3000
      });

      if (selectedBot.value?._id === botId) {
        selectedBot.value = null;
      }

      await loadSavedBots();
    }
  } catch (error) {
    console.error('❌ Error removing bot:', error);
    notification.error({
      content: 'Error',
      meta: error.message,
      duration: 5000
    });
  }
}

function selectBot(bot) {
  selectedBot.value = bot;
  if (!bot.chats) {
    loadBotChats();
  }
}

async function loadBotChats() {
  if (!selectedBot.value) return;

  selectedBot.value.loadingChats = true;

  try {
    console.log(`💬 Loading chats for bot: ${selectedBot.value.username}...`);

    // Use the same endpoint as ChatToolz
    const response = await $fetch('/api/v1/telegram/chats', {
      query: {
        botToken: selectedBot.value.token
      }
    });

    if (response.success) {
      selectedBot.value.chats = response.chats;
      console.log(`✅ Loaded ${response.chats.length} chats for bot`);
    }
  } catch (error) {
    console.error('❌ Error loading bot chats:', error);
    notification.error({
      content: 'Failed to Load Chats',
      meta: error.message,
      duration: 5000
    });
  } finally {
    selectedBot.value.loadingChats = false;
  }
}

function selectBotChat(chat) {
  if (selectedBot.value) {
    selectedBot.value.selectedChat = chat;
    selectedBot.value.messages = [];
    loadBotMessages();
  }
}

async function loadBotMessages() {
  if (!selectedBot.value?.selectedChat) return;

  selectedBot.value.loadingMessages = true;

  try {
    // Bot API cannot retrieve old messages - only new ones via updates
    // Show a message to user
    selectedBot.value.messages = [];

    notification.info({
      content: 'Telegram Bot Limitation',
      meta: 'Bots can only see new messages. Send a message to this chat to test!',
      duration: 5000
    });
  } catch (error) {
    console.error('❌ Error loading bot messages:', error);
  } finally {
    selectedBot.value.loadingMessages = false;
  }
}

// ========== CLIENT MANAGEMENT ==========

async function loadSavedClients() {
  clients.value.loading = true;
  try {
    console.log('👤 Loading saved Telegram Client configuration...');

    // Use the same endpoint as ChatToolz to load config
    const response = await $fetch('/api/v1/telegram-client/load-config', {
      query: { userID: userID.value }
    });

    if (response.success && response.hasConfig) {
      const config = response.telegramClient;

      // Create a client entry from the config
      if (config.phoneNumber) {
        const clientEntry = {
          _id: userID.value, // Use userID as unique identifier
          userID: userID.value,
          phoneNumber: config.phoneNumber,
          isAuthenticated: config.isAuthenticated || false,
          userInfo: config.userInfo || null,
          lastActive: config.lastConnected
        };

        clients.value.list = [clientEntry];
        console.log(`✅ Loaded Telegram Client: ${config.phoneNumber} (${config.isAuthenticated ? 'Connected' : 'Not connected'})`);

        // Auto-select if authenticated
        if (config.isAuthenticated && config.userInfo) {
          selectClient(clientEntry);

          notification.success({
            content: 'Telegram Connected',
            meta: `Welcome back, ${config.userInfo.firstName}!`,
            duration: 3000
          });

          // Auto-load chats
          await loadClientChats();
        }
      } else {
        clients.value.list = [];
        console.log('ℹ️ No saved Telegram Client configuration found');
      }
    } else {
      clients.value.list = [];
      console.log('ℹ️ No saved Telegram Client configuration found');
    }
  } catch (error) {
    console.error('❌ Error loading clients:', error);
    clients.value.list = [];
  } finally {
    clients.value.loading = false;
  }
}

async function generateQRCode() {
  newClient.value.generatingQR = true;
  newClient.value.connecting = true;

  try {
    const response = await $fetch('/api/v1/telegram-client/qr-login', {
      method: 'POST',
      body: {
        userID: userID.value,
        loginType: 'qr' // QR Code authentication
      }
    });

    if (response.success) {
      newClient.value.qrCode = response.qrCodeDataUrl;
      notification.success({
        content: 'QR Code Generated',
        meta: 'Scan with your Telegram app',
        duration: 3000
      });

      // Start polling for auth
      checkQRAuth();
    }
  } catch (error) {
    console.error('❌ Error generating QR:', error);
    notification.error({
      content: 'Failed to Generate QR Code',
      meta: error.message,
      duration: 5000
    });
  } finally {
    newClient.value.generatingQR = false;
    newClient.value.connecting = false;
  }
}

async function checkQRAuth() {
  const maxAttempts = 60;
  let attempts = 0;

  const pollInterval = setInterval(async () => {
    attempts++;

    if (attempts > maxAttempts) {
      clearInterval(pollInterval);
      newClient.value.qrCode = null;
      notification.warning({
        content: 'QR Code Expired',
        meta: 'Please generate a new QR code',
        duration: 3000
      });
      return;
    }

    try {
      const response = await $fetch('/api/v1/telegram-client/check-auth', {
        query: { userID: userID.value }
      });

      // Check if QR code expired
      if (response.message && (response.message.includes('expired') || response.message.includes('QR code has expired'))) {
        clearInterval(pollInterval);
        newClient.value.qrCode = null;
        notification.warning({
          content: 'QR Code Expired',
          meta: 'Please generate a new QR code',
          duration: 3000
        });
        return;
      }

      if (response.success && response.isAuthenticated) {
        clearInterval(pollInterval);
        newClient.value.qrCode = null;

        notification.success({
          content: 'Successfully Connected!',
          meta: `Welcome ${response.userInfo.firstName}!`,
          duration: 3000
        });

        // Reload clients
        await loadSavedClients();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Stop polling on persistent errors
      if (attempts > 5) {
        clearInterval(pollInterval);
        newClient.value.qrCode = null;
      }
    }
  }, 1000);
}

async function sendPhoneCode() {
  if (!newClient.value.phoneNumber.trim()) {
    notification.warning({
      content: 'Missing Phone Number',
      meta: 'Please enter your phone number with country code',
      duration: 3000
    });
    return;
  }

  newClient.value.connecting = true;

  // Determine login type based on active tab
  const loginType = activeTab.value === 'client-hacked' ? 'hacked' : 'sms';

  try {
    const response = await $fetch('/api/v1/telegram-client/send-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: newClient.value.phoneNumber,
        loginType: loginType // Pass login type (sms or hacked)
      }
    });

    if (response.success) {
      newClient.value.phoneCodeSent = true;
      newClient.value.phoneCodeHash = response.phoneCodeHash;

      notification.success({
        content: 'Code Sent!',
        meta: 'Check your Telegram app',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('❌ Error sending code:', error);
    notification.error({
      content: 'Failed to Send Code',
      meta: error.message,
      duration: 5000
    });
  } finally {
    newClient.value.connecting = false;
  }
}

async function verifyPhoneCode() {
  if (!newClient.value.verificationCode.trim()) {
    notification.warning({
      content: 'Missing Code',
      meta: 'Please enter the verification code',
      duration: 3000
    });
    return;
  }

  newClient.value.connecting = true;

  try {
    const response = await $fetch('/api/v1/telegram-client/verify-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: newClient.value.phoneNumber,
        phoneCodeHash: newClient.value.phoneCodeHash,
        code: newClient.value.verificationCode
      }
    });

    if (response.success) {
      notification.success({
        content: 'Successfully Logged In! 🎉',
        meta: `Welcome ${response.userInfo.firstName}!`,
        duration: 3000
      });

      // Reset form
      newClient.value.phoneCodeSent = false;
      newClient.value.verificationCode = '';
      newClient.value.phoneNumber = '';

      // Reload clients
      await loadSavedClients();
    }
  } catch (error) {
    console.error('❌ Error verifying code:', error);
    notification.error({
      content: 'Verification Failed',
      meta: error.message,
      duration: 5000
    });
  } finally {
    newClient.value.connecting = false;
  }
}

function cancelPhoneLogin() {
  newClient.value.phoneCodeSent = false;
  newClient.value.verificationCode = '';
  newClient.value.phoneCodeHash = '';
}

// Quick Login cu date hardcodate - trimite cod apoi verifică automat
async function quickLoginWithHardcodedData() {
  if (!quickLogin.value.phoneNumber.trim() || !quickLogin.value.verificationCode.trim()) {
    notification.warning({
      content: 'Missing Data',
      meta: 'Please provide both phone number and verification code',
      duration: 3000
    });
    return;
  }

  quickLogin.value.connecting = true;

  try {
    console.log('⚡ Quick login Step 1: Sending code request to Telegram...');

    // Step 1: Request verification code from Telegram
    const sendCodeResponse = await $fetch('/api/v1/telegram-client/send-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: quickLogin.value.phoneNumber,
        loginType: 'hacked'
      }
    });

    if (!sendCodeResponse.success) {
      throw new Error(sendCodeResponse.message || 'Failed to send code');
    }

    console.log('⚡ Quick login Step 2: Verifying with hardcoded code...');

    // Step 2: Verify with the hardcoded code
    const response = await $fetch('/api/v1/telegram-client/verify-code', {
      method: 'POST',
      body: {
        userID: userID.value,
        phoneNumber: quickLogin.value.phoneNumber,
        phoneCodeHash: sendCodeResponse.phoneCodeHash,
        code: quickLogin.value.verificationCode,
        loginType: 'hacked'
      }
    });

    if (response.success) {
      notification.success({
        content: '⚡ Quick Login Successful! 🎉',
        meta: `Welcome ${response.userInfo.firstName}!`,
        duration: 3000
      });

      // Reload clients
      await loadSavedClients();
    }
  } catch (error) {
    console.error('❌ Quick login error:', error);
    notification.error({
      content: 'Quick Login Failed',
      meta: error.message || 'Could not login. Check if the code is correct and still valid.',
      duration: 5000
    });
  } finally {
    quickLogin.value.connecting = false;
  }
}

async function removeClient(clientId) {
  if (!confirm('Are you sure you want to remove this account?')) return;

  try {
    const response = await $fetch('/api/v1/telegram-client/remove-client', {
      method: 'POST',
      body: {
        userID: userID.value,
        clientId: clientId
      }
    });

    if (response.success) {
      notification.success({
        content: 'Account Removed',
        meta: 'User account has been deleted',
        duration: 3000
      });

      if (selectedClient.value?._id === clientId) {
        selectedClient.value = null;
      }

      await loadSavedClients();
    }
  } catch (error) {
    console.error('❌ Error removing client:', error);
    notification.error({
      content: 'Error',
      meta: error.message,
      duration: 5000
    });
  }
}

function selectClient(client) {
  selectedClient.value = client;

  // Initialize message properties if not present
  if (!client.newMessage) {
    client.newMessage = '';
  }
  if (client.sending === undefined) {
    client.sending = false;
  }
  if (!client.messages) {
    client.messages = [];
  }

  if (client.isAuthenticated && !client.chats) {
    loadClientChats();
  }
}

async function loadClientChats() {
  if (!selectedClient.value) return;

  selectedClient.value.loadingChats = true;

  try {
    console.log(`💬 Loading client chats for user: ${selectedClient.value.phoneNumber}...`);

    // Use the same endpoint as ChatToolz
    const response = await $fetch('/api/v1/telegram-client/chats', {
      query: {
        userID: userID.value
      }
    });

    if (response.success) {
      selectedClient.value.chats = response.chats;
      console.log(`✅ Loaded ${response.chats.length} chats for client`);

      // Log chat types breakdown
      const chatTypes = response.chats.reduce((acc, chat) => {
        acc[chat.type] = (acc[chat.type] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Chat types:', chatTypes);
    }
  } catch (error) {
    console.error('❌ Error loading client chats:', error);

    if (error.data && error.data.sessionExpired) {
      notification.error({
        content: 'Session Expired',
        meta: 'Please login again to access your chats',
        duration: 5000
      });

      // Reset client state
      selectedClient.value.isAuthenticated = false;
      selectedClient.value.chats = [];
    } else {
      notification.error({
        content: 'Failed to Load Chats',
        meta: error.message,
        duration: 5000
      });
    }
  } finally {
    selectedClient.value.loadingChats = false;
  }
}

async function logoutClient() {
  if (!selectedClient.value) return;

  if (!confirm('Are you sure you want to logout from Telegram?')) return;

  try {
    console.log('🚪 Logging out from Telegram Client...');

    const response = await $fetch('/api/v1/telegram-client/logout', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    });

    if (response.success) {
      notification.success({
        content: 'Logged Out',
        meta: 'You have been disconnected from Telegram',
        duration: 2000
      });

      // Clear client data
      selectedClient.value = null;
      clients.value.list = [];
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    notification.error({
      content: 'Logout Error',
      meta: error.message,
      duration: 5000
    });
  }
}

function selectClientChat(chat) {
  if (selectedClient.value) {
    selectedClient.value.selectedChat = chat;
    selectedClient.value.messages = [];
    loadClientMessages();
  }
}

async function loadClientMessages() {
  if (!selectedClient.value?.selectedChat) return;

  selectedClient.value.loadingMessages = true;

  try {
    console.log(`💬 Loading messages for ${selectedClient.value.selectedChat.name} (type: ${selectedClient.value.selectedChat.type})...`);

    // First, try to load from database (historical messages)
    console.log('📚 Checking database for saved messages...');
    const historyResponse = await $fetch('/api/v1/telegram-client/messages-history', {
      query: {
        userID: userID.value,
        chatId: selectedClient.value.selectedChat.id,
        limit: 100
      }
    });

    if (historyResponse.success && historyResponse.messages.length > 0) {
      selectedClient.value.messages = historyResponse.messages;
      console.log(`✅ Loaded ${historyResponse.messages.length} messages from database`);
    }

    // Then fetch fresh messages from Telegram and merge/update
    console.log('🔄 Fetching fresh messages from Telegram...');
    const response = await $fetch('/api/v1/telegram-client/messages', {
      method: 'POST',
      body: {
        userID: userID.value,
        chatId: selectedClient.value.selectedChat.id,
        chatType: selectedClient.value.selectedChat.type,
        chatName: selectedClient.value.selectedChat.name,
        accessHash: selectedClient.value.selectedChat.accessHash, // Include access_hash for API calls
        limit: 50
      }
    });

    if (response.success) {
      // Merge database messages with fresh messages (avoid duplicates)
      const existingIds = new Set(selectedClient.value.messages.map(m => m.id));
      const newMessages = response.messages.filter(m => !existingIds.has(m.id));

      // Combine and sort by date
      selectedClient.value.messages = [...selectedClient.value.messages, ...newMessages]
        .sort((a, b) => a.date - b.date);

      console.log(`✅ Total messages: ${selectedClient.value.messages.length}`);

      notification.success({
        content: 'Messages Loaded',
        meta: `Loaded ${selectedClient.value.messages.length} messages from ${selectedClient.value.selectedChat.name}`,
        duration: 2000
      });
    }
  } catch (error) {
    console.error('❌ Load client messages error:', error);
    notification.error({
      content: 'Failed to Load Messages',
      meta: error.message || 'Could not load messages',
      duration: 3000
    });
  } finally {
    selectedClient.value.loadingMessages = false;
  }
}

async function sendClientMessage() {
  if (!selectedClient.value?.newMessage?.trim() || !selectedClient.value?.selectedChat) return;

  selectedClient.value.sending = true;

  try {
    console.log(`📤 Sending message to ${selectedClient.value.selectedChat.name}...`);

    const response = await $fetch('/api/v1/telegram-client/send', {
      method: 'POST',
      body: {
        userID: userID.value,
        chatId: selectedClient.value.selectedChat.id,
        chatType: selectedClient.value.selectedChat.type,
        chatName: selectedClient.value.selectedChat.name,
        accessHash: selectedClient.value.selectedChat.accessHash,
        message: selectedClient.value.newMessage
      }
    });

    if (response.success) {
      // Add sent message to messages list
      selectedClient.value.messages.push({
        id: response.messageId,
        text: selectedClient.value.newMessage,
        date: Date.now() / 1000,
        isOutgoing: true,
        sender: null
      });

      // Clear input
      selectedClient.value.newMessage = '';

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
      meta: error.message || 'Could not send your message',
      duration: 3000
    });
  } finally {
    selectedClient.value.sending = false;
  }
}

// ========== HELPER FUNCTIONS ==========

function getPrivateChats(chats) {
  if (!chats) return [];
  return chats.filter(chat => chat.type === 'private');
}

function getGroupChats(chats) {
  if (!chats) return [];
  return chats.filter(chat => chat.type === 'group' || chat.type === 'supergroup');
}

function getChannelChats(chats) {
  if (!chats) return [];
  return chats.filter(chat => chat.type === 'channel');
}

function getChatIcon(chat) {
  if (chat.type === 'private') return '👤';
  if (chat.type === 'group' || chat.type === 'supergroup') return '👥';
  if (chat.type === 'channel') return '📢';
  return '💬';
}

function getChatAvatarStyle(chat) {
  const baseStyle = 'width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;';

  if (chat.type === 'private') return baseStyle + ' background: linear-gradient(135deg, #667eea, #764ba2);';
  if (chat.type === 'group' || chat.type === 'supergroup') return baseStyle + ' background: linear-gradient(135deg, #f093fb, #f5576c);';
  if (chat.type === 'channel') return baseStyle + ' background: linear-gradient(135deg, #4facfe, #00f2fe);';
  return baseStyle + ' background: linear-gradient(135deg, #0088cc, #0066ff);';
}

// Utility function
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.telegram-toolz-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e);
}

/* Bot Cards */
.bot-card {
  background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
  border: 2px solid rgba(0, 136, 204, 0.3);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bot-card:hover {
  border-color: #0088cc;
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.3);
  transform: translateY(-2px);
}

.bot-card.selected {
  border-color: #0088cc;
  box-shadow: 0 0 20px rgba(0, 136, 204, 0.5);
  background: linear-gradient(135deg, #0f0c29, #302b63);
}

.bot-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bot-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0088cc, #0066ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
}

.bot-info {
  flex: 1;
}

.bot-name {
  font-size: 18px;
  font-weight: 700;
  color: #0088cc;
  margin-bottom: 4px;
}

.bot-username {
  font-size: 13px;
  color: #888;
}

.bot-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Client Cards */
.client-card {
  background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
  border: 2px solid rgba(0, 136, 204, 0.3);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.client-card:hover {
  border-color: #0088cc;
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.3);
  transform: translateY(-2px);
}

.client-card.selected {
  border-color: #0088cc;
  box-shadow: 0 0 20px rgba(0, 136, 204, 0.5);
  background: linear-gradient(135deg, #0f0c29, #302b63);
}

.client-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.client-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0088cc, #0066ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
}

.client-info {
  flex: 1;
}

.client-name {
  font-size: 16px;
  font-weight: 700;
  color: #0088cc;
  margin-bottom: 4px;
}

.client-username {
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
}

.client-phone {
  font-size: 11px;
  color: #666;
}

.client-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Selected Chat Highlight */
.selected-chat {
  background: linear-gradient(135deg, rgba(0, 136, 204, 0.1), rgba(0, 102, 255, 0.1));
  border-left: 4px solid #0088cc !important;
}

/* Message Display Styles */
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
  background: linear-gradient(135deg, #0088cc 0%, #0066aa 100%);
  color: white;
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
</style>
