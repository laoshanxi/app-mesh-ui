import request from '@/utils/request'

export function upload(filepath, data) {
  return request({
    url: '/appmesh/file/upload',
    method: 'POST',
    headers:{
      "FilePath" : filepath,
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

export function download(filepath) {
  return request({
    url: '/appmesh/file/download',
    method: 'GET',
    headers:{
      "FilePath" : filepath
    },
    responseType: 'blob'
  })
}
