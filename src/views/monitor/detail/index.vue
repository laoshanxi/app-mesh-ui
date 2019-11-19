<template>
  <div class="box-card" v-if="record!='No Data'">
    <DescriptionList title="Host" col="24">
      <Description term="Name">{{formatEmpty(record.host_name)}}</Description>
      <Description term="Description">{{formatEmpty(record.host_description)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="8">
      <Description term="1 Minites">{{formatEmpty(record.load["1min"])}}</Description>
      <Description term="5 Minites">{{formatEmpty(record.load["5min"])}}</Description>
      <Description term="15 Minites">{{formatEmpty(record.load["15min"])}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="CPU & Memory" col="8">
      <Description term="CPU cores">{{formatEmpty(record.cpu_cores)}}</Description>
      <Description term="CPU processors">{{formatEmpty(record.cpu_processors)}}</Description>
      <Description term="Time">{{formatEmpty(record.systime)}}</Description>

      <Description term="Memory free swap">{{formatMemory(record.mem_freeSwap_bytes)}}</Description>
      <Description term="Memory free">{{formatMemory(record.mem_free_bytes)}}</Description>
      <Description term="Memory applications">{{formatMemory(record.mem_applications)}}</Description>
      <Description term="Memory total swap">{{formatMemory(record.mem_totalSwap_bytes)}}</Description>
      <Description term="Memory total">{{formatMemory(record.mem_total_bytes)}}</Description>

    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Disk" col="24" style="margin-bottom: 20px;">
      <el-table
        :key="1"
        :data="record.fs"
        border
        style="width: 100%"
        highlight-current-row
      >

        <el-table-column label="Device" width="240">
          <template slot-scope="scope">
            {{ formatEmpty(scope.row.device) }}
          </template>
        </el-table-column>

        <el-table-column label="Mount point">
          <template slot-scope="scope">
            {{ formatEmpty(scope.row.mount_point) }}
          </template>
        </el-table-column>
        <el-table-column label="Size">
          <template slot-scope="scope">
            {{ formatMemory(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="Used">
          <template slot-scope="scope">
            {{ formatMemory(scope.row.used) }}
          </template>
        </el-table-column>
        <el-table-column label="Usage">
          <template slot-scope="scope">
            {{ formatPercentage(scope.row.usage) }}
          </template>
        </el-table-column>
      </el-table>
    </DescriptionList>
    <DescriptionList title="Network" col="24">
      <el-table
        :key="2"
        :data="record.net"
        border
        style="width: 100%"
        highlight-current-row
      >

        <el-table-column label="Name" width="240">
          <template slot-scope="scope">
            {{ formatEmpty(scope.row.name) }}
          </template>
        </el-table-column>

        <el-table-column label="Mount point">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ipv4" :type="'success'">
              Yes
            </el-tag>
            <el-tag v-else :type="'info'">
              No
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Size">
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
export default {
  name:"AppDetail",
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
      let units = ["B", "KB", "MB", "GB", "TB", "PB"];
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
</style>
