import { getClient } from '@/utils/appmeshClient'

export default {
  // Registered apps for the dropdown; auto-select a sensible default (prefer "ping").
  getRegisteredApps(vueComp) {
    vueComp.appsLoading = true
    getClient().listApps().then(data => {
      // the daemon rejects system-protected apps as on-demand run templates, and a keepalive
      // task worker (py-task) only waits for a payload until the timeout kills it — Run Task
      // is its page; offer neither here (same rule as the CLI's `run -a`)
      vueComp.apps = data.filter(app => !app.system && app.behavior?.exit !== 'keepalive')
      vueComp.appsLoading = false
      if (!vueComp.selectedApp && vueComp.apps.length) {
        const ping = vueComp.apps.find(a => a.name === 'ping')
        vueComp.selectedApp = ping ? ping.name : vueComp.apps[0].name
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

    // Both run paths resolve the app's exit code (null when absent); show it
    // as the run footer so a silent run still reports how it ended.
    if (vueComp.isSync) {
      getClient().runAppSync(app, append, vueComp.timeout)
        .then(exitCode => { if (exitCode !== null) append(`# exit ${exitCode}`) })
        .catch(e => append('# Failed: ' + e.message))
        .finally(() => { vueComp.running = false })
    } else {
      getClient().runAppAsync(app, vueComp.timeout)
        .then(run => run.wait(append))
        .then(exitCode => { if (exitCode !== null) append(`# exit ${exitCode}`) })
        .catch(e => append('# Failed: ' + e.message))
        .finally(() => { vueComp.running = false })
    }
  },
}
