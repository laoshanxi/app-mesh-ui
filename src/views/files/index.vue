<template>
  <div class="app-container" style="clear: both">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="max-width: 600px">
            <span slot="label">
              <i class="el-icon-upload"></i> Upload file
            </span>
            <el-form ref="form" :model="form" label-width="90px">
              <el-form-item label="Remote dir:">
                <el-input v-model="form.filepath" size="small"></el-input>
              </el-form-item>

              <el-form-item>
                <el-upload
                  ref="upload" class="upload-demo" action="#" :auto-upload="false" :on-change="fileChange"
                  :limit="1"
                >
                  <el-button slot="trigger" size="small" type="primary">Select File</el-button>
                  <el-button
                    style="margin-left: 10px" size="small" type="success" :disabled="form.disabled"
                    @click="submitUpload"
                  >
                    Upload
                  </el-button>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">
              <i class="el-icon-download"></i> Download file
            </span>
            <el-form ref="downloadForm" :model="downloadForm" label-width="90px">
              <el-form-item label="Remote file">
                <el-input v-model="downloadForm.filepath"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button size="small" type="primary" @click="download">Download</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import fileService from "@/services/file";
import { getClient } from '@/utils/appmeshClient'

export default {
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
  computed: {
    ...mapGetters(["baseUrl"]),
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
        this.$message.warning("Please select a file");
        return;
      }
      const file = this.$refs.upload.uploadFiles[0];
      const path = [this.form.filepath, this.form.filename].join('/').replace(/\/+/g, '/');

      getClient().upload_file(file.raw, path)
        .then(() => {
          this.$refs.upload.clearFiles();
          this.form.disabled = true;
          this.form.file = null;
          this.$message.success(
            "File [" + this.form.filename + "] upload success",
            5000
          );
        })
        .catch((err) => { });
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
</style>
