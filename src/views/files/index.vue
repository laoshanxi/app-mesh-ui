<template>
  <div class="app-container" style="clear:both;">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label"><i class="el-icon-upload"></i> Upload file</span>
            <el-form ref="form" :model="form" label-width="80px">
              <el-form-item label="File Path">
                <el-input v-model="form.filepath"></el-input>
              </el-form-item>
              <el-form-item label="File Name">
                <el-input v-model="form.filename"></el-input>
              </el-form-item>

              <el-form-item>
                <el-upload
                  class="upload-demo"
                  ref="upload"
                  :action="url"
                  :headers="headers"
                  :on-change="fileChange"
                  :on-error="uploadError"
                  :limit="1"
                  :auto-upload="false">
                  <el-button slot="trigger" size="small" type="primary">Select File</el-button>
                  <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload" :disabled="form.disabled">Upload</el-button>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label"><i class="el-icon-download"></i> Download file</span>
            <el-form ref="downloadForm" :model="downloadForm" label-width="80px">
              <el-form-item label="File Path">
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
import { getToken } from '@/utils/auth';
import { mapGetters } from 'vuex';
import fileService from '@/services/file';

export default {
  data() {
    return {
      url: "/upload",
      form:{
        filepath:"/tmp/",
        filename:"",
        disabled:true,
        file:null,
      },
      downloadForm:{
        filepath:"/tmp/"
      },
      headers: {}
    }
  },
  computed: {
    ...mapGetters([
      'baseUrl'
    ])
  },
  mounted(){
    this.url = this.$store.getters.baseUrl + "/upload";
  },
  methods: {
    fileChange(file, fileList){
      if(file.status == "ready"){
        this.form.filename = file.name;
        this.form.file = file;
        this.form.disabled = false;
      }else if(file.status == "success"){
        this.$refs.upload.clearFiles();
        this.form.disabled = true;
        this.form.file = null;
        this.$message.success('File '+ this.form.filename +' upload successfully.', 5000);
      }
    },
    uploadError(err, file, fileList){
      this.$message.error('File '+ this.form.filename +' upload failed. ' + err.message, 5000);
    },
    submitUpload() {
      this.headers["FilePath"] = encodeURI(this.form.filepath + this.form.filename);
      this.headers['Authorization'] = "Bearer " + getToken();
      this.$refs.upload.submit();
    },
    download(){
      fileService.download(this);
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
