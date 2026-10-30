<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-button
        :icon="Refresh" text :loading="loading" title="Refresh"
        @click="refresh()"
      />

      <el-tooltip :content="forwardHint" placement="bottom">
        <el-input
          v-model="forward"
          size="small"
          class="forward-input"
          :class="{ 'forward-idle': forwardIdle }"
          placeholder="Forward to host"
          clearable
          list="forward-suggestions"
        >
          <template #append>
            <el-switch v-model="forwardEnabled" size="small" @change="handleSwitchChange" />
          </template>
        </el-input>
      </el-tooltip>
      <datalist id="forward-suggestions">
        <option v-for="item in restaurants" :key="item.value" :value="item.value" />
      </datalist>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar shape="circle" :size="30" :src="avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="UserName-avatar">{{ name }}</span>
          <el-icon class="arrow-down"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link v-if="$hasPermission(['principal-list', 'role-view', 'principal-set'])" :to="securityPath">
              <el-dropdown-item>
                <i class="iconfont icon-lock"></i>Security
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item divided>
              <span style="display:block;" @click="logout">
                <i class="iconfont icon-log-out"></i>Log Out
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { markRaw } from 'vue'
import { Refresh, ArrowDown, User } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { getClient } from '@/utils/appmeshClient'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ArrowDown,
    User
  },
  data() {
    return {
      Refresh: markRaw(Refresh),
      restaurants: [],
      forward: "",
      forwardEnabled: false,
      fullscreenLoading: false
    };
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'forwarding',
      'loading'
    ]),
    securityPath() {
      if (this.$hasPermission('principal-list')) return '/security/principals';
      if (this.$hasPermission('role-view')) return '/security/roles';
      return '/security/users';
    },
    // A typed target with the switch off looks armed but requests stay local;
    // the amber border and hint say forwarding is inactive.
    forwardIdle() {
      return !!this.forward.trim() && !this.forwardEnabled;
    },
    forwardHint() {
      return this.forwardIdle
        ? 'Not forwarding — requests go to this node. Toggle the switch to forward.'
        : 'Request Forwarding (port defaults to 6059)';
    }
  },
  created() {
    this.forward = this.$store.getters.forwarding;
    this.forwardEnabled = !!this.forward;
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("appmesh-forward-history") || "[]");
    } catch (e) {
      // corrupted history is dropped
    }
    this.restaurants = this.mergeSuggestions(history);
  },
  methods: {
    refresh() {
      this.$router.replace({
        path: '/refresh',
        query: { t: Date.now() }
      });
    },

    async enableForward() {
      this.forward = this.forward.trim();
      if (!this.forward) {
        throw new Error('Forward target cannot be empty');
      }
      // No port -> the SDK appends base port 6060 (TCP-msgpack, unforwardable); 6059 is the TCP API port.
      if (!this.forward.includes(":")) {
        this.forward = `${this.forward}:6059`;
      }

      const client = getClient();
      const previousForwardingHost = client.forwardingHost;

      try {
        await ElMessageBox.confirm(
          `Forward requests to [${this.forward}]?`,
          'Confirm',
          {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          }
        );

        this.fullscreenLoading = true;

        client.forwardingHost = this.forward;
        // Probe: the bearer is forwarded unchanged; the target re-validates it against the same issuer.
        await client.getCurrentPrincipal();
        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: this.forward
        });

        this.forwardEnabled = true;
        this.rememberForwardTarget(this.forward);
        ElMessage.success('Forward request successful');
        this.refresh();

      } catch (error) {
        // Undo the unverified forwarding target on the shared client
        client.forwardingHost = previousForwardingHost;
        // Propagate so the switch handler resets the toggle; it owns the toast.
        throw error;
      } finally {
        this.fullscreenLoading = false;
      }
    },

    async disableForward() {
      try {
        await ElMessageBox.confirm(
          'Disable request forwarding?',
          'Confirm',
          {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          }
        );

        this.fullscreenLoading = true;
        getClient().forwardingHost = null;

        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: ''
        });

        // The remount from refresh() re-reads the cleared store, and the
        // datalist (apiUrls) keeps the target one click away.
        this.forward = '';
        this.forwardEnabled = false;
        ElMessage.success('Disable forward successful');
        this.refresh();
      } catch (error) {
        if (error === 'cancel') { // element-plus rejects user cancel/close with exactly 'cancel'
          throw 'cancel';
        }
        throw error;
      } finally {
        this.fullscreenLoading = false;
      }
    },

    // The cluster has no node-registry API yet; remembered targets keep repeat
    // forwards one click away until one exists.
    rememberForwardTarget(target) {
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem("appmesh-forward-history") || "[]");
      } catch (e) {
        // corrupted history is dropped
      }
      history = [target, ...history.filter((item) => item !== target)].slice(0, 8);
      try {
        localStorage.setItem("appmesh-forward-history", JSON.stringify(history));
      } catch (e) {
        // storage unavailable (private mode): suggestions just stay static
      }
      this.restaurants = this.mergeSuggestions(history);
    },
    mergeSuggestions(history) {
      const urls = this.$store.getters.apiUrls || [];
      const seen = new Set();
      const merged = [];
      for (const item of [...history.map((value) => ({ value })), ...urls]) {
        if (item.value && !seen.has(item.value)) {
          seen.add(item.value);
          merged.push(item);
        }
      }
      return merged;
    },

    querySearch(queryString, callback) {
      const results = queryString
        ? this.restaurants.filter(item => this.createFilter(queryString)(item))        : this.restaurants;
      callback(results);
    },

    createFilter(queryString) {
      return (restaurant) => {
        return restaurant?.value?.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async handleSwitchChange(value) {
      const oldForward = this.forward;

      try {
        if (!value) {
          await this.disableForward();
        } else {
          if (oldForward) {
            this.forward = oldForward;
          }
          await this.enableForward();
        }
      } catch (error) {
        this.forward = oldForward;
        this.forwardEnabled = !this.forwardEnabled

        if (error === 'cancel') { // element-plus rejects user cancel/close with exactly 'cancel'
          // user cancelled — ignore
        } else {
          ElMessage.error(`Failed to forward request: ${error.message || error}`);
        }
      }
    }
  }
}
</script>
<style>
.el-button--text {
  color: #606266;
}
</style>
<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .forward-input {
    width: 260px;
    margin-right: 12px;

    &.forward-idle :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-warning) inset;
    }
  }

  .right-menu {
    float: right;
    height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;
      vertical-align: middle;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        height: 50px;

        .UserName-avatar {
          white-space: nowrap;
        }

        .arrow-down {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
