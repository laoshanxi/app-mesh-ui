<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Task</h4>
    </el-row>
    
    <el-row>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">
            {{ scope.row.name | formatName }}
          </template>
        </el-table-column>
        <el-table-column prop="replication" label="Replication" />
        <el-table-column prop="port" label="Port" />
        <el-table-column prop="content" label="Application">
          <template slot-scope="scope">
            <pre>{{ scope.row.content }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Condition">
          <template slot-scope="scope">
            <pre>{{ scope.row.condition }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="260">
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
import {getTask,deleteTask} from '@/api/cluster'
export default {
    name:"Task",
    mixins:[mixin],
    data(){
        return {
            tableData:[]
        }
    },
    methods:{
        fetchData(){
            const {apiBaseUrl} = this
            getTask(apiBaseUrl,{recurse:true}).then(res=>{
                this.tableData = this.formatData(res.data)
            })
        },
        formatData(data){
            if(!data) return []
            const decodedData = data.map(e=>JSON.parse(atob(e.Value)))
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
              const {data} = await deleteTask(this.apiBaseUrl,row.name)
              if (data) {
                const index = this.tableData.findIndex(e=>e.name === row.name)
                this.tableData.splice(index,1)
              }
            })
        }
    }
}
</script>