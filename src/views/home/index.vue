<template>
  <div class="home-container">
    <div class="welcome-section">
      <img src="@/icons/svg/logo.svg" class="home-logo" />
      <h1 class="home-title">Welcome to App Mesh</h1>
      <p class="home-subtitle">Cloud-native application management platform</p>
    </div>

    <el-row :gutter="20" class="info-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="application" class-name="card-icon" />
              <span>Applications</span>
            </div>
          </template>
          <p>Manage, monitor, and schedule your applications with ease.</p>
          <router-link to="/applications/index">
            <el-button type="primary" text>Go to Applications &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="host" class-name="card-icon" />
              <span>Host</span>
            </div>
          </template>
          <p>View system resources, CPU, memory, disk, and network status.</p>
          <router-link to="/host/index">
            <el-button type="primary" text>Go to Host &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="shell" class-name="card-icon" />
              <span>WebShell</span>
            </div>
          </template>
          <p>Execute commands remotely through the integrated web terminal.</p>
          <router-link to="/shell/index">
            <el-button type="primary" text>Go to Shell &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="info-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="security" class-name="card-icon" />
              <span>Security</span>
            </div>
          </template>
          <p>Manage users, roles, permissions, and two-factor authentication.</p>
          <router-link to="/security/changePwd">
            <el-button type="primary" text>Go to Security &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="files" class-name="card-icon" />
              <span>Files</span>
            </div>
          </template>
          <p>Upload and download files through the App Mesh file service.</p>
          <router-link to="/files/index">
            <el-button type="primary" text>Go to Files &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <svg-icon icon-class="config" class-name="card-icon" />
              <span>Configuration</span>
            </div>
          </template>
          <p>View and update App Mesh server configuration and labels.</p>
          <router-link to="/config/index">
            <el-button type="primary" text>Go to Config &rarr;</el-button>
          </router-link>
        </el-card>
      </el-col>
    </el-row>

    <div class="footer-info">
      <p>Logged in as <strong>{{ name }}</strong></p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters(["name"]),
  },
};
</script>

<style scoped>
.home-container {
  padding: 30px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.home-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.home-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.home-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.info-cards {
  margin-bottom: 20px;
}

.info-card {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.info-card p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.footer-info {
  text-align: center;
  margin-top: 30px;
  color: #909399;
  font-size: 14px;
}
</style>

<style>
.card-icon {
  width: 20px !important;
  height: 20px !important;
  margin-right: 8px;
  color: #409EFF;
}
</style>
