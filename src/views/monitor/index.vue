<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> Monitor</span>
        <json-viewer :value="resources"></json-viewer>
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
      resources:'No Data'
    }
  },
  mounted(){
    getResources().then((res)=>{
      this.resources = res.data;
    }, (res)=>{

    });
  },
  methods: {

  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
