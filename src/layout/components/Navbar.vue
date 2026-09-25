<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-button
        :icon="Refresh" text :loading="loading" title="Refresh"
        @click="refresh()"
      />

      <el-tooltip content="Request Forwarding (port defaults to 6059)" placement="bottom">
        <el-input
          v-model="forward"
          size="small"
          class="forward-input"
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
            <span>User</span>
          </el-avatar>
          <span class="UserName-avatar">{{ name }}</span>
          <el-icon class="arrow-down"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/security/principals">
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
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { getClient } from '@/utils/appmeshClient'
import EventBus from '@/utils/event.bus.js'
import { EVENTS } from '@/utils/constants.js'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ArrowDown
  },
  data() {
    return {
      Refresh: markRaw(Refresh),
      restaurants: [],
      forward: "",
      lastForward: "",
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
    ])
  },
  created() {
    this.forward = this.$store.getters.forwarding;
    this.forwardEnabled = !!this.forward;
    this.restaurants = this.$store.getters.apiUrls ? this.$store.getters.apiUrls : [];
    EventBus.on(EVENTS.SWITCH_FORWARD, (fw) => {
      this.lastForward = this.forward;
      this.forward = fw;
      this.updateForward();
    });
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
        await client.get_current_principal();
        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: this.forward
        });

        this.forwardEnabled = true;
        ElMessage.success('Forward request successful');
        this.refresh();

      } catch (error) {
        // Undo the unverified forwarding target on the shared client
        client.forwardingHost = previousForwardingHost;
        if (error === 'cancel') { // element-plus rejects user cancel/close with exactly 'cancel'
          throw 'cancel';
        }
        if (this.lastForward?.length > 0) {
          this.forward = this.lastForward;
        }
        ElMessage.error(`Failed to forward request: ${error.message || error}`);
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

        this.lastForward = this.forward;
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

    querySearch(queryString, callback) {
      const results = queryString
        ? this.restaurants.filter(item => this.createFilter(queryString)(item))
        : this.restaurants;
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
    width: 200px;
    margin-right: 12px;
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
