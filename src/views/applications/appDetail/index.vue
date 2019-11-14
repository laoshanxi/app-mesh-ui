<template>
  <el-card class="box-card" v-if="record">
    <DescriptionList title="" col="24" :content="record">
      <Description term="Name">{{record.name}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24" :content="record">
      <Description term="Command">{{record.command}}</Description>
    </DescriptionList>
    <DescriptionList title="" col="24" :content="record">
      <Description term="Working dir">{{record.working_dir}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="" col="8" :content="record">
      <Description term="User">{{record.user}}</Description>
      <Description term="Comments">{{record.comments}}</Description>
      <Description term="Status">
        <el-tag v-if="record.status==1" :type="'success'">
          Enabled
        </el-tag>
        <el-tag v-else :type="'info'">
          Disabled
        </el-tag>
      </Description>
    </DescriptionList>
    <DescriptionList title="" col="24" :content="record">
      <Description term="Daily limitation">{{(record.daily_limitation) ? record.daily_limitation.daily_start + ' - ' + record.daily_limitation.daily_end : null}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="" col="8" v-if="record.envs" :content="record">
      <Description :term="env.name" v-for="(env, index) in record.envs">{{env.value}}</Description>
    </DescriptionList>
    <el-divider v-if="record.envs"></el-divider>
    <DescriptionList title="" col="8" :content="record">
      <Description term="CPU shares">{{record.resource_limit? record.resource_limit.cpu_shares:null}}</Description>
      <Description term="Memory (MB)">{{record.resource_limit? record.resource_limit.memory_mb:null}}</Description>
      <Description term="Memory virt (MB)">{{record.resource_limit? record.resource_limit.memory_virt_mb:null}}</Description>
      <Description term="Posix timezone">{{record.posix_timezone}}</Description>
      <Description term="Cache lines">{{record.cache_lines}}</Description>
      <Description term="Docker image">{{record.docker_image}}</Description>
      <Description term="PID">{{record.pid}}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="" col="8" :content="record">
      <Description term="Keep running">
        <el-tag v-if="record.keep_running==1" :type="'success'">
          True
        </el-tag>
        <el-tag v-else :type="'info'">
          False
        </el-tag>
      </Description>
      <Description term="Start interval seconds (S)">{{record.start_interval_seconds}}</Description>
      <Description term="Start time">{{record.start_time}}</Description>
      <Description term="Start tnterval timeout (S)">{{record.start_interval_timeout}}</Description>
    </DescriptionList>
  </el-card>
</template>

<script>
import DescriptionList from "@/components/Description";
export default {
  name:"AppDetail",
  props:[
    "record"
  ],
  components:{
    DescriptionList
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
  }
}
</script>

<style>
</style>
