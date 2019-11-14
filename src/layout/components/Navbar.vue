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
      <el-button type="warning" icon="el-icon-sort" @click="switchHost()">Switch</el-button>
      <el-button icon="el-icon-refresh" @click="refresh()">Refresh</el-button>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <div><img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"><span class="username-avatar">{{name}}</span></div>

          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              Home
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/laoshanxi/app-manager">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://github.com/laoshanxi/app-manager/blob/master/README.md">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">Log Out</span>
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

export default {
  data(){
    return {
      restaurants:[{
        value:"https://localhost:6060"
      }],
      host:"https://localhost:6060"
    };
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  created() {
    this.host = this.$store.getters.baseUrl;
    this.restaurants = this.$store.getters.apiUrls ? this.$store.getters.apiUrls : [];
  },
  mounted(){
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'auth',
      'baseUrl'
    ])
  },
  methods: {
    refresh () {
      this.$router.replace({
        path: '/refresh',
        query: {
          t: Date.now()
        }
      });
    },
    logonWithNewHost(){
      this.$store.dispatch('user/login', {username:this.name, password:this.auth}).then(() => {
        Message({
          message: 'Switch host to ' + this.host,
          type: 'success',
          duration: 5 * 1000
        });
        this.refresh();
      }).catch(() => {

      })
    },
    switchHost(){
      this.$store.dispatch("settings/changeSetting", {key:"baseUrl", value:this.host}).then(() => {
        this.logonWithNewHost();
      }).catch(() => {
        //this.loading = false
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

      .avatar-wrapper {
        margin-top: 0px;
        position: relative;
        cursor: pointer;

        .user-avatar {
          vertical-align: middle;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .username-avatar {
          margin-left: 5px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 18px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
