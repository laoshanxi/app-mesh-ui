<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Nodes</h4>
    </el-row>
    <el-row>
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          prop="host"
          label="Host"
        />
        <el-table-column
          prop="free"
          label="Memory free"
        />
        <el-table-column
          prop="total"
          label="Memory total"
        />
        <el-table-column
          prop="cpu"
          label="Cpu cores"
        />
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
      tableColumns: [{}],
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ]
    };
  },
  created() {
    this.getNodes()
  },
  methods: {
    async getNodes() {
      const {data}= await getConfig()
      // const {
      //   // Consul: { url },
      //   // Labels: { HOST_NAME:hostName }
      // } = data
      // const leaderPath = '/v1/kv/appmgr/leader?raw'
      const hostPath = '/v1/kv/appmgr/nodes?recurse=true'
      const res = request.get(`http://195.123.228.208:8500${hostPath}`)
      console.log(res);
      
      return res
    }
  }
};
</script>