<template>
  <el-card class="box-card" v-if="loginfo">
    <pre>{{loginfo}}</pre>
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
