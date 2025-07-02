import { services } from "@/utils/constant";
import httpService from "./httpService";


const { bi_dashboards } = services;

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      if (key === "residenceCategory") {
        acc["residence_category"] = obj[key];
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
}

function objectToParamString(_obj = {}) {
  const obj = removeKeys(_obj || {}) || {}
  const params = Object.keys(obj).map(key => {
    let value = obj[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val)).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  // Join all parameters with '&'
  return params.join('&');
}

export const getFilters = async () => {
  // return filters;
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/resident/filters`,
    isCacheEnabled: "true",
  });
};


export const getResidentsByGender = async ({ filters }) => {
  // return gender;
  console.log('@apicall to gen 1');
  const params = objectToParamString(filters);

  console.log("getResidentsByGender params ", params);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/gender/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByResidencyType = async ({ filters }) => {
  // return type;
  console.log('@apicall to residency 1');
  const params = objectToParamString(filters);
console.log('@apicall to residency ');
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/type/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByAgeRange = async ({ filters }) => {
  // return ageRange;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/age-range/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByEmirates = async ({ filters }) => {
  // return emirates;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/emirate/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getEmiratesStatistics = async ({ filters }) => {
  // return nationalities;
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/emirates?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByRegion = async ({ filter }) => {
  // return nationalities;
  const params = objectToParamString(filter);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/nationality/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByProfession = async ({ filters, skip = 0 }) => {
  // return profession;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/profession/statistics?skip=${skip}&limit=10&${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsBySponser = async ({ filters, skip = 0 }) => {
  // return sponsor;
  const params = objectToParamString(filters);
  console.log('getResidentsBySponser url', params, `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/sponsor/statistics?skip=${skip}&limit=10&${params}`);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/sponsor/statistics?skip=${skip}&limit=10&${params}`,
    isCacheEnabled: "true",
  });
};

// visa holder apis

export const getVisaHoldersByGender = async ({ filters }) => {
  // return gender;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/visa-analytics/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaHoldersByAgeRange = async ({ filters }) => {
  // return ageRange;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/visa-analytics/residents-by-age?${params}`,
    isCacheEnabled: "true",
  });
};


export const getVisaHoldersByEmirates = async ({ filters }) => {
  // return emirates;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/visa-analytics/visa-holders-by-emirate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaHoldersByRegion = async ({ filter }) => {
  // return nationalities;
  const params = objectToParamString(filter);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/visa-analytics/visa-holders-by-nationality?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaHoldersByVisaType = async ({ filters }) => {
  // return type;
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/visa-analytics/residents-by-visa-type?${params}`,
    isCacheEnabled: "true",
  });
};
