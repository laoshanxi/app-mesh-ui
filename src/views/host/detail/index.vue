<template>
  <div class="box-card" v-if="record!='No Data'">
    <DescriptionList title="Host" col="8">
      <Description term="Host name">{{record.host_name | formatEmpty}}</Description>
      <Description term="Date time">{{record.systime | formatEmpty}}</Description>
      <Description term="Description">{{record.host_description | formatEmpty}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="8">
      <Description term="1 minutes Load">{{record.load["1min"] | formatEmpty}}</Description>
      <Description term="5 minutes Load">{{record.load["5min"] | formatEmpty}}</Description>
      <Description term="15 minutes Load">{{record.load["15min"] | formatEmpty}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="CPU & Memory" col="8">
      <Description term="Processors">{{record.cpu_processors | formatEmpty}}</Description>
      <Description term="CPU cores">{{record.cpu_cores | formatEmpty}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24">
      <Description term="Memory">
        <div style="margin-left: 39px;">
          <div class="chart-label-left">free {{record.mem_free_bytes | formatMemory}}</div>
          <div class="chart-div">
            <el-progress :text-inside="true" :stroke-width="25"
              :percentage="parseFloat(((record.mem_total_bytes - record.mem_free_bytes)/record.mem_total_bytes * 100).toFixed(2))"
              status="exception">
            </el-progress>
          </div>
          <div class="chart-label">total {{record.mem_total_bytes | formatMemory}}</div>
        </div>
      </Description>
      <Description term="Swap memory">
        <el-row>
          <div class="chart-label-left">free {{record.mem_freeSwap_bytes | formatMemory}}</div>
          <div class="chart-div">
            <el-progress :text-inside="true" :stroke-width="25"
              :percentage="parseFloat(((record.mem_totalSwap_bytes - record.mem_freeSwap_bytes)/record.mem_totalSwap_bytes * 100).toFixed(2))"
              status="exception">
            </el-progress>
          </div>
          <div class="chart-label">total {{record.mem_totalSwap_bytes | formatMemory}}</div>
        </el-row>
      </Description>
      <Description term="Total app memory">{{record.mem_applications | formatMemory}}</Description>

    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Disk" col="24" style="margin-bottom: 20px;">
      <el-table
        :key="1"
        :data="record.fs"
        border
        :default-sort="{prop:'device'}"
        style="width: 100%"
        highlight-current-row
      >

        <el-table-column label="Device" prop="device">
          <template slot-scope="scope">
            <i class="el-icon-warning" style="color: firebrick;font-size: 18px; vertical-align: middle;" v-if="formatPercent(scope.row.usage)"></i>
            {{ scope.row.device | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column label="Size" width="140">
          <template slot-scope="scope">
            {{ scope.row.size | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Used" width="140">
          <template slot-scope="scope">
            {{ scope.row.used | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Usage" width="200">
          <template slot-scope="scope">
            <el-progress :text-inside="true" :stroke-width="25"
              :percentage="parseFloat((scope.row.usage * 100).toFixed(2))"
              status="exception">
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column label="Mount point">
          <template slot-scope="scope">
            {{ scope.row.mount_point | formatEmpty }}
          </template>
        </el-table-column>
      </el-table>
    </DescriptionList>
    <DescriptionList title="Network" col="24">
      <el-table
        :key="2"
        :data="record.net"
        :default-sort="{prop:'name'}"
        border
        style="width: 100%"
        highlight-current-row
      >

        <el-table-column label="Name" width="240" prop="name">
          <template slot-scope="scope">
            {{ scope.row.name | formatEmpty }}
          </template>
        </el-table-column>

        <el-table-column label="Protocol" width="100" prop="protocol">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ipv4" :type="'success'">
              IPv4
            </el-tag>
            <el-tag v-else :type="'info'">
              IPv6
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Address" prop="address">
          <template slot-scope="scope">
            {{ scope.row.address | formatEmpty }}
          </template>
        </el-table-column>
      </el-table>
    </DescriptionList>
  </div>
</template>

<script>
import DescriptionList from "@/components/Descriptions";
import Description from "@/components/Description";

export default {
  name:"Detail",
  props:[
    "record"
  ],
  components:{
    DescriptionList,
    Description
  },
  data(){
    return {
      data:[{
        term:"Name",
        detail:"app"
      }]
    }
  },
  mounted(){
  },
  methods:{
    createChart(p){
      console.info(p);
    },
    formatPercent(data){
      return data > 0.85;
    },
    formatSwapMemUsageData(){
      let data = this.record;
      return [{
        key:'Usage',
        label:'Used',
        value:data.mem_totalSwap_bytes - data.mem_freeSwap_bytes,
      },{
        key:'Usage',
        label:'Free',
        value: data.mem_freeSwap_bytes,
      }];
    },
    formatMemUsageData(){
      let data = this.record;
      return [{
        key:'Usage',
        label:'Used',
        value:data.mem_total_bytes - data.mem_free_bytes,
      },{
        key:'Usage',
        label:'Free',
        value: data.mem_free_bytes,
      }];
    },
    formatUsageData(data){
      return [{
        key:'Usage',
        label:'Used',
        value:data.used,
      },{
        key:'Usage',
        label:'Unused',
        value:data.size-data.used,
      }];
    },
  }
}
</script>

<style>
.detail {
  vertical-align: middle;
}
.detail > div > div {
  height:30px;
}
.chart-div {
  display: inline-block;
  width: 300px;
}
.chart-label {
  display: inline-block;
  position: relative;
}
.chart-label-left {
  display: inline-block;
  position: relative;
  text-align: right;
  width: 100px;
}
.el-progress-bar__outer{
  background-color: #67c23a;
  border-radius: 2px;
}
.el-progress-bar__inner{
  border-radius: 2px;
}
</style>
