<template>
  <el-card class="box-card">
    <pre>{{loginfo ? loginfo : 'No log'}}</pre>
  </el-card>
</template>

<script>
export default {
  name:"AppLog",
  props:[
    "loginfo"
  ],
  mounted(){
  },
  methods:{
  }
}
</script>

<style>
</style>
