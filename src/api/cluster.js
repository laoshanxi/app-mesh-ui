import request from '@/utils/request'
const requestUrl = '/v1/kv/appmgr'
export const getLeader = (baseUrl,params)=>{
    return request({
        url:`${baseUrl}${requestUrl}/leader`,
        method:'get',
        params
    })
}
export const getNodes = (baseUrl,params)=>{
    return request({
        url:`${baseUrl}${requestUrl}/nodes`,
        method:'get',
        params
    })
}
export const getTask = (baseUrl,params)=>{
    return request({
        url:`${baseUrl}${requestUrl}/task`,
        method:'get',
        params
    })
}
export const deleteTask = (baseUrl,name)=>{
    return request({
        url:`${baseUrl}${requestUrl}/task/${name}`,
        method:'delete'
    })
}