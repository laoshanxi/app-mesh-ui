<template>
  <el-card class="box-card" v-if="record">
    <DescriptionList title="Basic information" col="12">
      <Description term="Name">{{ record.name | formatEmpty }}</Description>
      <Description term="Reg time">{{
        record.register_time | formatEmpty
      }}</Description>
      <Description term="Command">{{
        record.command | formatEmpty
      }}</Description>
      <Description term="Owner">{{ record.owner | formatEmpty }}</Description>
      <Description term="Permission">{{
        record.permission | formatEmpty
      }}</Description>
    </DescriptionList>
    <DescriptionList title col="12">
      <Description term="Status">
        <div>
          <el-tag v-if="record.status == 1" :type="'success'">Enabled</el-tag>
          <el-tag v-else :type="'info'">Disabled</el-tag>
        </div>
      </Description>
      <Description term="Cloud">{{ record.cloud | formatEmpty }}</Description>
    </DescriptionList>
    <DescriptionList title col="12">
      <Description term="Working dir">{{
        record.working_dir | formatEmpty
      }}</Description>
      <Description term="Initial cmd">{{
        record.init_command | formatEmpty
      }}</Description>
      <Description term="Finish cmd">{{
        record.fini_command | formatEmpty
      }}</Description>
      <Description term="Health">{{ record.health | formatEmpty }}</Description>
      <Description term="Healthcheck cmd">{{
        record.health_check_cmd | formatEmpty
      }}</Description>
      <Description term="Shell mode">
        <el-tag v-if="record.shell_mode == 1" :type="'success'">Yes</el-tag>
        <el-tag v-else :type="'info'">No</el-tag>
      </Description>
    </DescriptionList>
    <DescriptionList title col="12">
      <Description term="Docker image">{{
        record.docker_image | formatEmpty
      }}</Description>
      <Description term="Metadata">{{
        record.metadata | formatEmpty
      }}</Description>
      <Description term="Start time">{{
        record.start_time | formatEmpty
      }}</Description>
      <Description term="End time">{{
        record.end_time | formatEmpty
      }}</Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Runtime infomation" col="12">
      <Description term="PID">{{ record.pid | formatEmpty }}</Description>
      <Description term="Return">{{ record.return | formatEmpty }}</Description>
      <Description term="Memory">{{
        record.memory | formatMemory
      }}</Description>
      <Description term="CPU Usage">{{
        record.cpu | formatMemory
      }}</Description>
      <Description term="Last start time">
        <span v-if="record.last_start_time">{{
          record.last_start_time | formatEmpty
        }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Stdout number">{{
        record.stdout_cache_num | formatEmpty
      }}</Description>
      <Description term="Container id">{{
        record.container_id | formatEmpty
      }}</Description>
      <Description term="Start number">{{
        record.starts | formatEmpty
      }}</Description>
       <Description term="File descriptor">{{
        record.fd | formatEmpty
      }}</Description>
      <Description term="Last error">{{ record.last_error }}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="Short running App infomation" col="12">
      <Description term="Next start time">{{
        record.next_start_time | formatEmpty
      }}</Description>
      <Description term="Start interval seconds (S)">{{
        record.start_interval_seconds | formatEmpty
      }}</Description>
      <Description term="Start tnterval timeout (S)">{{
        record.start_interval_timeout | formatEmpty
      }}</Description>
      <Description term="Keep running">
        <el-tag v-if="record.keep_running == 1" :type="'success'">Yes</el-tag>
        <el-tag v-else :type="'info'">No</el-tag>
      </Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Extra infomation" col="12">
      <Description term="Daily limitation">{{
        record.daily_limitation
          ? record.daily_limitation.daily_start +
            " - " +
            record.daily_limitation.daily_end
          : "-"
      }}</Description>
      <Description term="Posix timezone">{{
        record.posix_timezone | formatEmpty
      }}</Description>
      <Description term="Phisical memory (Mi)">{{
        record.resource_limit ? record.resource_limit.memory_mb : "-"
      }}</Description>
      <Description term="Virtual memory (Mi)">{{
        record.resource_limit ? record.resource_limit.memory_virt_mb : "-"
      }}</Description>
      <Description term="CPU shares">{{
        record.resource_limit ? record.resource_limit.cpu_shares : "-"
      }}</Description>
      <Description term="stdout cache number">{{
        record.stdout_cache_num | formatEmpty
      }}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="Environment variables" col="24" v-if="record.env">
      <Description :term="name" v-for="(value, name) in record.env">{{
        value
      }}</Description>
    </DescriptionList>
  </el-card>
</template>

<script>
import DescriptionList from "@/components/Descriptions";
import Description from "@/components/Description";
export default {
  name: "AppDetail",
  props: ["record"],
  components: {
    DescriptionList,
    Description,
  },
  data() {
    return {
      data: [
        {
          term: "Name",
          detail: "app",
        },
      ],
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style>
</style>
