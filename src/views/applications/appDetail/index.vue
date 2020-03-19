<template>
  <el-card class="box-card" v-if="record">
    <DescriptionList title="Basic information" col="24">
      <Description term="Name">{{record.name | formatEmpty}}</Description>
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
      <Description term="User">{{record.user | formatEmpty}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="12">
      <Description term="Command">{{record.command | formatEmpty}}</Description>
      <Description term="Working dir">{{record.working_dir | formatEmpty}}</Description>
	  
	  <Description term="Initial command">{{record.init_command | formatEmpty}}</Description>
	  <Description term="Finish command">{{record.fini_command | formatEmpty}}</Description>
	  <Description term="Health">{{record.health | formatEmpty}}</Description>
	  <Description term="Healthcheck command">{{record.health_check_cmd | formatEmpty}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24">
      <Description term="Comments">{{record.comments | formatEmpty}}</Description>
      <Description term="Docker image">{{record.docker_image | formatEmpty}}</Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Runtime infomation" col="12">
      <Description term="PID">{{record.pid | formatEmpty}}</Description>
      <Description term="Return">{{record.return | formatEmpty}}</Description>
      <Description term="Memory">{{record.memory | formatMemory}}</Description>
      <Description term="Last start time">
        <span v-if="record.last_start_time">{{ record.last_start_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Container id">{{record.container_id | formatEmpty}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="Short running App infomation" col="12">
      <Description term="Start time">{{record.start_time | formatEmpty}}</Description>
      <Description term="Next start time">{{record.next_start_time | formatEmpty}}</Description>
      <Description term="Start interval seconds (S)">{{record.start_interval_seconds | formatEmpty}}</Description>
      <Description term="Start tnterval timeout (S)">{{record.start_interval_timeout | formatEmpty}}</Description>
      <Description term="Keep running">
        <el-tag v-if="record.keep_running==1" :type="'success'">
          Yes
        </el-tag>
        <el-tag v-else :type="'info'">
          No
        </el-tag>
      </Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Extra infomation" col="12">
      <Description term="Daily limitation">{{(record.daily_limitation) ? record.daily_limitation.daily_start + ' - ' + record.daily_limitation.daily_end : '-'}}</Description>
      <Description term="Posix timezone">{{record.posix_timezone | formatEmpty}}</Description>
      <Description term="Phisical memory (Mi)">{{record.resource_limit? record.resource_limit.memory_mb:'-'}}</Description>
      <Description term="Virtual memory (Mi)">{{record.resource_limit? record.resource_limit.memory_virt_mb:'-'}}</Description>
      <Description term="CPU shares">{{record.resource_limit? record.resource_limit.cpu_shares:'-'}}</Description>
      <Description term="Output cache lines">{{record.cache_lines | formatEmpty}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="Environment variables" col="24" v-if="record.env">
      <Description :term="name" v-for="(value, name) in record.env">{{value}}</Description>
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
  }
}
</script>

<style>
</style>
