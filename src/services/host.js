import { getClient } from '@/utils/appmeshClient'
import { Chart } from '@antv/g2';

export default {
  getResources: function (vueComp) {
    getClient().get_host_resources().then((res) => {
      this.sortFS(res);
      vueComp.resources = res;
      vueComp.memoryData.push({
        time: vueComp.resources.systime.substring(11),
        memory: (vueComp.resources.mem_applications / 1024).toFixed(0)
      });
    }).catch((error) => {
      console.error('Failed to fetch resources:', error);
    });
  },

  sortFS: function (resources) {
    if (resources && resources.fs) {
      resources.fs.sort((a, b) => {
        if (a.size < b.size) {
          return 1;
        } else if (a.size > b.size) {
          return -1;
        } else {
          if (a.mount_point < b.mount_point) {
            return -1;
          } else if (a.mount_point > b.mount_point) {
            return 1;
          } else {
            return 0;
          }
        }
      });
    }
  },

  getResourcesForChart: function (vueComp) {
    getClient().get_host_resources().then((res) => {
      vueComp.resources = res.data;
      if (vueComp.memoryData.length > 40) {
        vueComp.memoryData.shift();
      }
      vueComp.memoryData.push({
        time: vueComp.resources.systime.substring(11),
        memory: (vueComp.resources.mem_applications / 1024).toFixed(0)
      });
      vueComp.memoryChart.source(vueComp.memoryData);
      vueComp.memoryChart.render();
    }).catch((error) => {
      console.error('Failed to fetch chart resources:', error);
    });
  },

  drawChart: function (vueComp) {
    const chartConfig = {
      container: 'memory',
      width: 1200,
      height: 400,
      animate: false
    };

    vueComp.memoryChart = new Chart(chartConfig);
    vueComp.memoryChart.source(vueComp.memoryData);

    vueComp.memoryChart.line().position('time*memory');
    vueComp.memoryChart.area().position('time*memory');
    vueComp.memoryChart.render();
  },
}
