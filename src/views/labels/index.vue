<template>
  <div class="app-container" style="clear:both;">
    <el-row style="color: #909399;">
      <h4>Labels</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button @click="addLabel()" type="primary" icon="el-icon-plus" :disabled="isEdit">Add</el-button>
      </el-button-group>
    </el-row>
    <el-row>
       <el-table
         :key="tableKey"
         v-loading="listLoading"
         :data="labels"
         element-loading-text="Loading"
         border
         style="width: 100%"
         height="100%"
         class="fix-table"
         highlight-current-row
         @current-change="currentRowChange"
       >

         <el-table-column label="Key" width="300">
           <template slot-scope="scope">
            <el-input
                v-if="scope.row.isEdit"
                size="mini"
                placeholder="Please enter key"
                v-model="scope.row.key">
            </el-input>
            <span v-else>{{ scope.row.key }}</span>
           </template>
         </el-table-column>

         <el-table-column label="Value">
           <template slot-scope="scope">
              <el-input
                  v-if="scope.row.isEdit"
                  size="mini"
                  placeholder="Please enter value"
                  v-model="scope.row.value">
              </el-input>
              <span v-else>{{ scope.row.value }}</span>
           </template>
         </el-table-column>
         <el-table-column label="Action" width="260">
           <template slot-scope="scope">
              <el-button @click="editLabel(scope.row)" type="text" icon="el-icon-edit" :disabled="isEdit" v-if="!scope.row.isEdit">Edit</el-button>
              <el-button @click="cancelUpdate(scope.row)" type="text" icon="el-icon-save" v-if="scope.row.isEdit">Cancel</el-button>
              <el-button @click="updateLabel(scope.row)" type="text" icon="el-icon-save" v-if="scope.row.isEdit">Save</el-button>
              <el-button @click="removeLabel(scope.row)" type="text" icon="el-icon-delete" :disabled="isEdit" v-if="!scope.row.isNew">Remove</el-button>
           </template>
         </el-table-column>
       </el-table>
    </el-row>

  </div>
</template>

<script>
import labelsService from '@/services/labels'

export default {
  data() {
    return {
      labels: [],
      key:"",
      value:"",
      tableKey:0,
      isSelected:false,
      listLoading: false,
      isEdit: false,
      currentRow: null,
    }
  },
  mounted() {
    this.refresh();

  },
  methods: {
    editLabel(row){
      this.isEdit = true;
      this.$set(row, "isEdit", true);
    },
    cancelUpdate(row){
      this.isEdit = false;
      this.$set(row, "isEdit", false);
      if(row.isNew){
        this.labels.splice(row.index, 1);
      }
    },
    updateLabel(row){
      labelsService.updateLabel(this, row);
    },
    removeLabel(row){
      labelsService.deleteLabel(this, row);
    },
    refresh(){
      this.labels = [];
      labelsService.getLabels(this);
    },
    addLabel(){
      let index = this.labels.length;
      this.labels.push({
        key:'',
        value:'',
        isEdit: true,
        isNew: true,
        index: index
      });
      this.isEdit = true;
    },
    saveLabels(){
      labelsService.saveLabels(this);
    },
    currentRowChange(currentRow, oldCurrentRow){
      this.currentRow = currentRow;
      if(!currentRow){
        this.isSelected = false;
        return;
      }
      this.isSelected = true;
    },
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
  .el-table th.gutter{
    display: table-cell!important;
  }
  .el-row{
    margin-bottom: 8px;
  }
</style>
