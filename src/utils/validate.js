export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUsername(str) {
  return typeof str === 'string' && str.trim().length > 0;
}
