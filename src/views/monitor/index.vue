<template>
  <div class="app-container">
    <el-tabs type="border-card">

      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> Monitor</span>
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

        <el-row class="detail-card">
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
import detail from './detail'
import G2 from '@antv/g2';

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
    // this.drawChart();
    // this.monitor();
  },
  methods: {
    initData(){
      getResources().then((res)=>{
        this.resources = res.data;
        this.memoryData.push({
          time: this.resources.systime.substring(11),
          memory: (this.resources.mem_applications/1024).toFixed(0)
        });
      }, (res)=>{

      });
    },
    monitor(){
      this.timer = setInterval(()=>{
        getResources().then((res)=>{
          this.resources = res.data;
          if(this.memoryData.length>40){
            this.memoryData.shift();
          }
          this.memoryData.push({
            time: this.resources.systime.substring(11),
            memory: (this.resources.mem_applications/1024).toFixed(0)
          });
          this.memoryChart.source(this.memoryData);
          this.memoryChart.render();
        }, (res)=>{

        });
      }, 1000);
    },
    destroyed(){
      if(this.timer){
        clearInterval(this.timer);
      }
    },
    drawChart(){
      this.memoryChart = new G2.Chart({
        container: 'memory',
        width: "1200",
        height: 400,
        animate: false
      });
      this.memoryChart.source(this.memoryData);
      // Step 3：创建图形语法，绘制柱状图，由 time 和 memory 两个属性决定图形位置，time 映射至 x 轴，memory 映射至 y 轴
      this.memoryChart.line().position('time*memory');
      this.memoryChart.area().position('time*memory');
      // Step 4: 渲染图表
      this.memoryChart.render();
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
.detail-card{
    height: calc(100vh - 162px) !important;
    overflow-y: auto;
}
</style>
