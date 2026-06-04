<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane>
        <template #label>
          <span>
            <el-icon><Monitor /></el-icon> Host
          </span>
        </template>
        <el-row>
          <el-col :span="24" style="padding: 10px;">
            <detail :record="resources" />
          </el-col>
        </el-row>
        <!-- <el-row class="detail-card">
          <el-col :span="24">
            <div id="memory"></div>
          </el-col>
        </el-row>-->
      </el-tab-pane>

      <el-tab-pane>
        <template #label>
          <span>
            <el-icon><Document /></el-icon> Json
          </span>
        </template>

        <el-row>
          <el-col :span="1" style="text-align: right; padding-top: 20px;">
            <el-icon style="cursor: pointer;" :title="button" @click="expandJson()"><component :is="btnIcon" /></el-icon>
          </el-col>
          <el-col :span="23">
            <el-row v-show="showExpand">
              <json-viewer :value="resources" :expand-depth="1"></json-viewer>
            </el-row>
            <el-row v-show="showCollapse">
              <json-viewer :value="resources" :expand-depth="10"></json-viewer>
            </el-row>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { Monitor, Document, CirclePlus, RemoveFilled } from '@element-plus/icons-vue'
import hostService from "@/services/host";
import detail from "./detail/index.vue";

export default {
  components: {
    detail,
    Monitor,
    Document,
    CirclePlus,
    RemoveFilled
  },
  data() {
    return {
      activeNames: [],
      resources: "No Data",
      showExpand: true,
      showCollapse: false,
      button: "Expand",
      btnIcon: markRaw(CirclePlus),
      timer: null,
      memoryChart: null,
      memoryData: [],
    };
  },
  mounted() {
    this.initData();
  },
  unmounted() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    initData() {
      hostService.getResources(this);
    },
    monitor() {
      hostService.drawChart(this);
      this.timer = setInterval(() => {
        hostService.getResourcesForChart(this);
      }, 1000);
    },
    expandJson() {
      let tmpJson = this.resources;
      if (this.showExpand) {
        this.resources = "";
        this.showExpand = false;
        this.showCollapse = true;
        this.button = "Collapse";
        this.resources = tmpJson;
        this.btnIcon = markRaw(RemoveFilled);
      } else {
        this.resources = "";
        this.showExpand = true;
        this.showCollapse = false;
        this.button = "Expand";
        this.resources = tmpJson;
        this.btnIcon = markRaw(CirclePlus);
      }
    },
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}

/* Pixel-free fill: app-main is a flex column, so cascade flex down to the
   tab card and let it GROW to fill the content area (border-card reaches the
   bottom), with the tab content scrolling when long. */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.app-container > .el-row {
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 0;
}

.app-container > .el-row > .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

:deep(.el-tabs__content) {
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: auto;
}
</style>
