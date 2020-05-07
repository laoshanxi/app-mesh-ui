import { registerShApp,deleteApplication,runApp,getOutput } from '@/api/applications'

function runFinished(vueComp){
    vueComp.index=-1;
    if(vueComp.timer){
      clearInterval(vueComp.timer);
      vueComp.timer = null;
    }
    vueComp.input = '';
    vueComp.inputDisabled = false;
    let shell = vueComp.$refs['shell_div'];
    vueComp.$nextTick(() => {
      shell.scrollTop = shell.scrollHeight;
      vueComp.$refs["input"].focus();
    });
}
function refreshShellContents(vueComp,content){
    let command = vueComp.input;
    command = command.replace(/^ +/g, "");
    if(command.indexOf("cd ") == 0){
      vueComp.shellApp.working_dir = content;
    }
    vueComp.shellContents.push({
        content: content
    });
    let shell = vueComp.$refs['shell_div'];
    vueComp.$nextTick(() => {
      shell.scrollTop = shell.scrollHeight;
    });
}
function getOutputValue(vueComp, data){
    getOutput(data.name, data.process_uuid).then((res)=>{
      if(res.status == 201){
        runFinished(vueComp);
      }
      if(res.data==""){
        return;
      }
      refreshShellContents(vueComp, res.data);
    }, (res)=>{
      vueComp.shellContents.push({
          content: "# Failed: " + res.message
      });
      runFinished(vueComp);
    });
}
export default {
  connectHost: function(vueComp){
    vueComp.connected = 1;
    vueComp.shellApp.command = vueComp.command + '""';
    runApp(vueComp.timeout, true, vueComp.shellApp).then((res)=>{
      vueComp.connected = 2;
      runFinished(vueComp);
    }, (res)=>{
      vueComp.connected = 0;
      vueComp.shellContents.push(
        {
          content: "# Connected remote host failed."
        }
      );
    });
  },
  run: function(vueComp){
    let command = vueComp.input;
    command = command.replace(/^ +/g, "");
    if(command.indexOf("cd ") == 0){
      command = command + ";pwd";
    }
    vueComp.shellApp.command = vueComp.command + '" ' + command + '"';
    let shell = vueComp.$refs['shell_div'];
    vueComp.$nextTick(() => {
      shell.scrollTop = shell.scrollHeight;
    });
    runApp(vueComp.timeout, vueComp.isSync, vueComp.shellApp).then((res)=>{
      if(vueComp.isSync){
        refreshShellContents(vueComp, res.data);
        runFinished(vueComp);
      }else{
        vueComp.timer = setInterval(()=>{
          getOutputValue(vueComp, res.data);
        }, 1000);
      }
    }, (res)=>{
      vueComp.shellContents.push({
          content: "# Failed: " + res.message
      });
      runFinished(vueComp);
    });
  },

}
