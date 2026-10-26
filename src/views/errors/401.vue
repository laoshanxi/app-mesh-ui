<template>
  <div class="error-page">
    <div class="error-code">401</div>
    <div class="error-title">Access denied</div>
    <div class="error-desc">
      You don't have permission to view this page. Contact your administrator if
      you believe this is a mistake.
    </div>
    <div v-if="noRoles" class="error-desc">
      Your account has no roles assigned. On a new installation, the first
      administrator claims the admin role by signing in once from the node CLI:
      <code>appm logon --username admin@appmesh.local</code>
    </div>
    <div class="error-actions">
      <el-button @click="back">Back</el-button>
      <el-button type="primary" @click="$router.push('/home')">Home</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Page401",
  computed: {
    // Zero permissions separates an unenrolled account from a merely denied page.
    noRoles() {
      const permissions = this.$store.getters.user?.permissions;
      return Array.isArray(permissions) && permissions.length === 0;
    },
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: "/home" });
      } else {
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.error-code {
  font-size: 96px;
  font-weight: 700;
  line-height: 1;
  color: #e6a23c;
}

.error-title {
  margin-top: 16px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.error-desc {
  max-width: 420px;
  margin: 8px 0 24px;
  font-size: 14px;
  color: #909399;
}

.error-actions {
  display: flex;
  gap: 12px;
}
</style>
