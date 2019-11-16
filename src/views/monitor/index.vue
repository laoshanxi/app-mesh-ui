<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> Monitor</span>

        <el-row class="detail-card">
          <el-col span="1" style="text-align: right; padding-top: 20px;"><i :class="btnIcon" style="cursor: pointer;" :title="button" @click="expandJson()"></i></el-col>
          <el-col span="23">
            <el-row v-show="showExpand">
              <json-viewer :value="resources" :expand-depth="1"></json-viewer>
            </el-row>
            <el-row v-show="showCollapse">
              <json-viewer :value="resources" :expand-depth="10"></json-viewer>
            </el-row>
          </el-col>
        </el-row>


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
      showExpand:true,
      showCollapse:false,
      button:"Expand",
      btnIcon: "el-icon-circle-plus-outline"
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
      let tmpJson = this.resources;
      if(this.showExpand){
        this.resources = "";
        this.showExpand = false;
        this.showCollapse = true;
        this.button = "Collapse";
        this.resources = tmpJson;
        this.btnIcon = "el-icon-remove-outline";
      }else{
        this.resources = "";
        this.showExpand = true;
        this.showCollapse = false;
        this.button = "Expand";
        this.resources = tmpJson;
        this.btnIcon = "el-icon-circle-plus-outline"
      }
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.detail-card{
    height: calc(100vh - 162px) !important;
    overflow-y: auto;
}
</style>
