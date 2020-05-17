import request from '@/utils/request'
const requestUrl = '/v1/kv/appmesh'

let requestForBaseUrl = (config)=>{
  config.curBaseUrl = window.location.href.replace(/^(https?:\/\/[^/]+).*$/g, "$1");
  return request(config);
}
export const getLeader = (params)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/leader`,
        method:'get',
        params
    })
}
export const getNodes = (params)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/cluster/nodes`,
        method:'get',
        params
    })
}
export const deleteNode = (name)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/cluster/nodes/${name}`,
        method:'delete'
    })
}
export const getTask = (params)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/cluster/tasks`,
        method:'get',
        params
    })
}
export const deleteTask = (name)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/cluster/tasks/${name}`,
        method:'delete'
    })
}
export const addTask = (params,name)=>{
    return requestForBaseUrl({
        url:`${requestUrl}/cluster/tasks/${name}`,
        method:'put',
        data:params
    })
}

export const getScheduleResult = ()=>{
    return requestForBaseUrl({
        url:`${requestUrl}/topology?recurse=true`,
        method:'get',
    })
}
