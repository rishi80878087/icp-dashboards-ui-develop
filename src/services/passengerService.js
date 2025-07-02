import httpService from './httpService'


const mockSummary = {
  "date": "2024-11-19",
  "airport_code": "string",
  "active_aircraft_count": 0,
  "outgoing": {
    "total_passengers_volume": 0,
    "number_of_staffed_gate_passengers": 0,
    "number_of_e_gate_passengers": 0,
    "total_volume_yoy": 0,
    "staffed_volume_yoy": 0,
    "e_gate_volume_yoy": 0
  },
  "incoming": {
    "total_passengers_volume": 0,
    "number_of_staffed_gate_passengers": 0,
    "number_of_e_gate_passengers": 0,
    "total_volume_yoy": 0,
    "staffed_volume_yoy": 0,
    "e_gate_volume_yoy": 0
  },
  "total_passengers_volume": 0,
  "number_of_staffed_gate_passengers": 0,
  "number_of_e_gate_passengers": 0,
  "total_volume_yoy": 0,
  "staffed_volume_yoy": 0,
  "e_gate_volume_yoy": 0,
  "guage": 0,
  "transit_passenger_percentage": 0
}

export const getSummary = async ({ airport_code, date }) => {
  return httpService.get({ url: `/dashboard/api/v1/passenger-forecastings/summary?airport_code=${airport_code}&date=${date}`, isCacheEnabled: false })
}

const mockTrafficVolume = {
  "date": "2024-11-19",
  "airport_code": "string",
  "incoming": [
    {
      "number_of_staffed_gate_passengers": 23300,
      "shift_number": 0,
      "shift_name": "1st Shift",
      "shift_starting_time": "9:00",
      "shift_ending_time": "12:00",
      "required_officers_count": 12,
      "staffed_yoy": -20,
      "staffed_guage": 80
    },
    {
      "number_of_staffed_gate_passengers": 23300,
      "shift_number": 0,
      "shift_name": "1st Shift",
      "shift_starting_time": "9:00",
      "shift_ending_time": "12:00",
      "required_officers_count": 12,
      "staffed_yoy": -20,
      "staffed_guage": 30
    },
    {
      "number_of_staffed_gate_passengers": 23300,
      "shift_number": 0,
      "shift_name": "1st Shift",
      "shift_starting_time": "9:00",
      "shift_ending_time": "12:00",
      "required_officers_count": 12,
      "staffed_yoy": -20,
      "staffed_guage": 60
    }
  ],
  "outgoing": [
    {
      "number_of_staffed_gate_passengers": 22100,
      "shift_number": 0,
      "shift_name": "1st Shift",
      "shift_starting_time": "9:00",
      "shift_ending_time": "12:00",
      "required_officers_count": 12,
      "staffed_yoy": 20,
      "staffed_guage": 80
    }
  ]
}

export const getTrafficVolume = async ({ airport_code, date }) => {
  return httpService.get({ url: `/dashboard/api/v1/passenger-forecastings/shift-traffic?airport_code=${airport_code}&date=${date}`, isCacheEnabled: false })
}

const dailyAnalysisMock = {
  "airport_code": "string",
  "current_date": "2024-11-19",
  "data": [
    {
      "date": "2024-11-17",
      "previous_in": 62617,
      "previous_out": 62008,
      "actual_in": 1200,
      "actual_out": 1500,
      "predict_in": 300,
      "predict_out": 400
    },
    {
      "date": "2024-11-18",
      "previous_in": 61430,
      "previous_out": 62249,
      "actual_in": 2200,
      "actual_out": 3000,
      "predict_in": 2100,
      "predict_out": 500
    },
    {
      "date": "2024-11-19",
      "previous_in": 62245,
      "previous_out": 62726,
      "actual_in": 600,
      "actual_out": 222,
      "predict_in": 5500,
      "predict_out": 5100
    },
    {
      "date": "2024-11-20",
      "previous_in": 62074,
      "previous_out": 62143,
      "actual_in": 2200,
      "actual_out": 3000,
      "predict_in": 2100,
      "predict_out": 500
    },
    {
      "date": "2024-11-21",
      "previous_in": 62578,
      "previous_out": 63898,
      "actual_in": 32200,
      "actual_out": 33000,
      "predict_in": 32100,
      "predict_out": 3500
    },
    {
      "date": "2024-11-22",
      "previous_in": 61364,
      "previous_out": 63314,
      "actual_in": 12200,
      "actual_out": 13000,
      "predict_in": 12100,
      "predict_out": 1500
    },
    {
      "date": "2024-11-23",
      "previous_in": 62978,
      "previous_out": 63093,
      "actual_in": 2200,
      "actual_out": 3000,
      "predict_in": 2100,
      "predict_out": 500
    },
  ]
}
export const getDailyAnalysis = async ({ airport_code, traffic_direction = "all" }) => {
  return httpService.get({ url: `/dashboard/api/v1/passenger-forecastings/daily-analysis?airport_code=${airport_code}&traffic_direction=${traffic_direction}`, isCacheEnabled: false })
}

const timeSeriesMock = {
  "airport_code": "string",
  "date": "2024-11-19",
  "incoming": [
    {
      "time": "08:23:38.102Z",
      "total_expected_passengers": 0,
      "number_of_staffed_gate_passengers": 0,
      "number_of_e_gate_passengers": 0,
      "required_officers_count": 0,
      "airport_traffic_status": "string"
    }
  ],
  "outgoing": [
    {
      "time": "08:23:38.102Z",
      "total_expected_passengers": 0,
      "number_of_staffed_gate_passengers": 0,
      "number_of_e_gate_passengers": 0,
      "required_officers_count": 0,
      "airport_traffic_status": "string"
    }
  ]
}

export const getAirportTimeSeries = async ({ airport_code, date }) => {
  return httpService.get({ url: `/dashboard/api/v1/passenger-forecastings/airport-shift-timeseries?airport_code=${airport_code}&date=${date}`, isCacheEnabled: false })
}