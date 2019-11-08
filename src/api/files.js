import request from '@/utils/request'

export function upload(filepath, data) {
  return request({
    url: '/upload',
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
    url: '/download',
    method: 'GET',
    headers:{
      "file_path" : filepath
    },
    responseType: 'blob'
  })
}
