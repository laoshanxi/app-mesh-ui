import request from '@/utils/request'

export function upload(filepath, data) {
  return request({
    url: '/appmesh/file/upload',
    method: 'POST',
    headers:{
      "file_path" : filepath,
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
      "file_path" : filepath
    },
    responseType: 'blob'
  })
}
