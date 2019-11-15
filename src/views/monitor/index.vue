<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> Monitor</span>
        <i class="el-icon-circle-plus" @click="expandJson()"></i>
        <json-viewer :value="resources" :expand-depth="expand"></json-viewer>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {getResources} from '@/api/resources'

export default {
  data() {
    return {
      activeNames:[],
      resources:'No Data',
      expand:1
    }
  },
  mounted(){
    getResources().then((res)=>{
      this.resources = res.data;
    }, (res)=>{

    });
  },
  methods: {
    expandJson(){
      this.expand = 10;
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
