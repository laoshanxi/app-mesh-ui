<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Leader: <el-tag :type="'success'">{{leader}}</el-tag></h4>
    </el-row>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="hostName" label="Host" width="300">
          <template slot-scope="scope">
            <a :href="scope.row.hostName" style="text-decoration:underline;color:#409EFF;" target="_blank">
              {{ scope.row.hostName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="freeMem" label="Free memory">
          <template slot-scope="scope">
            {{ scope.row.freeMem | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column prop="totalMem" label="Total memory">
          <template slot-scope="scope">
            {{ scope.row.totalMem | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Memory usage" width="200">
          <template slot-scope="scope">
            <el-progress
              :text-inside="true"
              :stroke-width="25"
              :percentage="parseFloat((scope.row.usage * 100).toFixed(2))"
              status="exception"
              stroke-linecap="square"
            />
          </template>
        </el-table-column>
        <el-table-column prop="cpuCores" label="Cpu cores">
          <template slot-scope="scope">
            {{ scope.row.cpuCores }}
          </template>
        </el-table-column>
        <el-table-column label="Refresh time" prop="update" width="200">
          <template slot-scope="scope">
            {{ scope.row.update | parseTime }}
          </template>
        </el-table-column>
        <el-table-column label="" width="260">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-delete" @click="removeNode(scope.row)">
              Remove
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
import {getLeader,getNodes} from "@/api/cloud"
import mixin from './mixin'
import request from "@/utils/request";
export default {
  name: "Nodes",
  mixins:[mixin],
  data() {
    return {
      queryData: null,
      tableData:[],
      leader:''
    }
  },
  methods: {
    fetchData() {
      getLeader({raw:true}).then(res=>{
        this.leader = res.data
      }).catch(err=>{
        console.log(err)
      })
      getNodes({recurse:true}).then(res=>{
        const { data } = res
        this.tableData = this.formatData(data)
      })

    },
    formatData(data){
      if(!data) return []
      const decodedData = data.map(e=>JSON.parse(atob(e.Value)))
      return decodedData.map((e,index) => {
        const {
          resource: {
            cpu_cores: cpuCores,
            mem_free_bytes: totalMem,
            mem_total_bytes: totalMem
          }
        } = e
        const usage = (totalMem-freeMem)/totalMem
        const update = new Date(data[index].Flags * 1000 )
        const hostName = this.formatName(data[index].Key)
        return {hostName,cpuCores,freeMem,totalMem,usage,update}
      })
    },
    removeNode(row){
      this.$confirm(`Do you want to remove the host <${row.hostName}> ?`, 'Tooltip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          const {data} = await request.delete(`${this.apiBaseUrl}/v1/kv/appmgr/cluster/nodes/${row.hostName}`)
          if (data) {
             const index = this.tableData.findIndex(e=>e.hostName === row.hostName)
             this.tableData.splice(index,1)
          }
        })

    }
  }
}
</script>
