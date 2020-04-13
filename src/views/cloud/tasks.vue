<template>
  <div class="app-container">
    <el-row style="margin-bottom:8px;">
      <el-button-group>
        <el-button @click="drawer=true" type="primary" icon="el-icon-plus">Add</el-button>
      </el-button-group>
    </el-row>
    <!-- add drawer -->
    <el-drawer title="Add Task" :visible.sync="drawer">
      <div shadow="never" class="add-task-card">
          <el-row style="margin-bottom:8px;"><el-input type="textarea"  v-model="jsonStr"></el-input></el-row>
          <div class="btn-group">
            <el-button type="primary" @click="addTask">Add</el-button>
            <el-button @click="drawer = false">Cancel</el-button>
          </div>
      </div>
    </el-drawer>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border v-loading="dataOk">
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">
            {{ scope.row.name | formatName }}
          </template>
        </el-table-column>
        <el-table-column prop="replication" label="Replication" width="100" />
        <el-table-column prop="port" label="Port" width="100" />
        <el-table-column prop="content" label="Application" >
          <template slot-scope="scope">
            <pre>{{ scope.row.content }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Condition">
          <template slot-scope="scope">
            <pre>{{ scope.row.condition }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-delete" @click="removeLabel(scope.row)">
              Remove
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
import mixin from './mixin'
import {getTask,deleteTask,addTask} from '@/api/cluster'
export default {
    name:"Task",
    mixins:[mixin],
    data(){
        return {
            tableData:[],
            dataOk:false,
            drawer:false,
            jsonStr:null
        }
    },
    methods:{
        fetchData(){
            getTask({recurse:true}).then(res=>{
                this.tableData = this.formatData(res.data)
            })
        },
        formatData(data){
            if(!data) return []
            const filterByPath = data.filter(e=>!(/task$/).test(e.Key))//filter data by task's path
            const decodedData = filterByPath.map(e=>JSON.parse(atob(e.Value)))
            return decodedData.map((e,index) => {
              e.name = data[index].Key
              e.content = JSON.stringify(e.content,null,4)
              e.condition = JSON.stringify(e.condition,null,4)
              return e
            })
        },
        removeLabel(row){
          this.$confirm(`Do you want to remove the host <${row.name}> ?`, 'Tooltip', {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(async () => {
              const {data} = await deleteTask(row.name)
              if (data) {
                const index = this.tableData.findIndex(e=>e.name === row.name)
                this.tableData.splice(index,1)
              }
            })
        },
        addTask(){
           const {jsonStr} = this
          addTask(jsonStr).then(res=>{
            if(res.data){
              this.drawer = false
              this.$message({
                type:'success',
                message:"add task successful"
              })
              this.fetchData()
            }
          })
        }
        
    }
}
</script>
<style lang="scss" scoped>
.add-task-card {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  &>div:nth-child(1) /deep/ {
    flex: 1;
    .el-textarea {
      height: 100%;
      > textarea {
        height: 100%;
      }
    }
  }
  .btn-group {
    text-align: right;
  }
}
</style>