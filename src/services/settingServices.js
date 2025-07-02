import httpService from './httpService'



export const createOfficerEfficiency = async ({ data }) =>{
  return httpService.post({ url: `/dashboard/api/v1/officer-efficiency`, data, isCacheEnabled: false })
}

export const updateOfficerEfficiency = async ({ data}) =>{
  return httpService.put({ url: `/dashboard/api/v1/officer-efficiency`, data, isCacheEnabled: false })
}

export const getOfficerEfficiencies = async () =>{
  return httpService.get({ url: `/dashboard/api/v1/officer-efficiency`, isCacheEnabled: false })
}

export const deleteOfficerEfficiency = async ({ id }) =>{
  return httpService.delete({ url: `/dashboard/api/v1/officer-efficiency/${id}`, isCacheEnabled: false })
}
  

export const createAirportConfiguration = async ({ data }) =>{
  return httpService.post({ url: `/dashboard/api/v1/airport-configurations`, data, isCacheEnabled: false })
}

export const updateAirportConfiguration = async ({ data, airport_code }) =>{
  return httpService.put({ url: `/dashboard/api/v1/airport-configurations/${airport_code}`, data, isCacheEnabled: false })
}

export const getAirportConfigurations = async () =>{
  return httpService.get({ url: `/dashboard/api/v1/airport-configurations`, isCacheEnabled: false })
}

export const deleteAirportConfiguration = async ({ id }) =>{
  return httpService.delete({ url: `/dashboard/api/v1/airport-configurations/${id}`, isCacheEnabled: false })
}
  