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
        url:`${requestUrl}/nodes`,
        method:'get',
        params
    })
}
export const getTask = (params)=>{
    return request({
        url:`${requestUrl}/task`,
        method:'get',
        params
    })
}
export const deleteTask = (name)=>{
    return request({
        url:`${requestUrl}/task/${name}`,
        method:'delete'
    })
}
export const addTask = (params,name)=>{
    return request({
        url:`${requestUrl}/task/${name}`,
        method:'put',
        data:params
    })
}