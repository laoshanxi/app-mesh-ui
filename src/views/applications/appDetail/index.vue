<template>
  <el-card class="box-card" v-if="record">
    <DescriptionList title="Basic information 1" col="24">
      <Description term="Name">{{formatEmpty(record.name)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="12">
      <Description term="Status">
        <div>
          <el-tag v-if="record.status==1" :type="'success'">
            Enabled
          </el-tag>
          <el-tag v-else :type="'info'">
            Disabled
          </el-tag>
        </div>
      </Description>
      <Description term="User">{{formatEmpty(record.user)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="12">
      <Description term="Command">{{formatEmpty(record.command)}}</Description>
      <Description term="Working dir">{{formatEmpty(record.working_dir)}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24">
      <Description term="Comments">{{formatEmpty(record.comments)}}</Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Runtime infomation" col="12">
      <Description term="PID">{{formatEmpty(record.pid)}}</Description>
      <Description term="Return">{{formatEmpty(record.return)}}</Description>
      <Description term="Memory">{{formatMemory(record.memory)}}</Description>
      <Description term="Last start time">
        <span v-if="record.last_start_time">{{ record.last_start_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Container id">{{formatEmpty(record.container_id)}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="Basic information 2" col="12">
      <Description term="Start time">{{record.start_time}}</Description>
      <Description term="Keep running">
        <el-tag v-if="record.keep_running==1" :type="'success'">
          Yes
        </el-tag>
        <el-tag v-else :type="'info'">
          No
        </el-tag>
      </Description>
      <Description term="Start interval seconds (S)">{{formatEmpty(record.start_interval_seconds)}}</Description>
      <Description term="Start tnterval timeout (S)">{{formatEmpty(record.start_interval_timeout)}}</Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Extra infomation" col="24">
      <Description term="Daily limitation">{{(record.daily_limitation) ? record.daily_limitation.daily_start + ' - ' + record.daily_limitation.daily_end : '-'}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="8">
      <Description term="CPU shares">{{record.resource_limit? record.resource_limit.cpu_shares:'-'}}</Description>
      <Description term="Memory (MB)">{{record.resource_limit? record.resource_limit.memory_mb:'-'}}</Description>
      <Description term="Memory virt (MB)">{{record.resource_limit? record.resource_limit.memory_virt_mb:'-'}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="8">
      <Description term="Posix timezone">{{formatEmpty(record.posix_timezone)}}</Description>
      <Description term="Cache lines">{{formatEmpty(record.cache_lines)}}</Description>
      <Description term="Docker image">{{formatEmpty(record.docker_image)}}</Description>
    </DescriptionList>
    <DescriptionList title="Environment variables" col="24" v-if="record.env">
      <Description :term="name" v-for="(name, value) in record.env">{{value}}</Description>
    </DescriptionList>
  </el-card>
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
