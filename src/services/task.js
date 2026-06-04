import { getClient } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

export default {
  // Only task-server apps expose task_status ("idle"/"busy");
  // auto-select a sensible default (prefer "pytask").
  getTaskApps(vueComp) {
    vueComp.appsLoading = true
    getClient().list_apps().then(data => {
      vueComp.apps = data.filter(a => a.task_status === 'idle' || a.task_status === 'busy')
      vueComp.appsLoading = false
      if (!vueComp.selectedApp && vueComp.apps.length) {
        const py = vueComp.apps.find(a => a.name === 'pytask')
        vueComp.selectedApp = py ? py.name : vueComp.apps[0].name
      }
    }, () => {
      vueComp.appsLoading = false
    })
  },

  status(vueComp) {
    const a = vueComp.apps.find(x => x.name === vueComp.selectedApp)
    return a ? a.task_status : null
  },

  sendTask(vueComp) {
    if (!vueComp.selectedApp) return
    vueComp.sending = true
    vueComp.result = ''
    if (vueComp.payload && vueComp.payload !== vueComp.history[vueComp.history.length - 1]) {
      vueComp.history.push(vueComp.payload)
    }
    getClient().run_task(vueComp.selectedApp, vueComp.payload, vueComp.timeout)
      .then(res => {
        try {
          vueComp.result = JSON.parse(res)
          vueComp.resultIsJson = true
        } catch {
          vueComp.result = String(res)
          vueComp.resultIsJson = false
        }
      })
      .catch(e => {
        vueComp.result = '# Failed: ' + e.message
        vueComp.resultIsJson = false
      })
      .finally(() => { vueComp.sending = false })
  },

  cancel(vueComp) {
    if (!vueComp.selectedApp) return
    getClient().cancel_task(vueComp.selectedApp).then(ok => {
      ElMessage[ok ? 'success' : 'warning'](ok ? 'Task cancelled' : 'Cancel failed')
    })
  },
}
