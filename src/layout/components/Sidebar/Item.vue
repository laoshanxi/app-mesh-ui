<template>
  <!-- Fragment: svg-icon and span are direct children of el-menu-item -->
  <svg-icon v-if="icon" :icon-class="icon" />
  <span v-if="title">{{ title }}</span>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
