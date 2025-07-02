import httpService from "./httpService";
import { objectToParamString } from "@/utils/helper";


function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && key !== "date_range" && key !== "selectedMonthTab") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}


export const getOverallStatistics = async (data) => {
  const params = objectToParamString(data?.filter);

  return httpService.get({
    
    url: `/bi-dashboards/api/v1/visa-residency/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getTouristVisaEmirates = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/visa-residency/tourist-visas/emirates?${params}`,
    isCacheEnabled: "true",
  });
};

export const getTouristVisaStatus = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/visa-residency/tourist-visas/status?${params}`,
    isCacheEnabled: "true",
  });
};

export const getTouristVisaNationalities = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/visa-residency/tourist-visas/nationalities?${params}`,
    isCacheEnabled: "true",
  });
};

export const getViolationsEmirates = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/visa-residency/violations/emirates?${params}`,
    isCacheEnabled: "true",
  });
};

export const getViolationsOffices = async (data) => {
  const params = objectToParamString(data?.filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/visa-residency/violations/offices?${params}`,
    isCacheEnabled: "true",
  });
};
