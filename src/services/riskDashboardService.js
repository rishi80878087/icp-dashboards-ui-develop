import httpService from "./httpService";
import { objectToParamString } from "@/utils/helper";


export const getRiskByTypes = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/type-stats?${params}`,
    isCacheEnabled: "true",
  });
};

export const getAllEmirates = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/emirates?${params}`,
    isCacheEnabled: "true",
  });
}

export const getRiskByNationality = async (data) => {
  const params = objectToParamString(data?.filter);
  
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/nationalities?${params}`,
    isCacheEnabled: "true",
  });
}
