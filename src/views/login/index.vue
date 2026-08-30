<template>
  <div class="login-container">
    <el-form
      ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ loginForm.appName }} Login</h3>
      </div>

      <el-form-item v-if="passwordFlow" prop="UserName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="UserName" v-model="loginForm.UserName" placeholder="User name or email" name="UserName"
          type="text" tabindex="1" auto-complete="on"
        />
      </el-form-item>

      <el-form-item v-if="passwordFlow" prop="Password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType" ref="Password" v-model="loginForm.Password" :type="passwordType"
          placeholder="Password" name="Password" tabindex="2" auto-complete="on" @keyup.enter="handleLogin()"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'Password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button
        v-if="passwordFlow" :loading="loading" type="primary" tabindex="3" style="width:100%;margin-bottom:30px;"
        @click.prevent="handleLogin()"
      >
        Sign In
      </el-button>

      <el-button
        :loading="loading" type="primary" tabindex="4" style="width:100%;margin-left:0;margin-bottom:30px;"
        @click.prevent="providerLogin()"
      >
        Sign in with SSO
      </el-button>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
import { ElMessage } from "element-plus";
import { getAuthConfig, startAuthorizationLogin, completeAuthorizationWithCode, webRedirectUri } from "@/utils/oidc";

export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error("Please enter the correct user name"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error("The Password can not be less than 5 digits"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        appName: window.VUE_APP_TITLE || "App Mesh",
        UserName: "",
        Password: "",
      },
      loginRules: {
        UserName: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        Password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      loading: false,
      passwordType: "Password",
      redirect: undefined,
      // auth/config: "password" flow is advertised only in builtin auth mode;
      // otherwise only the provider redirect (authorization code + PKCE) works.
      passwordFlow: false,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        const redirect = route.query && route.query.redirect;
        // Don't redirect back to error pages
        this.redirect = (redirect && !redirect.startsWith('/401') && !redirect.startsWith('/404')) ? redirect : '/';
      },
      immediate: true,
    },
  },
  mounted() {
    getAuthConfig().then((cfg) => {
      this.passwordFlow = (cfg?.flows || []).includes("password");
    }).catch(() => {
      ElMessage({
        message: "Failed to load the authentication configuration",
        type: "error",
        duration: 5000,
      });
    });
  },
  beforeUnmount() {
    window.removeEventListener("message", this.onOAuthMessage);
  },

  methods: {
    /**
     * Toggle password visibility
     */
    showPwd() {
      this.passwordType = this.passwordType === "Password" ? "" : "Password";
      this.$nextTick(() => this.$refs.Password.focus());
    },

    /**
     * Password-grant login through the Vuex action (which then loads the
     * principal). The forwarding target is temporarily cleared: authentication
     * always happens on the local node.
     * @returns {Promise<void>}
     */
    async handleLogin() {
      this.loading = true;
      const originalForwarding = this.$store.getters.forwarding;
      try {
        const valid = await this.$refs.loginForm.validate();
        if (!valid) {
          console.warn("Form validation failed");
          return;
        }
        await this.$store.dispatch("settings/changeSetting", {
          key: "forwarding",
          value: null
        });
        await this.$store.dispatch("user/login", this.loginForm);

        await this.restoreForwarding(originalForwarding);
        this.$router.push({ path: this.redirect || "/" });
      } catch (error) {
        ElMessage({
          message: error.message || 'Login failed',
          type: 'error',
          duration: 5000
        });
        await this.restoreForwarding(originalForwarding);
      } finally {
        this.loading = false;
      }
    },

    /**
     * OAuth login (authorization code + PKCE) in a popup window. The popup
     * relays the code back via postMessage; this window owns the PKCE verifier
     * and completes the exchange. Falls back to a full-page redirect when the
     * popup is blocked.
     */
    async providerLogin() {
      this.loading = true;
      try {
        const mode = await startAuthorizationLogin({ popup: true });
        if (mode !== "popup") return; // full-page redirect in progress
        window.addEventListener("message", this.onOAuthMessage);
      } catch (error) {
        this.loading = false;
        ElMessage({
          message: error.message || 'Login failed',
          type: 'error',
          duration: 5000
        });
      }
    },

    /**
     * Receive the authorization code from the login popup and finish login.
     * @param {MessageEvent} event
     */
    async onOAuthMessage(event) {
      if (event.data?.type !== "appmesh-oauth") return;
      // The popup lands on the registered redirect entry, which may be another
      // origin than this UI.
      const cfg = await getAuthConfig();
      if (event.origin !== new URL(webRedirectUri(cfg)).origin) return;
      window.removeEventListener("message", this.onOAuthMessage);
      try {
        await completeAuthorizationWithCode(event.data.code, event.data.state);
        await this.$store.dispatch("user/handleLoginSuccess");
        this.$router.push({ path: this.redirect || "/" });
      } catch (error) {
        this.loading = false;
        ElMessage({
          message: error.message || 'Login failed',
          type: 'error',
          duration: 5000
        });
      }
    },

    /**
     * Restore forwarding settings
     * @param {string} originalForwarding - Original forwarding setting
     */
    async restoreForwarding(originalForwarding) {
      await this.$store.dispatch("settings/changeSetting", {
        key: "forwarding",
        value: originalForwarding
      });
    }
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input__inner {
    color: $cursor;
  }
}

/* reset element-plus css */
.login-container {

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;

    .el-form-item__content {
      display: flex;
      align-items: center;
    }
  }

  .el-input {
    display: inline-block;
    height: 47px;
    flex: 1;

    .el-input__wrapper {
      background: transparent;
      box-shadow: none !important;
      border-radius: 0px;
      padding: 0;
      height: 47px;
    }

    .el-input__inner {
      background: transparent;
      border: 0px;
      appearance: none;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
