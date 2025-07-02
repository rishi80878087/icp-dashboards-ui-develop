import httpService from "./httpService";

export const getEmiratesResidents = async (data) => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/expatriates/statistics/emirates_residents?${data?.params}`,
    isCacheEnabled: "false",
  });
};

export const getNationalityByGender = async (data) => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/expatriates/statistics/nationalities?${data?.params}`,
    isCacheEnabled: "false",
  });
};

export const getPopulationByYear = async (data) => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/expatriates/statistics/yearly_population?${data?.params}`,
    isCacheEnabled: "false",
  });
};

export const getEmirateStatistics = async (data) => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/expatriates/statistics?${data?.params}`,
    isCacheEnabled: "false",
  });
};
