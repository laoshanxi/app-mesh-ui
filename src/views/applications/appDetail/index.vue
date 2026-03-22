<template>
  <el-card v-if="record" class="box-card">
    <DescriptionList title="Basic information" col="12">
      <Description term="Name">
        {{ formatEmpty(record.name) }}
      </Description>
      <Description term="Add time">
        {{ record.register_time_TEXT }}
      </Description>
      <Description term="Owner">
        {{ formatEmpty(record.owner) }}
      </Description>
      <Description term="Command">
        {{ formatEmpty(record.command) }}
      </Description>
      <Description term="Permission">
        {{ formatEmpty(record.permission) }}
      </Description>
      <Description term="Status">
        <div>
          <el-tag v-if="record.status == 1" :type="'success'">
            Enabled
          </el-tag>
          <el-tag v-else :type="'info'">
            Disabled
          </el-tag>
        </div>
      </Description>
    </DescriptionList>

    <DescriptionList title col="12">
      <Description term="Working dir">
        {{ formatEmpty(record.working_dir) }}
      </Description>
      <Description term="Shell mode">
        <el-tag v-if="record.shell == 1" :type="'success'">
          Yes
        </el-tag>
        <el-tag v-else :type="'info'">
          No
        </el-tag>
      </Description>
      <Description term="Session login">
        <el-tag v-if="record.session_login == 1" :type="'success'">
          Yes
        </el-tag>
        <el-tag v-else :type="'info'">
          No
        </el-tag>
      </Description>
      <Description term="Healthcheck cmd">
        {{ formatEmpty(record.health_check_cmd) }}
      </Description>
    </DescriptionList>

    <DescriptionList title col="12">
      <Description term="Start time">
        {{ record.start_time_TEXT }}
      </Description>
      <Description term="End time">
        {{ record.end_time_TEXT }}
      </Description>
      <Description term="Period run interval(S)">
        {{ formatEmpty(record.start_interval_seconds) }}
      </Description>
      <Description term="Period run retention (S)">
        {{ formatEmpty(record.retention) }}
      </Description>
      <Description term="Exit behavior">
        {{ formatEmpty(record.behavior.exit) }}
      </Description>
      <Description term="Docker image">
        {{ formatEmpty(record.docker_image) }}
      </Description>
    </DescriptionList>
    <DescriptionList col="24">
      <Description term="Description">
        {{ formatEmpty(record.description) }}
      </Description>
      <Description term="Stdout number definition">
        {{ formatEmpty(record.stdout_cache_num) }}
      </Description>
    </DescriptionList>

    <el-divider />

    <DescriptionList title="Runtime infomation" col="12">
      <Description term="PID">
        {{ formatEmpty(record.pid) }}
      </Description>
      <Description term="PID user">
        {{ formatEmpty(record.pid_user) }}
      </Description>
      <Description term="Health">
        {{ formatEmpty(record.health) }}
      </Description>
      <Description term="Memory">
        {{ formatMemory(record.memory) }}
      </Description>
      <Description term="CPU Usage">
        {{ formatCpu(record.cpu) }}
      </Description>
      <Description term="Next start time">
        {{ record.next_start_time_TEXT }}
      </Description>
      <Description term="Last start time">
        <span v-if="record.last_start_time">{{ record.last_start_time_TEXT }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Return">
        {{ formatEmpty(record.return_code) }}
      </Description>
      <Description term="Last exit time">
        <span v-if="record.last_exit_time">{{ record.last_exit_time_TEXT }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Start number">
        {{ formatEmpty(record.starts) }}
      </Description>
      <Description term="File descriptors">
        {{ formatEmpty(record.fd) }}
      </Description>
    </DescriptionList>
    <DescriptionList col="24">
      <Description term="Last error">
        {{ record.last_error }}
      </Description>
      <Description term="Container id">
        {{ formatEmpty(record.container_id) }}
      </Description>
    </DescriptionList>

    <el-divider />

    <DescriptionList title="Extra infomation" col="12">
      <Description term="Daily limitation">
        {{
          record.daily_limitation ? record.daily_limitation.daily_start_TEXT + " - " +
            record.daily_limitation.daily_end_TEXT : "-"
        }}
      </Description>
      <Description term="Phisical memory (Mi)">
        {{ record.resource_limit ? record.resource_limit.memory_mb : "-" }}
      </Description>
      <Description term="Virtual memory (Mi)">
        {{ record.resource_limit ? record.resource_limit.memory_virt_mb : "-" }}
      </Description>
      <Description term="CPU shares">
        {{ record.resource_limit ? record.resource_limit.cpu_shares : "-" }}
      </Description>
      <Description term="Stdout number">
        {{ formatEmpty(record.stdout_cache_size) }}
      </Description>
      <Description term="Metadata">
      </Description>
    </DescriptionList>

    <json-viewer v-if="record.metadata" :value="record.metadata" :expand-depth="2"></json-viewer>

    <el-divider />
    <DescriptionList v-if="record.env" title="Environment variables" col="24">
      <Description v-for="(value, name) in record.env" :key="name" :term="name">
        {{
          value
        }}
      </Description>
    </DescriptionList>
  </el-card>
</template>

<script>
import DescriptionList from "@/components/Descriptions/index.vue";
import Description from "@/components/Description/index.vue";
import { formatEmpty, formatMemory, formatCpu } from "@/utils";
export default {
  name: "AppDetail",
  components: {
    DescriptionList,
    Description,
  },
  props: { record: { type: Object, default: null } },
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
  mounted() { },
  methods: {
    formatEmpty,
    formatMemory,
    formatCpu,
  },
};
</script>

<style></style>
