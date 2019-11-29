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
          <div class="chart-label">Free {{record.mem_free_bytes | formatMemory}}</div>
          <div class="chart-div"><percentage-bar id="mem_usage" :data="formatMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">Total {{record.mem_total_bytes | formatMemory}}</div>
          <div class="chart-label">free {{formatMemory(record.mem_free_bytes)}}</div>
          <div class="chart-div"><percentage-bar id="mem_usage" :data="formatMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">total {{formatMemory(record.mem_total_bytes)}}</div>
        </div>
      </Description>
      <Description term="Swap memory">
        <el-row>
          <div class="chart-label">Free {{record.mem_freeSwap_bytes | formatMemory}}</div>
          <div class="chart-div"><percentage-bar id="mem_swap_usage" :data="formatSwapMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">Total {{record.mem_totalSwap_bytes | formatMemory}}</div>
          <div class="chart-label">free {{formatMemory(record.mem_freeSwap_bytes)}}</div>
          <div class="chart-div"><percentage-bar id="mem_swap_usage" :data="formatSwapMemUsageData()" :width="300" :padding="[0,5,0,5]"></percentage-bar></div>
          <div class="chart-label">total {{formatMemory(record.mem_totalSwap_bytes)}}</div>
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

        <el-table-column label="Device" prop="device" width="150">
          <template slot-scope="scope">
            <i class="el-icon-warning" style="color: firebrick;font-size: 18px; vertical-align: middle;" v-if="formatPercent(scope.row.usage)"></i>
            {{ scope.row.device | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column label="Size" width="150">
          <template slot-scope="scope">
            {{ scope.row.size | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Used" width="150">
          <template slot-scope="scope">
            {{ scope.row.used | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Usage" width="150">
          <template slot-scope="scope">
            <percentage-bar :id="scope.$index" :data="formatUsageData(scope.row)"></percentage-bar>
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
