<template>
  <div class="box-card" v-if="record!='No Data'">
    <DescriptionList title="Host" col="8">
      <Description term="Host name">{{formatEmpty(record.host_name)}}</Description>
      <Description term="Date time">{{formatEmpty(record.systime)}}</Description>
      <Description term="Description">{{formatEmpty(record.host_description)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="8">
      <Description term="1 minutes Load">{{formatEmpty(record.load["1min"])}}</Description>
      <Description term="5 minutes Load">{{formatEmpty(record.load["5min"])}}</Description>
      <Description term="15 minutes Load">{{formatEmpty(record.load["15min"])}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="CPU & Memory" col="8">
      <Description term="Processors">{{formatEmpty(record.cpu_processors)}}</Description>
      <Description term="CPU cores">{{formatEmpty(record.cpu_cores)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24">
      <!-- <Description term="Total memory">{{formatMemory(record.mem_total_bytes)}}</Description>
      <Description term="Free memory">{{formatMemory(record.mem_free_bytes)}}</Description> -->
      <Description term="Memory">
        <div style="margin-left: 39px;">
          <div class="chart-label">{{formatMemory(record.mem_free_bytes)}} free</div>
          <div class="chart-div"><percentage-bar id="mem_usage" :data="formatMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">{{formatMemory(record.mem_total_bytes)}} total</div>
        </div>
      </Description>
      <!-- <Description term="Total swap memory">{{formatMemory(record.mem_totalSwap_bytes)}}</Description>
      <Description term="Free swap momery">{{formatMemory(record.mem_freeSwap_bytes)}}</Description> -->
      <Description term="Swap memory">
        <el-row>
          <div class="chart-label">Free {{formatMemory(record.mem_freeSwap_bytes)}}</div>
          <div class="chart-div"><percentage-bar id="mem_swap_usage" :data="formatSwapMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">Total {{formatMemory(record.mem_totalSwap_bytes)}}</div>
        </el-row>
      </Description>
      <Description term="Total app memory">{{formatMemory(record.mem_applications)}}</Description>

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

        <el-table-column label="Device" prop="device" width="150">
          <template slot-scope="scope">
            <i class="el-icon-warning" style="color: firebrick;font-size: 18px; vertical-align: middle;" v-if="formatPercent(scope.row.usage)"></i>
            {{ formatEmpty(scope.row.device) }}
          </template>
        </el-table-column>
        <el-table-column label="Size" width="150">
          <template slot-scope="scope">
            {{ formatMemory(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="Used" width="150">
          <template slot-scope="scope">
            {{ formatMemory(scope.row.used) }}
          </template>
        </el-table-column>
        <el-table-column label="Usage" width="150">
          <template slot-scope="scope">
            <percentage-bar :id="scope.$index" :data="formatUsageData(scope.row)"></percentage-bar>
          </template>
        </el-table-column>
        <el-table-column label="Mount point">
          <template slot-scope="scope">
            {{ formatEmpty(scope.row.mount_point) }}
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
            {{ formatEmpty(scope.row.name) }}
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
            {{ formatEmpty(scope.row.address) }}
          </template>
        </el-table-column>
      </el-table>
    </DescriptionList>
  </div>
</template>

<script>
import DescriptionList from "@/components/Descriptions";
import Description from "@/components/Description";
import PercentageBar from "@/components/Charts/PercentageBar";
import G2 from '@antv/g2';
export default {
  name:"Detail",
  props:[
    "record"
  ],
  components:{
    DescriptionList,
    Description,
    PercentageBar
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
    formatPercentage(value){
      if(!value){
        return "-";
      }
      return (value * 100).toFixed(2) + "%";
    },
    formatMemory(memory){
      if(!memory){
        return "-";
      }
      let units = ["B", "Ki", "Mi", "Gi", "Ti", "Pi"];
      let index = 0;
      let compute = function(num){
        index ++;
        let result = num > 1024 ? num / 1024 : num;
        return result > 1024 ? compute(result) : result;
      }
      return compute(memory).toFixed(2) + " " + units[index];
    },
    formatEmpty(value){
      return value || value == 0 ? value : "-";
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
  top: -9px;
}
</style>
