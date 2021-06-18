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
    return request({
        url:`/appmesh/cloud/nodes`,
        method:'get',
        params 
    })
}
export const deleteNode = (name)=>{
    return request({
        url:`/appmesh/cloud/nodes/${name}`,
        method:'delete'
    })
}
export const getTask = (params)=>{
    return request({
        url:`/appmesh/cloud/applications`,
        method:'get',
        params
    })
}
export const deleteTask = (name)=>{
    return request({
        url:`/appmesh/cloud/app/${name}`,
        method:'delete'
    })
}
export const addTask = (params,name)=>{
    return request({
        url:`/appmesh/cloud/app/${name}`,
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
