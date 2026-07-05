<template>
  <div class="error-page">
    <div class="error-code">404</div>
    <div class="error-title">Page not found</div>
    <div class="error-desc">
      The page you are looking for doesn't exist or has been moved.
    </div>
    <el-button type="primary" @click="$router.push('/home')">Back to Home</el-button>
  </div>
</template>

<script>
export default {
  name: "Page404",
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
  color: #409eff;
}

.error-title {
  margin-top: 16px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.error-desc {
  margin: 8px 0 24px;
  font-size: 14px;
  color: #909399;
}
</style>
