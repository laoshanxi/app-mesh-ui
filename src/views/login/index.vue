<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">App Mesh Login</h3>
      </div>

      <el-form-item prop="UserName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="UserName"
          v-model="loginForm.UserName"
          placeholder="Username"
          name="UserName"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="Password">
        <span class="svg-container">
          <svg-icon icon-class="Password" />
        </span>
        <el-input
          :key="passwordType"
          ref="Password"
          v-model="loginForm.Password"
          :type="passwordType"
          placeholder="Password"
          name="Password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="switchHost"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'Password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="switchHost"
      >Login</el-button>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
import request from "@/utils/request";

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
        UserName: "",
        Password: "",
        host: window.location.origin,
      },
      restaurants: [
        {
          value: window.location.origin,
        },
      ],
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
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.loginForm.host = this.$store.getters.baseUrl
      ? this.$store.getters.baseUrl
      : window.location.origin;
    this.restaurants = this.$store.getters.apiUrls
      ? this.$store.getters.apiUrls
      : [];
  },

  methods: {
    switchHost() {
      this.loading = true;
      this.$store
        .dispatch("settings/changeSetting", {
          key: "baseUrl",
          value: this.loginForm.host,
        })
        .then(() => {
          this.handleLogin();
        })
        .catch(() => {
          this.loading = false;
        });
    },
    showPwd() {
      if (this.passwordType === "Password") {
        this.passwordType = "";
      } else {
        this.passwordType = "Password";
      }
      this.$nextTick(() => {
        this.$refs.Password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
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
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input,
  .el-autocomplete {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
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

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
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
