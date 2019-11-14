

export function setDataLocalStorage(key, apiUrls){
  localStorage[key] = JSON.stringify(apiUrls);
}

export function getDataLocalStorage(key){
  return localStorage[key] ? JSON.parse(localStorage[key]) : null;
}
