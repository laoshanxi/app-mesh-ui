<template>
  <div class="app-container" style="clear:both;">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label"><i class="el-icon-s-flag"></i> Labels</span>
            <el-form ref="form" :model="form" label-width="80px">
              <el-row v-for="(label, index) in form.labels">
                <el-col style="width:300px">
                  <el-form-item :label="'Label ' + index"
                    :prop="'labels.' + index + '.key'"
                    :rules="{
                      required: true, message: 'Label name is not empty', trigger: 'blur'
                    }"
                    >
                    <el-input v-model="label.key" style="width:150px;"></el-input>
                    =
                  </el-form-item>
                </el-col>
                <el-col style="width:350px">
                  <el-form-item  label-width="0px"
                    :prop="'labels.' + index + '.value'"
                    :rules="{
                      required: true, message: 'Label value is not empty', trigger: 'blur'
                    }"
                    >
                    <el-input v-model="label['value']" style="width:200px;margin-right: 10px;"></el-input>
                    <el-button @click.prevent="removeLabel(label)" icon="el-icon-delete"></el-button>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="No Labels" v-if="!form.labels || form.labels.length==0">
              </el-form-item>

              <el-form-item>
                <el-button size="small" @click.prevent="addLabel()">Add Label</el-button>
                <el-button size="small" type="primary" @click.prevent="saveLabels()">Submit</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

        </el-tabs>


      </el-col>
    </el-row>
  </div>
</template>

<script>
import lablesService from '@/services/labels'

export default {
  data() {
    return {
      form: {
        labels: []
      }
    }
  },
  mounted() {
    this.refresh();

  },
  methods: {
    refresh(){
      this.form.labels = [];
      lablesService.getLabels(this);
    },
    removeLabel(item){
      var index = this.form.labels.indexOf(item)
      if (index !== -1) {
        this.form.labels.splice(index, 1);
      }
    },
    addLabel(){
      this.form.labels.push({
        key : "",
        value : ""
      });
    },
    saveLabels(){
      lablesService.saveLabels(this);
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
