<template>
  <!-- A failed fetch is not an empty result: say so and offer the retry. -->
  <el-empty v-if="error" :image-size="60" description="Failed to load data">
    <el-button size="small" type="primary" :icon="Refresh" @click="$emit('retry')">Retry</el-button>
  </el-empty>
  <el-empty v-else :image-size="60" description="No Data" />
</template>

<script>
import { markRaw } from "vue";
import { Refresh } from "@element-plus/icons-vue";

// Shared #empty slot for list tables: distinguishes a load error (retryable)
// from a genuinely empty list, which used to look identical ("No Data").
export default {
  name: "ListEmpty",
  props: {
    error: { type: Boolean, default: false }
  },
  emits: ["retry"],
  data() {
    return { Refresh: markRaw(Refresh) };
  }
};
</script>
