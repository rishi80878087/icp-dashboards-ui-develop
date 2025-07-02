import httpService from "./httpService";
import { objectToParamString } from "@/utils/helper";

export const getConfig = async () => {
  return httpService.get({
    url: `/dashboard/api/v1/configs`,
    isCacheEnabled: "true",
  });
};


export const getArabic = async () => {
  return httpService.get({ url: `/api/ar`, isCacheEnabled: "true" });
};

export const getEnglish = async () => {
  return httpService.get({ url: `/api/en`, isCacheEnabled: "true" });
};

export const getEmiratesConfig = async () => {
  return httpService.get({ url: `/bi-dashboards/api/v1/configs/emirates`, isCacheEnabled: "true" })
};

export const getNationalitiesConfig = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/nationalities`,
    isCacheEnabled: "true",
  });
};

export const getResidencyTypeConfig = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/residents_type`,
    isCacheEnabled: "true",
  });
};

export const getBorderTypeConfig = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/border-types`,
    isCacheEnabled: "true",
  });
};

export const getPorts = async (obj = {}) => {
  const params = objectToParamString(obj)
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/ports?${params}`,
    isCacheEnabled: "true",
  });
};

export const getVisaOffices = async (obj = {}) => {
  const params = objectToParamString(obj)

  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/visa-offices?${params}`,
    isCacheEnabled: "true",
  });
};

export const getDepartments = async (obj = {}) => {
  const params = objectToParamString(obj)

  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/departments?${params}`,
    isCacheEnabled: "true",
  });
};

export const getRiskTypes = async (obj = {}) => {
  const params = objectToParamString(obj)

  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/risk-type?${params}`,
    isCacheEnabled: "true",
  });
}
