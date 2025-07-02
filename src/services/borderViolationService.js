import httpService from "./httpService";
import { objectToParamString } from "@/utils/helper";


export const getVisaViolationSummary = async (data) => {
  const params = objectToParamString(data?.filter);

  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/summary?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaViolationDepartment = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/departments?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaViolationAgeGroup = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/age-group?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaViolationNationality = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/nationality?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaViolationTrend = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/trend?${params}`,
    isCacheEnabled: "true",
  });
};
