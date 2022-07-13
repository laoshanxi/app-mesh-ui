<template>
  <el-card v-if="record" class="box-card">
    <DescriptionList title="Basic information" col="12">
      <Description term="Name">
        {{ record.name | formatEmpty }}
      </Description>
      <Description term="Add time">
        {{ record.register_time | formatDate }}
      </Description>
      <Description term="Owner">
        {{ record.owner | formatEmpty }}
      </Description>
      <Description term="Command">
        {{ record.command | formatEmpty }}
      </Description>
      <Description term="Permission">
        {{ record.permission | formatEmpty }}
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
      <Description term="Cloud">
        {{ record.cloud | formatEmpty }}
      </Description>
      <Description term="Working dir">
        {{ record.working_dir | formatEmpty }}
      </Description>
      <Description term="Shell mode">
        <el-tag v-if="record.shell == 1" :type="'success'">
          Yes
        </el-tag>
        <el-tag v-else :type="'info'">
          No
        </el-tag>
      </Description>
      <Description term="Healthcheck cmd">
        {{ record.health_check_cmd | formatEmpty }}
      </Description>
    </DescriptionList>

    <DescriptionList title col="12">
      <Description term="Start time">
        {{ record.start_time | formatDate }}
      </Description>
      <Description term="End time">
        {{ record.end_time | formatDate }}
      </Description>
      <Description term="Period run interval(S)">
        {{ record.start_interval_seconds | formatEmpty }}
      </Description>
      <Description term="Period run retention (S)">
        {{ record.retention | formatEmpty }}
      </Description>
      <Description term="Exit behavior">
        {{ record.behavior.exit | formatEmpty }}
      </Description>
      <Description term="Docker image">
        {{ record.docker_image | formatEmpty }}
      </Description>
    </DescriptionList>
    <DescriptionList col="24">
      <Description term="Description">
        {{ record.description | formatEmpty }}
      </Description>
      <Description term="Stdout number definition">
        {{ record.stdout_cache_num | formatEmpty }}
      </Description>
    </DescriptionList>

    <el-divider />

    <DescriptionList title="Runtime infomation" col="12">
      <Description term="PID">
        {{ record.pid | formatEmpty }}
      </Description>
      <Description term="Health">
        {{ record.health | formatEmpty }}
      </Description>
      <Description term="Memory">
        {{ record.memory | formatMemory }}
      </Description>
      <Description term="CPU Usage">
        {{ record.cpu | formatCpu }}
      </Description>
      <Description term="Next start time">
        {{ record.next_start_time | formatDate }}
      </Description>
      <Description term="Last start time">
        <span v-if="record.last_start_time">{{ record.last_start_time | formatDate }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Return">
        {{ record.return | formatEmpty }}
      </Description>
      <Description term="Last exit time">
        <span v-if="record.last_exit_time">{{ record.last_exit_time| formatDate }}</span>
        <span v-else>-</span>
      </Description>
      <Description term="Start number">
        {{ record.starts | formatEmpty }}
      </Description>
      <Description term="File descriptors">
        {{ record.fd | formatEmpty }}
      </Description>
    </DescriptionList>
    <DescriptionList col="24">
      <Description term="Last error">
        {{ record.last_error }}
      </Description>
      <Description term="Container id">
        {{ record.container_id | formatEmpty }}
      </Description>
    </DescriptionList>

    <el-divider />

    <DescriptionList title="Extra infomation" col="12">
      <Description term="Daily limitation">
        {{
  record.daily_limitation ? record.daily_limitation.daily_start + " - " + record.daily_limitation.daily_end : "-"
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
        {{ record.stdout_cache_size | formatEmpty }}
      </Description>
      <Description term="Metadata">
      </Description>
    </DescriptionList>

    <json-viewer v-if="record.metadata" :value="record.metadata" :expand-depth="2"></json-viewer>

    <el-divider />
    <DescriptionList v-if="record.env" title="Environment variables" col="24">
      <Description v-for="(value, name) in record.env" :term="name">
        {{
        value
        }}
      </Description>
    </DescriptionList>
  </el-card>
</template>

<script>
import DescriptionList from "@/components/Descriptions";
import Description from "@/components/Description";
export default {
  name: "AppDetail",
  components: {
    DescriptionList,
    Description,
  },
  props: ["record"],
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
