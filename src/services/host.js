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
    if (resources?.fs) {
      resources.fs.sort((a, b) =>
        b.size - a.size || a.mount_point.localeCompare(b.mount_point)
      );
    }
  },

  getResourcesForChart: function (vueComp) {
    getClient().get_host_resources().then((res) => {
      vueComp.resources = res;
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
