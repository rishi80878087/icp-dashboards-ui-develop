import httpService from './httpService'


export const getRecentPredictions = async () => {
  return httpService.get({ url: `/dashboard/api/v1/predict-nationality`, isCacheEnabled: false })
}

export const getNamePridictions = async ({ data }) => {
  return httpService.post({ url: `/dashboard/api/v1/predict-nationality`, data, isCacheEnabled: false })
}
