import moment from "moment";

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return 'just now'
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + ' min ago'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + ' hours ago'
  } else if (diff < 3600 * 24 * 2) {
    return '1 day ago'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return parseTime(time, '{y}-{m}-{d} {h}:{i}')
  }
}

export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

export function formatEmpty(value, defaultValue) {
  return value || value === 0 ? value : (defaultValue || "-");
}

export function parseDateFromUtcSeconds(value) {
  if (value) {
    return moment.unix(value).toDate();
  }
  return null;
}

export function formatDate(value) {
  if (value) {
    let str = moment(parseDateFromUtcSeconds(value)).format("YYYY-MM-DDTHH:mm:ssZ");
    return str.slice(0, str.length - 3);
  }
  return "";
}

export function formatToLocal(isoString) {
  if (!isoString) return "";
  const date = moment(isoString);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "";
}

// Same display format as formatDate ("YYYY-MM-DDTHH:mm:ss+TZ") but for an ISO/RFC3339
// input (e.g. workflow timestamps) — keeps the workflow tables consistent with Applications.
export function formatToLocalIso(isoString) {
  if (!isoString) return "";
  const date = moment(isoString);
  if (!date.isValid()) return "";
  const str = date.format("YYYY-MM-DDTHH:mm:ssZ");
  return str.slice(0, str.length - 3);
}

export function formatToLocalDayTime(dayTime) {
  if (!dayTime) return "";
  const date = moment("1970-01-01 " + dayTime);
  return date.isValid() ? date.format("HH:mm:ss") : "";
}

export function formatDayTime(value) {
  if (value) {
    let str = moment(value).format("HH:mm:ssZ")
    return str.slice(0, str.length - 3);
  }
  return "";
}

export function formatMemory(memory) {
  if (!memory) {
    return "-";
  }
  let units = ["B", "Ki", "Mi", "Gi", "Ti", "Pi"];
  let index = 0;
  let compute = function (num) {
    index++;
    let result = num > 1024 ? num / 1024 : num;
    return result > 1024 ? compute(result) : result;
  }
  return compute(memory).toFixed(1) + " " + units[index];
}

export function formatCpu(cpu) {
  if (!cpu) {
    return "-";
  }
  return cpu.toFixed(1);
}

export function deepClone(obj) {
  if (obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  return null;
}
