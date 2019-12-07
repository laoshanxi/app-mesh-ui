<template>
  <div class="app-container">
    <el-tabs type="border-card">

      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> Host</span>
        <el-row>
          <el-col :span="24" style="padding: 10px;">
            <detail :record="resources"/>
          </el-col>
        </el-row>
        <!-- <el-row class="detail-card">
          <el-col :span="24">
            <div id="memory"></div>
          </el-col>
        </el-row> -->


      </el-tab-pane>

      <el-tab-pane>
        <span slot="label"><i class="el-icon-document"></i> Json</span>

        <el-row>
          <el-col :span="1" style="text-align: right; padding-top: 20px;"><i :class="btnIcon" style="cursor: pointer;" :title="button" @click="expandJson()"></i></el-col>
          <el-col :span="23">
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
import {getResources} from '@/api/resources';
import hostService from '@/services/host'
import detail from './detail'

export default {
  components:{
    detail
  },
  data() {
    return {
      activeNames:[],
      resources:'No Data',
      showExpand:true,
      showCollapse:false,
      button:"Expand",
      btnIcon: "el-icon-circle-plus-outline",
      timer:null,
      memoryChart: null,
      memoryData:[]
    }
  },
  mounted(){
    this.initData();
    // this.monitor();
  },
  methods: {
    initData(){
      hostService.getResources(this);
    },
    monitor(){
      hostService.drawChart(this);
      this.timer = setInterval(()=>{
        hostService.getResourcesForChart(this);
      }, 1000);
    },
    destroyed(){
      if(this.timer){
        clearInterval(this.timer);
      }
    },
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
</style>
