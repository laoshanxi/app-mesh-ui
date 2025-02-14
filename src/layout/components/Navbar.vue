<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-button
        icon="el-icon-refresh" type="text" acti :loading="loading" title="Refresh"
        style="margin-right:10px;font-size:18px;font-weight: bold !important;" @click="refresh()"
      >
      </el-button>

      <el-switch v-model="forwardEnabled" active-text="Forward to:" inactive-text="" @change="handleSwitchChange" />
      <el-autocomplete
        v-model="forward" class="inline-input" style="width:140px"
        :fetch-suggestions="querySearch"
      ></el-autocomplete>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <!-- <div><img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"><span class="UserName-avatar">{{name}}</span></div> -->
          <div>
            <el-avatar shape="circle" :size="40" :src="avatar">
              <i class="el-icon-s-custom" />
            </el-avatar>
            <span class="UserName-avatar">{{ name }}</span>
          </div>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/security/changePwd">
            <el-dropdown-item>
              <i class="iconfont icon-lock"></i>Change Password
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="/ui/dc1/kv">
            <el-dropdown-item>
              <i class="el-icon-mobile-phone"></i>Consul
            </el-dropdown-item>
          </a>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">
              <i class="iconfont icon-log-out"></i>Log Out
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import request from '@/utils/request'
import EventBus from '@/utils/event.bus.js'
import { EVENTS } from '@/utils/constants.js'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      restaurants: [],
      forward: "",
      lastForward: "",
      forwardEnabled: false,
      fullscreenLoading: false
    };
  },
  created() {
    this.forward = this.$store.getters.forwarding;
    this.forwardEnabled = !!this.forward;
    this.restaurants = this.$store.getters.apiUrls ? this.$store.getters.apiUrls : [];
    EventBus.$on(EVENTS.SWITCH_FORWARD, (fw) => {
      this.lastForward = this.forward;
      this.forward = fw;
      this.updateForward();
    });
  },
  mounted() {
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'auth',
      'forwarding',
      'loading'
    ])
  },
  methods: {
    /**
     * Refresh current page
     */
    refresh() {
      this.$router.replace({
        path: '/refresh',
        query: { t: Date.now() }
      });
    },

    /**
     * Enable request forwarding to specified target
     * @returns {Promise<void>}
     */
    async enableForward() {
      this.forward = this.forward.trim();
      if (!this.forward) {
        throw new Error('Forward target cannot be empty');
      }

      try {
        await this.$confirm(
          `Forward requests to [${this.forward}]?`,
          'Confirm',
          {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          }
        );

        this.fullscreenLoading = true;
        const response = await request({
          url: '/appmesh/auth',
          method: 'post',
          headers: { 'X-Target-Host': this.forward }
        });

        if (response.status !== 200) {
          throw new Error(response.data);
        }

        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: this.forward
        });

        this.forwardEnabled = true;
        this.$message.success('Forward request successful');
        this.refresh();
      } catch (error) {
        if (error === 'cancel' || error.toString().includes('cancel')) {
          throw 'cancel';
        }
        if (this.lastForward?.length > 0) {
          this.forward = this.lastForward;
        }
        throw error;
      } finally {
        this.fullscreenLoading = false;
      }
    },

    /**
     * Disable request forwarding
     * @returns {Promise<void>}
     */
    async disableForward() {
      try {
        await this.$confirm(
          'Disable request forwarding?',
          'Confirm',
          {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          }
        );

        this.fullscreenLoading = true;
        const response = await request({
          url: '/appmesh/auth',
          method: 'post',
          headers: { 'X-Target-Host': '' }
        });

        if (response.status !== 200) {
          throw new Error(response.data);
        }

        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: ''
        });

        this.lastForward = this.forward;
        this.forward = '';
        this.forwardEnabled = false;
        this.$message.success('Disable forward successful');
        this.refresh();
      } catch (error) {
        if (error === 'cancel' || error.toString().includes('cancel')) {
          throw 'cancel';
        }
        throw error;
      } finally {
        this.fullscreenLoading = false;
      }
    },

    /**
     * Query suggestion list
     * @param {string} queryString - Query string
     * @param {Function} callback - Callback function
     */
    querySearch(queryString, callback) {
      const results = queryString
        ? this.restaurants.filter(item => this.createFilter(queryString)(item))
        : this.restaurants;
      callback(results);
    },

    /**
     * Create filter function
     * @param {string} queryString - Query string
     * @returns {Function} Filter function
     */
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

        if (error === 'cancel' || error.toString().includes('cancel')) {
          // do nothing for cancled
        } else {
          this.$message.error(`Failed to forward request: ${error.message || error}`);
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

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

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
        margin-top: 0px;
        position: relative;
        cursor: pointer;
        height: 42px;

        .user-avatar {
          vertical-align: middle;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .UserName-avatar {
          margin-left: 5px;
          top: -15px;
          position: relative;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 15px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
