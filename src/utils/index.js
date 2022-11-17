/**
 * Created by PanJiaChen on 16/11/18.
 */
import moment from "moment";
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
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
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
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
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

export function formatEmpty(value, defaultValue) {
  return value || value == 0 ? value : (defaultValue ? defaultValue : "-");
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
