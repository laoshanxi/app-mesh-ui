import request from '@/utils/request'
const requestUrl = '/v1/kv/appmgr'
export const getLeader = (params)=>{
    return request({
        url:`${requestUrl}/leader`,
        method:'get',
        params
    })
}
export const getNodes = (params)=>{
    return request({
        url:`${requestUrl}/cluster/nodes`,
        method:'get',
        params
    })
}
export const deleteNode = (name)=>{
    return request({
        url:`${requestUrl}/cluster/nodes/${name}`,
        method:'delete'
    })
}
export const getTask = (params)=>{
    return request({
        url:`${requestUrl}/cluster/tasks`,
        method:'get',
        params
    })
}
export const deleteTask = (name)=>{
    return request({
        url:`${requestUrl}/cluster/tasks/${name}`,
        method:'delete'
    })
}
export const addTask = (params,name)=>{
    return request({
        url:`${requestUrl}/cluster/tasks/${name}`,
        method:'put',
        data:params
    })
}