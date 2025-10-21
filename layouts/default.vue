<template>





    <n-space vertical>
        <n-layout>
            <n-layout-header bordered class="header">
                <n-space justify="space-between" align="center" class="inner">
                    <!-- LEFT SIDE - LOGO + TICKER BAR + API SELECTOR -->
                    <div class="navbar-left">
                        <nuxt-link to="/dashboard"><n-text class="app-title"><b>Crypto App</b></n-text></nuxt-link>
                        <TickerBar />
                        <ApiSelector />
                    </div>

                    <!-- RIGHT SIDE - USER INFO -->
                    <div class="navbar-right">
                        <n-text class="user-id-text">ID: {{userID}}</n-text>
                        <n-text class="referral-text">Ref: {{referralCode}}</n-text>
                        <n-dropdown :options="dropdownOptions">
                            <n-button size="small" class="profile-btn">👤</n-button>
                        </n-dropdown>
                    </div>
                </n-space>
            </n-layout-header>
            <n-layout has-sider class="container">
                <n-layout-sider
                    bordered
                    show-trigger
                    collapse-mode="width"
                    :collapsed-width="64"
                    :width="200"
                    :native-scrollbar="false"
                    class="sidebar"
                >
                    <n-menu
                        :collapsed-width="64"
                        :collapsed-icon-size="22"
                        :options="sidebarOptions"
                    />
                </n-layout-sider>
                <n-layout class="content">
                    <slot></slot>
                </n-layout>
            </n-layout>
            <n-layout-footer bordered class="footer">
                Crypto App - 2023
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
} from "@vicons/ionicons5";
let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;

let referralCodeCookie = useCookie('referralCode');
let referralCode = referralCodeCookie.value;

let referredByCookie = useCookie('referredBy');
let referredBy = referredByCookie.value;

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
                        name: 'dashboard',
                    }
                },
                { default: () => 'Dashboard' }
            ),
        key: 'dashboard',
        icon: renderIcon(AppsSharp),
    },
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'trade',
                    }
                },
                { default: () => 'Trade' }
            ),
        key: 'trade',
        icon: renderIcon(BarChart),
    },
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
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'grid-bots-plus',
                    }
                },
                { default: () => 'GRID Bots Plus' }
            ),
        key: 'grid-bots-plus',
        icon: renderIcon(StarOutline),
    },
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'GridBotReadme',
                    }
                },
                { default: () => '📚 Grid Bot README' }
            ),
        key: 'GridBotReadme',
        icon: renderIcon(BookIcon),
    },


    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'OneClickBot',
                    }
                },
                { default: () => 'One Click Bot  ' }
            ),
        key: 'OneClickBot',
        icon: renderIcon(StarOutline),
    },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'AiToolz',
                    }
                },
                { default: () => '🤖 AI Toolz' }
            ),
        key: 'AiToolz',
        icon: renderIcon(Analytics),
    },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'OpenOrdersDev',
                    }
                },
                { default: () => 'Open Orders' }
            ),
        key: 'OpenOrdersDev',
        icon: renderIcon(SearchOutline),
    },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'ClosedOrdersDev',
                    }
                },
                { default: () => 'Closed Orders' }
            ),
        key: 'ClosedOrdersDev',
        icon: renderIcon(BookIcon),
    },

    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'TickerBarPage',
                    }
                },
                { default: () => '📊 Ticker Bar' }
            ),
        key: 'TickerBarPage',
        icon: renderIcon(BarChart),
    },
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'BalanceSAVE',
                    }
                },
                { default: () => 'BalanceSAVE' }
            ),
        key: 'BalanceSAVE',
        icon: renderIcon(SearchOutline),
    },


    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'OrderListDuplicate',
                    }
                },
                { default: () => 'OrderListDuplicate' }
            ),
        key: 'OrderListDuplicate',
        icon: renderIcon(SearchOutline),
    },
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
    {
        label: () =>
            h(
                NuxtLink,
                {
                  to: {
                    name: 'ALL-STR',
                  }
                },
                { default: () => 'ALL-STR' }
            ),
        key: 'ALL-STR',
        icon: renderIcon(CafeOutline),
    },

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
        icon: renderIcon(SettingsOutline),
    },


 
 
    {
        label: () =>
            h(
                NuxtLink,
                {
                    to: {
                        name: 'Referrals',
                    }
                },
                { default: () => 'Referrals' }
            ),
        key: 'Referrals',
        icon: renderIcon(CameraOutline),
    },
    
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
    {
        label: () =>
            h(
                NuxtLink,
                {
                  to: {
                    name: 'back-testing',
                  }
                },
                { default: () => 'Back testing' }
            ),
        key: 'back-testing',
        icon: renderIcon(GitCompareOutline),
    }, 
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
/* ========== COMPACT NAVBAR ========== */
.header {
  height: 36px !important;
  padding: 0 12px !important;
  line-height: 36px !important;
}

.inner {
  height: 100%;
}

.app-title {
  font-size: 14px !important;
  font-weight: 900;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.compact-text {
  font-size: 9px !important;
  opacity: 0.7;
}

/* USER ID - CYAN */
.user-id-text {
  font-size: 10px !important;
  font-weight: 700 !important;
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* REFERRAL CODE - MAGENTA */
.referral-text {
  font-size: 10px !important;
  font-weight: 700 !important;
  color: #ff00ff !important;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
}

.profile-btn {
  padding: 2px 8px !important;
  height: 24px !important;
  font-size: 14px !important;
}

/* Footer also compact */
.footer {
  height: 32px !important;
  padding: 0 12px !important;
  line-height: 32px !important;
  font-size: 10px !important;
  opacity: 0.6;
}

/* Sidebar adjustment */
.sidebar {
  margin-top: 0 !important;
}

.container {
  height: calc(100vh - 68px) !important;
}

/* NAVBAR LEFT - LOGO + TICKER BAR */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* NAVBAR RIGHT - USER INFO */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

