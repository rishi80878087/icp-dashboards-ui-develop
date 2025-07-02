import httpService from "./httpService";

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
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

export const getEmiratesResidents = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_emirates?${params}`,
    isCacheEnabled: "true",
  });
};

export const getNationalityByGender = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_nationality?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByGender = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_gender?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByAge = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_age_range?${params}`,
    isCacheEnabled: "true",
  });
};

export const getGeneralResidentsSummary = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsEmirates = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/emirates/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getNationalityByEmirates = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/nationality?${params}`,
    isCacheEnabled: "true",
  });
}

export const getResidentsByResidencyType = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/resident-type?${params}`,
    isCacheEnabled: "true",
  });
}

export const getVisaHolderByVisaType = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/visa-category?${params}`,
    isCacheEnabled: "true",
  });
}