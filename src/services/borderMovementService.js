import httpService from "./httpService";

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && key !== "date_range" && key !== "selectedMonthTab") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

function objectToParamString(_obj = {}) {
  const obj = removeKeys(_obj || {}) || {}
  const params = Object.keys(obj).map(key => {
    const value = obj[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val)).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  // Join all parameters with '&'
  return params.join('&');
}

export const getOverallStatistics = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getBorderMovementsByNationality = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/by-nationality?${params}`,
    isCacheEnabled: "true",
  });
};

export const getBorderMovementsByAge = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/by-age?${params}`,
    isCacheEnabled: "true",
  });
};

export const getBorderMovementsByBorderType = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/border-type?${params}`,
    isCacheEnabled: "true",
  });
};

export const getBorderPortMovementsByBorderType = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/ports?${params}`,
    isCacheEnabled: "true",
  });
};
