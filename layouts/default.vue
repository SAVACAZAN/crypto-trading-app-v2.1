<template>





    <n-space vertical>
        <n-layout>
            <n-layout-header class="header">
                <n-space justify="space-between" align="center" class="inner">
                    <!-- LEFT SIDE - LOGO + TICKER BAR + API SELECTOR -->
                    <div class="navbar-left">
                        <nuxt-link to="/cryptoapp"><n-text class="app-title"><b>Crypto App</b></n-text></nuxt-link>
                        <TickerBar />
                        <ApiSelector />
                    </div>

                    <!-- RIGHT SIDE - APP NAV + USER INFO -->
                    <div class="navbar-right">
                        <AppTopButtonBar />
                        <n-text class="user-id-text">ID: {{userID}}</n-text>
                        <n-text class="referral-text">Ref: {{referralCode}}</n-text>
                        <n-dropdown :options="dropdownOptions">
                            <n-button size="small" class="profile-btn">👤</n-button>
                        </n-dropdown>
                    </div>
                </n-space>
            </n-layout-header>

            <!-- NAVBAR2 - BALANCE DISPLAY ROW -->
            <n-layout-header class="header-balance">
                <BalanceBar />
            </n-layout-header>

            <n-layout has-sider class="container">
                <n-layout-sider
                    bordered
                    show-trigger
                    collapse-mode="width"
                    :collapsed-width="50"
                    :width="150"
                    :native-scrollbar="false"
                    class="sidebar"
                >
                    <n-menu
                        :collapsed-width="50"
                        :collapsed-icon-size="18"
                        :options="sidebarOptions"
                    />
                </n-layout-sider>
                <n-layout class="content">
                    <slot></slot>
                </n-layout>
            </n-layout>
            <n-layout-footer bordered class="footer">
                Crypto App - 1993
            </n-layout-footer>
        </n-layout>
    </n-space>
</template>

<script setup>
import NuxtLink from "#app/components/nuxt-link";
import { h } from "vue";
import { NIcon } from "naive-ui";
import {
    AppsSharp as AppsSharp,
    BarChart as BarChart,
    Analytics as Analytics,
    MenuOutline as MenuOutline,
    GitCompareOutline as GitCompareOutline,
    BookOutline as BookIcon,
    PersonCircleOutline as UserIcon,
    LogOutOutline as LogoutIcon,
    SettingsOutline as SettingsOutline,
    SearchOutline as SearchOutline,
    StarOutline as StarOutline,
    AlertCircleOutline as AlertCircleOutline,
    CalendarOutline as CalendarOutline,
    CameraOutline as CameraOutline,
    CloudUploadOutline as CloudUploadOutline,
    MailOutline as MailOutline ,
    HeartOutline  as HeartOutline ,
    CalculatorOutline  as CalculatorOutline ,
    AttachOutline  as AttachOutline ,
    BookmarkOutline as BookmarkOutline,
    CafeOutline as CafeOutline,
    BugOutline  as BugOutline ,
    TrophyOutline as  TrophyOutline,
    StatsChartOutline as StatsChartOutline,
    GridOutline as GridOutline,
    ImageOutline as ImageOutline,
    GlobeOutline as GlobeOutline,
    ShareSocialOutline as ShareSocialOutline,
    ListOutline as ListOutline,
    EyeOutline as EyeOutline,
    TrendingUpOutline as TrendingUpOutline,
    FlashOutline as FlashOutline,
} from "@vicons/ionicons5";
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();

let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;

let referralCodeCookie = useCookie('referralCode');
let referralCode = referralCodeCookie.value;

let referredByCookie = useCookie('referredBy');
let referredBy = referredByCookie.value;

// Initialize store data on mount
onMounted(async () => {
    console.log('🚀 Layout mounted - Loading user exchange data for:', userID);
    if (userID) {
        await app.loadUserExchangeData(userID);
        console.log('✅ Store initialized with:', {
            exchange: app.getUserSelectedExchange,
            market: app.getUserSelectedMarket
        });
    }
});

function renderIcon(icon) {
    return () => h(NIcon, null, { default: () => h(icon) });
}

const sidebarOptions = [
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'cryptoapp',
                    }
                },
                { default: () => 'CryptoApp' }
            ),
        key: 'cryptoapp',
        icon: renderIcon(AppsSharp),
    },


        {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'ArbToolz',
                    }
                },
                { default: () => 'ArbToolz' }
            ),
        key: 'ArbToolz',
        icon: renderIcon(FlashOutline),
    },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'trade',
    //                 }
    //             },
    //             { default: () => 'Trade' }
    //         ),
    //     key: 'trade',
    //     icon: renderIcon(BarChart),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'frontrunning-bots',
    //                 },
    //                 disabled: true
    //             },
    //             { default: () => 'Frontrunning Bots' }
    //         ),
    //     key: 'frontrunning-bots',
    //     icon: renderIcon(Analytics),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'grid-bots',
    //                 }
    //             },
    //             { default: () => 'GRID Bots' }
    //         ),
    //     key: 'grid-bots',
    //     icon: renderIcon(MenuOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'grid-bots-plus',
    //                 }
    //             },
    //             { default: () => 'GRID Bots Plus' }
    //         ),
    //     key: 'grid-bots-plus',
    //     icon: renderIcon(StarOutline),
    // },
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'social-trading',
                    }
                },
                { default: () => 'Social Trading' }
            ),
        key: 'social-trading',
        icon: renderIcon(ShareSocialOutline),
    },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'GridBotReadme',
    //                 }
    //             },
    //             { default: () => '📚 Grid Bot README' }
    //         ),
    //     key: 'GridBotReadme',
    //     icon: renderIcon(BookIcon),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'FrontRunReadme',
    //                 }
    //             },
    //             { default: () => '📚 FrontRun README' }
    //         ),
    //     key: 'FrontRunReadme',
    //     icon: renderIcon(BookIcon),
    // },


    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'OneClickBot',
    //                 }
    //             },
    //             { default: () => 'One Click Bot  ' }
    //         ),
    //     key: 'OneClickBot',
    //     icon: renderIcon(StarOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'StocksMarkets-GlobalMarketOverview',
    //                 }
    //             },
    //             { default: () => '📊 Stocks' }
    //         ),
    //     key: 'StocksMarkets-GlobalMarketOverview',
    //     icon: renderIcon(TrendingUpOutline),
    // },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'analytics',
                    }
                },
                { default: () => 'Analytics' }
            ),
        key: 'analytics',
        icon: renderIcon(StatsChartOutline),
    },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'AiToolz',
    //                 }
    //             },
    //             { default: () => '🤖 AI Toolz' }
    //         ),
    //     key: 'AiToolz',
    //     icon: renderIcon(Analytics),
    // },



    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'TickerBarPage',
    //                 }
    //             },
    //             { default: () => '📊 Ticker Bar' }
    //         ),
    //     key: 'TickerBarPage',
    //     icon: renderIcon(BarChart),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'BalanceSAVE',
    //                 }
    //             },
    //             { default: () => 'BalanceSAVE' }
    //         ),
    //     key: 'BalanceSAVE',
    //     icon: renderIcon(SearchOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'STATS',
    //                 }
    //             },
    //             { default: () => 'Stats' }
    //         ),
    //     key: 'STATS',
    //     icon: renderIcon(StatsChartOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'Networks',
    //                 }
    //             },
    //             { default: () => 'Networks' }
    //         ),
    //     key: 'Networks',
    //     icon: renderIcon(GlobeOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'TestNetworkDev',
    //                 }
    //             },
    //             { default: () => 'TestNets' }
    //         ),
    //     key: 'TestNetworkDev',
    //     icon: renderIcon(BugOutline),
    // },


    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'OrderListDuplicate',
    //                 }
    //             },
    //             { default: () => 'OrderListDuplicate' }
    //         ),
    //     key: 'OrderListDuplicate',
    //     icon: renderIcon(SearchOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'BidAndAsk',
    //               }
    //             },
    //             { default: () => 'BidAndAsk' }
    //         ),
    //     key: 'BidAndAsk',
    //     icon: renderIcon(GitCompareOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'ALL-STR',
    //               }
    //             },
    //             { default: () => 'ALL-STR' }
    //         ),
    //     key: 'ALL-STR',
    //     icon: renderIcon(CafeOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'ALL-Strategies',
    //               }
    //             },
    //             { default: () => 'ALL-Strategies' }
    //         ),
    //     key: 'ALL-Strategies',
    //     icon: renderIcon(BookmarkOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'BetCasinoCrypto',
    //                 }
    //             },
    //             { default: () => 'BetCasinoCrypto' }
    //         ),
    //     key: 'BetCasinoCrypto',
    //     icon: renderIcon(TrophyOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'frontrun',
    //                 }
    //             },
    //             { default: () => 'Front Run' }
    //         ),
    //     key: 'frontrun',
    //     icon: renderIcon(BugOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'dkdbots',
    //                 }
    //             },
    //             { default: () => 'dkdbots' }
    //         ),
    //     key: 'dkdbots',
    //     icon: renderIcon(CalculatorOutline),
    // },



    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'DEXs',
    //                 }
    //             },
    //             { default: () => 'DEXs' }
    //         ),
    //     key: 'DEXs',
    //     icon: renderIcon(StarOutline),
    // },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'ChatToolz',
                    }
                },
                { default: () => 'ChatToolz' }
            ),
        key: 'ChatToolz',
        icon: renderIcon(MailOutline),
    },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'TelegramToolz',
    //                 }
    //             },
    //             { default: () => 'TelegramToolz' }
    //         ),
    //     key: 'TelegramToolz',
    //     icon: renderIcon(MailOutline),
    // },

    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'Referrals',
    //                 }
    //             },
    //             { default: () => 'Referrals' }
    //         ),
    //     key: 'Referrals',
    //     icon: renderIcon(CameraOutline),
    // },
    
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //                 to: {
    //                     name: 'dca-bots',
    //                 }
    //             },
    //             { default: () => 'DCA Bots' }
    //         ),
    //     key: 'dca-bots',
    //     icon: renderIcon(GitCompareOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'back-testing',
    //               }
    //             },
    //             { default: () => 'Back testing' }
    //         ),
    //     key: 'back-testing',
    //     icon: renderIcon(GitCompareOutline),
    // }, 
    {
        label: () =>
            h(
                NuxtLink,
                {
                  to: {
                    name: 'dev-tools',
                  }
                },
                { default: () => 'Dev Tools' }
            ),
        key: 'dev-tools',
        icon: renderIcon(CloudUploadOutline),
    },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'Web3Toolz',
    //               }
    //             },
    //             { default: () => 'Web3 Toolz' }
    //         ),
    //     key: 'Web3Toolz',
    //     icon: renderIcon(GlobeOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'social-profile',
    //               }
    //             },
    //             { default: () => '👥 Social Profile' }
    //         ),
    //     key: 'social-profile',
    //     icon: renderIcon(ShareSocialOutline),
    // },
    // {
    //     label: () =>
    //         h(
    //             NuxtLink,
    //             {
    //               to: {
    //                 name: 'rarible',
    //               }
    //             },
    //             { default: () => 'Rarible NFT' }
    //         ),
    //     key: 'rarible',
    //     icon: renderIcon(ImageOutline),
    // },

];

const dropdownOptions = [
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'profile',
                    }
                },
                { default: () => 'Profile' }
            ),
        key: 'profile',
        icon: renderIcon(UserIcon)
    },
    {
      label: () =>
          h(
              NuxtLink,
              {
                to: {
                  name: 'logout',
                }
              },
              { default: () => 'Logout' }
          ),
        key: 'logout',
        icon: renderIcon(LogoutIcon)
    }
];



</script>

<style scoped>
/* ========== NAVBAR ========== */
.header {
  position: sticky;
  top: 0;
  z-index: 11;
  height: 25px !important;
  padding: 0 8px !important;
  line-height: 15px !important;
  border: none !important;
  background: rgba(0, 0, 0, 0.9);
}

.inner {
  height: 100%;
}

.app-title {
  font-size: 9px !important;
  font-weight: 900;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.compact-text {
  font-size: 6px !important;
  opacity: 0.7;
}

/* USER ID - CYAN */
.user-id-text {
  font-size: 7px !important;
  font-weight: 700 !important;
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* REFERRAL CODE - MAGENTA */
.referral-text {
  font-size: 7px !important;
  font-weight: 700 !important;
  color: #ff00ff !important;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
}

.profile-btn {
  padding: 1px 4px !important;
  height: 14px !important;
  font-size: 10px !important;
}

/* Footer also compact */
.footer {
  height: 32px !important;
  padding: 0 16px !important;
  line-height: 32px !important;
  font-size: 10px !important;
  opacity: 0.6;
}

/* Sidebar adjustment */
.sidebar {
  margin-top: 0 !important;
  background: rgba(0, 0, 0, 0.9) !important;
}

:deep(.n-layout-sider) {
  background: rgba(0, 0, 0, 0.9) !important;
}

:deep(.n-menu) {
  background: rgba(0, 0, 0, 0.9) !important;
}

:deep(.n-menu-item-content) {
  color: #00ffff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
}

:deep(.n-menu-item-content__icon) {
  color: #00ffff !important;
}

:deep(.n-menu-item-content-header) {
  color: #00ffff !important;
}

:deep(.n-menu-item-content a) {
  color: #00ffff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
}

:deep(.n-menu-item-content:hover) {
  color: #ff00ff !important;
}

:deep(.n-menu-item-content:hover .n-menu-item-content__icon) {
  color: #ff00ff !important;
}

:deep(.n-menu-item-content:hover a) {
  color: #ff00ff !important;
}

:deep(.n-menu-item-content--selected) {
  color: #ffff00 !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.n-menu-item-content--selected .n-menu-item-content__icon) {
  color: #ffff00 !important;
}

:deep(.n-menu-item-content--selected a) {
  color: #ffff00 !important;
}

/* Individual menu item colors - using nth-child */
:deep(.n-menu-item:nth-child(1) a) { color: #FF6B6B !important; } /* CryptoApp */
:deep(.n-menu-item:nth-child(1) .n-menu-item-content__icon) { color: #FF6B6B !important; }

:deep(.n-menu-item:nth-child(2) a) { color: #4ECDC4 !important; } /* Trade */
:deep(.n-menu-item:nth-child(2) .n-menu-item-content__icon) { color: #4ECDC4 !important; }

:deep(.n-menu-item:nth-child(3) a) { color: #45B7D1 !important; } /* GRID Bots Plus */
:deep(.n-menu-item:nth-child(3) .n-menu-item-content__icon) { color: #45B7D1 !important; }

:deep(.n-menu-item:nth-child(4) a) { color: #96CEB4 !important; } /* Social Trading */
:deep(.n-menu-item:nth-child(4) .n-menu-item-content__icon) { color: #96CEB4 !important; }

:deep(.n-menu-item:nth-child(4) a) { color: #96CEB4 !important; } /* Grid Bot README */
:deep(.n-menu-item:nth-child(4) .n-menu-item-content__icon) { color: #96CEB4 !important; }

:deep(.n-menu-item:nth-child(5) a) { color: #FFEAA7 !important; } /* FrontRun README */
:deep(.n-menu-item:nth-child(5) .n-menu-item-content__icon) { color: #FFEAA7 !important; }

:deep(.n-menu-item:nth-child(6) a) { color: #DFE6E9 !important; } /* One Click Bot */
:deep(.n-menu-item:nth-child(6) .n-menu-item-content__icon) { color: #DFE6E9 !important; }

:deep(.n-menu-item:nth-child(7) a) { color: #74B9FF !important; } /* AI Toolz */
:deep(.n-menu-item:nth-child(7) .n-menu-item-content__icon) { color: #74B9FF !important; }

:deep(.n-menu-item:nth-child(8) a) { color: #A29BFE !important; } /* Open Orders */
:deep(.n-menu-item:nth-child(8) .n-menu-item-content__icon) { color: #A29BFE !important; }

:deep(.n-menu-item:nth-child(9) a) { color: #FD79A8 !important; } /* Closed Orders */
:deep(.n-menu-item:nth-child(9) .n-menu-item-content__icon) { color: #FD79A8 !important; }

:deep(.n-menu-item:nth-child(10) a) { color: #FDCB6E !important; } /* Ticker Bar */
:deep(.n-menu-item:nth-child(10) .n-menu-item-content__icon) { color: #FDCB6E !important; }

:deep(.n-menu-item:nth-child(11) a) { color: #6C5CE7 !important; } /* BalanceSAVE */
:deep(.n-menu-item:nth-child(11) .n-menu-item-content__icon) { color: #6C5CE7 !important; }

:deep(.n-menu-item:nth-child(12) a) { color: #00B894 !important; } /* OrderListDuplicate */
:deep(.n-menu-item:nth-child(12) .n-menu-item-content__icon) { color: #00B894 !important; }

:deep(.n-menu-item:nth-child(13) a) { color: #00CEC9 !important; } /* ALL-STR */
:deep(.n-menu-item:nth-child(13) .n-menu-item-content__icon) { color: #00CEC9 !important; }

:deep(.n-menu-item:nth-child(14) a) { color: #FF7675 !important; } /* ArbToolz */
:deep(.n-menu-item:nth-child(14) .n-menu-item-content__icon) { color: #FF7675 !important; }

:deep(.n-menu-item:nth-child(15) a) { color: #55EFC4 !important; } /* Referrals */
:deep(.n-menu-item:nth-child(15) .n-menu-item-content__icon) { color: #55EFC4 !important; }

:deep(.n-menu-item:nth-child(16) a) { color: #81ECEC !important; } /* Back testing */
:deep(.n-menu-item:nth-child(16) .n-menu-item-content__icon) { color: #81ECEC !important; }

:deep(.n-menu-item:nth-child(17) a) { color: #FAB1A0 !important; } /* Dev Tools */
:deep(.n-menu-item:nth-child(17) .n-menu-item-content__icon) { color: #FAB1A0 !important; }

:deep(.n-menu-item:nth-child(18) a) { color: #FFD93D !important; } /* Price Spectrum */
:deep(.n-menu-item:nth-child(18) .n-menu-item-content__icon) { color: #FFD93D !important; }

.container {
  height: calc(100vh - 95px) !important; /* Updated: 15px header + 48px balance bar + 32px footer */
}

/* NAVBAR LEFT - LOGO + TICKER BAR */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* NAVBAR RIGHT - USER INFO */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========== BALANCE BAR (NAVBAR2) ========== */
.header-balance {
  position: sticky;
  top: 25px;
  z-index: 10;
  height: 48px !important;
  padding: 0 16px !important;
  line-height: 48px !important;
  background: rgba(0, 0, 0, 0.9);
  border: none !important;
  overflow: hidden;
  white-space: nowrap;
}

.header-indicators {
  position: sticky;
  top: 73px; /* 25px navbar + 48px balance bar */
  z-index: 9;
  padding: 8px 16px !important;
  background: transparent;
  border: none !important;
}
</style>

