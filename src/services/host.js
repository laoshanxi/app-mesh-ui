import {getResources} from '@/api/resources';

export default {
  getResources: function(vueComp){
    getResources().then((res)=>{
      this.sortFS(res.data);
      vueComp.resources = res.data;
      vueComp.memoryData.push({
        time: vueComp.resources.systime.substring(11),
        memory: (vueComp.resources.mem_applications/1024).toFixed(0)
      });

    }, (res)=>{

    });
  },
  sortFS: function(resources){
    if(resources && resources.fs){
      resources.fs.sort((a, b)=>{
        if(a.size < b.size){
          return -1;
        }else if(a.size > b.size){
          return 1;
        }else{
          if(a.mount_point < b.mount_point){
            return -1;
          }else if(a.mount_point > b.mount_point){
            return 1;
          }else{
            return 0;
          }
        }
      });
    }
  },
  getResourcesForChart: function(vueComp){
    getResources().then((res)=>{
      vueComp.resources = res.data;
      if(vueComp.memoryData.length>40){
        vueComp.memoryData.shift();
      }
      vueComp.memoryData.push({
        time: vueComp.resources.systime.substring(11),
        memory: (vueComp.resources.mem_applications/1024).toFixed(0)
      });
      vueComp.memoryChart.source(vueComp.memoryData);
      vueComp.memoryChart.render();
    }, (res)=>{

    });
  },
  drawChart: function(vueComp){
    vueComp.memoryChart = new G2.Chart({
      container: 'memory',
      width: "1200",
      height: 400,
      animate: false
    });
    vueComp.memoryChart.source(vueComp.memoryData);
    // Step 3：创建图形语法，绘制柱状图，由 time 和 memory 两个属性决定图形位置，time 映射至 x 轴，memory 映射至 y 轴
    vueComp.memoryChart.line().position('time*memory');
    vueComp.memoryChart.area().position('time*memory');
    // Step 4: 渲染图表
    vueComp.memoryChart.render();
  },
}
