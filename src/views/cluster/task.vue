<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Task</h4>
    </el-row>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="replication" label="Replication" />
        <el-table-column prop="port" label="Port" />
        <el-table-column prop="application" label="Application" />
        <el-table-column prop="condion" label="Condion" />
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
import {getTask} from '@/api/cluster'
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
                console.log(res);
                
            })
        }
    }
}
</script>