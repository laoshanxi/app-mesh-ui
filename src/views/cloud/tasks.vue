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
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="replication" label="Replication" width="100" />
        <el-table-column prop="scheduleNumber" label="Schedule Number" width="150">
          <template slot-scope="scope">
            <el-tag hit v-if="scope.row.scheduleNumber == scope.row.replication" :type="'success'">
              {{scope.row.scheduleNumber}}
            </el-tag>
            <el-tag hit v-else :type="'warning'">{{scope.row.scheduleNumber}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scheduleHosts" label="Schedule Hosts" width="150">
          <template slot-scope="scope">
            {{ scope.row.scheduleHosts }}
          </template>
        </el-table-column>
        <el-table-column prop="port" label="Port" width="80" />
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
        <el-table-column label="Action" width="120" >
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-delete" @click="removeTask(scope.row)">
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
import defaultTask from './task.json'
import {getTask,deleteTask,addTask,getScheduleResult} from '@/api/cloud'
export default {
    name:"Task",
    mixins:[mixin],
    data(){
        return {
            tableData:[],
            dataOk:false,
            drawer:false,
            jsonStr:JSON.stringify(defaultTask,null,4)
        }
    },
    methods:{
        fetchData(){
            getTask({recurse:true}).then(res=>{
                this.tableData = this.formatData(res.data);
                this.tableData.map((e,index) => {
                  e["scheduleNumber"] = 0;
                  e["scheduleHosts"] = [];
                });
                getScheduleResult().then(res=>{
                  this.formatScheduleResult(res.data);
                });
            })
        },
        formatScheduleResult(data){
            if(!data) return
            let taskMap = {};
            const decodedData = data.map(e=>JSON.parse(atob(e.Value)))
            decodedData.map((e,index) => {
              let hostList = taskMap[e[0][0].app];
              if(hostList==null){
                hostList = [];
                taskMap[e[0][0].app] = hostList;
              }
              hostList.push(this.formatName(data[index].Key));
              return e
            })
            this.tableData.map((e,index) => {
              e["scheduleNumber"] = taskMap[e.name] ? taskMap[e.name].length : 0;
              e["scheduleHosts"] = taskMap[e.name] ? taskMap[e.name] : [];
            });
            return taskMap;
        },
        formatData(data){
            if(!data) return []
            const filterByPath = data.filter(e=>!(/task$/).test(e.Key))//filter data by task's path
            const decodedData = filterByPath.map(e=>JSON.parse(atob(e.Value)))
            return decodedData.map((e,index) => {
              e.name = this.formatName(filterByPath[index].Key)
              e.content = JSON.stringify(e.content,null,4)
              e.condition = JSON.stringify(e.condition,null,4)
              return e
            })
        },
        removeTask(row){
          this.$confirm(`Do you want to remove the task <${row.name}> ?`, 'Tooltip', {
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
          const {content:{name}} =JSON.parse(jsonStr)
          addTask(jsonStr,name).then(res=>{
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
