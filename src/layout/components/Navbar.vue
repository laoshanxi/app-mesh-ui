<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <span>Host:</span>
      <el-autocomplete
	        class="inline-input"
          style="width:300px"
	        v-model="host"
	        :fetch-suggestions="querySearch"
	      ></el-autocomplete>
      <el-button type="warning" icon="el-icon-sort" @click="switchHost()" v-loading.fullscreen.lock="fullscreenLoading">Switch</el-button>
      <el-button icon="el-icon-refresh"
          @click="refresh()"
          type="text"

          :loading="loading"
          title="Refresh"
          style="margin-right:10px;font-size:18px;font-weight: bold !important;">
      </el-button>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <!-- <div><img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"><span class="UserName-avatar">{{name}}</span></div> -->
          <div>
            <el-avatar shape="circle" :size="40" :src="avatar">
              <i class="el-icon-s-custom"/>
            </el-avatar>
            <span class="UserName-avatar">{{name}}</span>
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
import { MessageBox, Message } from 'element-ui'
import request from '@/utils/request'
import EventBus from '@/utils/event.bus.js'
import {EVENTS} from '@/utils/constants.js'

export default {
  data(){
    return {
      restaurants:[],
      host:"",
      lastHost:"",
      fullscreenLoading: false
    };
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  created() {
    this.host = this.$store.getters.baseUrl;
    this.restaurants = this.$store.getters.apiUrls ? this.$store.getters.apiUrls : [];
    EventBus.$on(EVENTS.SWITCH_HOST, (host)=>{
      this.lastHost = this.host;
      this.host = host;
      this.switchHost();
    });
  },
  mounted(){
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'auth',
      'baseUrl',
      'loading'
    ])
  },
  methods: {
    certifedHost(callback){
      request({
        url: this.host,
        timeout: 3000,
        method: 'GET'
      }).then((res)=>{
        console.info("Certified");
        callback ? callback() : '';
      }, (res)=>{
        this.fullscreenLoading = false;
        window.open(this.host);
      });
    },
    refresh () {
      this.$router.replace({
        path: '/refresh',
        query: {
          t: Date.now()
        }
      });
    },
    gotoApplication(){
      this.$router.replace({
        path: '/applications/index',
        query: {
          t: Date.now()
        }
      });
    },
    logonWithNewHost(){
      this.$store.dispatch('user/login', {UserName:this.name, Password:this.auth}).then(() => {
        Message({
          message: 'Switch host to ' + this.host,
          type: 'success',
          duration: 5 * 1000
        });
        this.fullscreenLoading = false;
        this.gotoApplication();
      }).catch(() => {
        this.fullscreenLoading = false;
      })
    },
    switchHost(){
      this.$confirm(`Do you want to switch host to <${this.host}>?`, 'Tooltip', {
	      confirmButtonText: 'Confirm',
	      cancelButtonText: 'Cancel',
	      type: 'warning'
	    }).then(() => {
        this.fullscreenLoading = true;
	      this.certifedHost(()=>{
	        this.$store.dispatch("settings/changeSetting", { key: "baseUrl", value: this.host }).then(() => {
            this.logonWithNewHost();
          }).catch(() => {
            this.fullscreenLoading = false;
          });
        });
      }).catch(()=>{
        if(this.lastHost && this.lastHost.length>0){
          this.host = this.lastHost;
        }
      });
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
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
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

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
