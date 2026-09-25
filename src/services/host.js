import { getClient } from '@/utils/appmeshClient'

export default {
  getResources: function (vueComp) {
    getClient().get_host_resources().then((res) => {
      this.sortFS(res);
      vueComp.resources = res;
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
}
