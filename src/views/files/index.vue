<template>
  <div class="app-container" style="clear: both">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="max-width: 600px">
            <template #label>
              <span>
                <el-icon><Upload /></el-icon> Upload file
              </span>
            </template>
            <el-form ref="form" :model="form" label-width="90px">
              <el-form-item label="Remote dir:">
                <el-input v-model="form.filepath" size="small"></el-input>
              </el-form-item>

              <el-form-item>
                <el-upload
                  ref="upload" class="upload-demo" action="#" :auto-upload="false" :on-change="fileChange"
                  :limit="1"
                >
                  <template #trigger><el-button type="primary">Select File</el-button></template>
                  <el-button
                    style="margin-left: 10px" type="success" :disabled="form.disabled"
                    @click="submitUpload"
                  >
                    Upload
                  </el-button>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <span>
                <el-icon><Download /></el-icon> Download file
              </span>
            </template>
            <el-form ref="downloadForm" :model="downloadForm" label-width="90px">
              <el-form-item label="Remote file">
                <el-input v-model="downloadForm.filepath"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="download">Download</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import fileService from "@/services/file";
import { getClient } from '@/utils/appmeshClient'
import { ElMessage } from "element-plus";
import { Upload, Download } from "@element-plus/icons-vue";

export default {
  components: { Upload, Download },
  data() {
    return {
      form: {
        filepath: "",
        filename: "",
        disabled: true,
        file: null,
      },
      downloadForm: {
        filepath: "",
      }
    };
  },
  methods: {
    fileChange(file, fileList) {
      if (fileList.length > 0) {
        this.form.filename = file.name;
        this.form.file = file;
        this.form.disabled = false;
      } else {
        this.form.disabled = true;
        this.form.file = null;
      }
    },
    submitUpload() {
      if (!this.form.file) {
        ElMessage.warning("Please select a file");
        return;
      }
      const file = this.$refs.upload.uploadFiles[0];
      const parts = [this.form.filepath, this.form.filename].filter(Boolean);
      const path = parts.join('/').replace(/\/+/g, '/');

      getClient().upload_file(file.raw, path)
        .then(() => {
          this.$refs.upload.clearFiles();
          this.form.disabled = true;
          this.form.file = null;
          ElMessage.success(
            "File [" + this.form.filename + "] upload success"
          );
        })
        .catch(() => { });
    },
    download() {
      fileService.download(this);
    },
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}

/* Pixel-free fill: cascade flex from the flex-column app-main so the tab
   card fits its (short) content instead of the global forced 100vh-174px
   height that left a large empty area below the upload/download forms. */
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
  flex: 0 1 auto;
  min-height: 0;
}

:deep(.el-tabs__content) {
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: auto;
}
</style>
