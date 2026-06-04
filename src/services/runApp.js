import { getClient } from '@/utils/appmeshClient'

export default {
  // Registered apps for the dropdown; auto-select a sensible default (prefer "ping").
  getRegisteredApps(vueComp) {
    vueComp.appsLoading = true
    getClient().list_apps().then(data => {
      vueComp.apps = data
      vueComp.appsLoading = false
      if (!vueComp.selectedApp && data.length) {
        const ping = data.find(a => a.name === 'ping')
        vueComp.selectedApp = ping ? ping.name : data[0].name
      }
    }, () => {
      vueComp.appsLoading = false
    })
  },

  // Run an existing app BY NAME (no command); sync or async streaming.
  runByName(vueComp) {
    const app = { name: vueComp.selectedApp }
    const append = (content) => {
      vueComp.output += typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content)
      vueComp.$nextTick(() => {
        const el = vueComp.$refs.out
        if (el) el.scrollTop = el.scrollHeight
      })
    }
    vueComp.running = true
    vueComp.output += `# run ${vueComp.selectedApp}\n`

    if (vueComp.isSync) {
      getClient().run_app_sync(app, append, vueComp.timeout)
        .catch(e => append('# Failed: ' + e.message))
        .finally(() => { vueComp.running = false })
    } else {
      getClient().run_app_async(app, vueComp.timeout)
        .then(run => run.wait(append))
        .catch(e => append('# Failed: ' + e.message))
        .finally(() => { vueComp.running = false })
    }
  },
}
