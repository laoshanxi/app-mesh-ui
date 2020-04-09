<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Nodes</h4>
    </el-row>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="hostName" label="Host">
          <template slot-scope="scope">
            <a :href="scope.row.hostName" style="text-decoration:underline;color:#409EFF;" target="_blank">
              {{ scope.row.hostName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="freeMem" label="Memory free">
          <template slot-scope="scope">
            {{ scope.row.freeMem | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column prop="totalMem" label="Memory total">
          <template slot-scope="scope">
            {{ scope.row.totalMem | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="Usage" width="200">
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
        <el-table-column label="Update time" prop="update">
          <template slot-scope="scope">
            {{ scope.row.update | parseTime }}
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
import { getConfig } from "@/api/config";
import request from "@/utils/request";
export default {
  name: "Nodes",
  data() {
    return {
      queryData: null,
      tableData:[],
      apiBaseUrl:''
    }
  },
  created() {
    this.fetchData().then(res => {
      this.tableData = this.getTableData(res)
    });
  },
  methods: {
    async fetchData() {
      const { data:cfgData } = await getConfig()
      const {
        Consul: { url }
      } = cfgData  
      this.apiBaseUrl = url // delete api need
      const hostPath = "/v1/kv/appmgr/nodes?recurse=true"
      const { data } = await request.get(`${url}${hostPath}`)
      return data
    },
    getTableData(data){
       if(!data) return []
      const decodedData = data.map(e=>JSON.parse(atob(e.Value)))
      return decodedData.map((e,index) => {
        const {
          label: { HOST_NAME: hostName },
          resource: {
            cpu_cores: cpuCores,
            mem_free_bytes: freeMem,
            mem_total_bytes: totalMem
          }
        } = e
        const usage = (totalMem-freeMem)/totalMem
        const update = new Date(data[index].Flags)
        return {hostName,cpuCores,freeMem,totalMem,usage,update}
      })
    },
    removeLabel(row){
      this.$confirm(`Do you want to remove the host <${row.hostName}> ?`, 'Tooltip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          const {data} = await request.delete(`${this.apiBaseUrl}/v1/kv/appmgr/nodes/${row.hostName}`)
          if (data) {
             const index = this.tableData.findIndex(e=>e.hostName === row.hostName)
             this.tableData.splice(index,1)
          }
        })
      
    }
  }
}
</script>