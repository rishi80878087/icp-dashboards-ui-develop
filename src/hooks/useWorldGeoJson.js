import { useState, useEffect } from "react"

let values = null;

const loadFunction = async () => {
  const { getWorldGeoJSON } = await import("@/components/Map");
  return getWorldGeoJSON;
};

const extendedCountries = [
  {
    id: "DMA",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "DM",
      "iso-a3": "DMA"
    }
  },
  {
    id: "GUF",
    geometry: {},
    properties: {
      continent: "South America",
      "iso-a2": "GF",
      "iso-a3": "GUF"
    }
  },
  {
    id: "MTQ",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "MQ",
      "iso-a3": "MTQ"
    }
  },
  {
    id: "TON",
    geometry: {},
    properties: {
      continent: "Oceania",
      "iso-a2": "TO",
      "iso-a3": "TON"
    }
  },
  {
    id: "YUG",
    geometry: {},
    properties: {
      continent: "Europe",
      "iso-a2": "YU",
      "iso-a3": "YUG"
    }
  },
  {
    id: "PSE",
    geometry: {},
    properties: {
      continent: "Asia",
      "iso-a2": "PS",
      "iso-a3": "PSE"
    }
  },
  {
    id: "HKG",
    geometry: {},
    properties: {
      continent: "Asia",
      "iso-a2": "HK",
      "iso-a3": "HKG"
    }
  },
  {
    id: "MAC",
    geometry: {},
    properties: {
      continent: "Asia",
      "iso-a2": "MO",
      "iso-a3": "MAC"
    }
  },
  {
    id: "MDA",
    geometry: {},
    properties: {
      continent: "Europe",
      "iso-a2": "MD",
      "iso-a3": "MDA"
    }
  },
  {
    id: "NCL",
    geometry: {},
    properties: {
      continent: "Oceania",
      "iso-a2": "NC",
      "iso-a3": "NCL"
    }
  },
  {
    id: "BMU",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "BM",
      "iso-a3": "BMU"
    }
  },
  {
    id: "DEU",
    geometry: {},
    properties: {
      continent: "Europe",
      "iso-a2": "DE",
      "iso-a3": "DEU"
    }
  },
  {
    id: "KAZ",
    geometry: {},
    properties: {
      continent: "Asia",
      "iso-a2": "KZ",
      "iso-a3": "KAZ"
    }
  },
  {
    id: "CYM",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "KY",
      "iso-a3": "CYM"
    }
  },
  {
    id: "GAB",
    geometry: {},
    properties: {
      continent: "Africa",
      "iso-a2": "GM",
      "iso-a3": "GAB"
    }
  },
  {
    id: "GMB",
    geometry: {},
    properties: {
      continent: "Africa",
      "iso-a2": "GM",
      "iso-a3": "GMB"
    }
  },
  {
    id: "DMC",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "DM",
      "iso-a3": "DMC"
    }
  },
  {
    id: "GRC",
    geometry: {},
    properties: {
      continent: "Europe",
      "iso-a2": "GR",
      "iso-a3": "GRC"
    }
  },
  {
    id: "ANB",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "AG",
      "iso-a3": "ANB"
    }
  },
  {
    id: "SHN",
    geometry: {},
    properties: {
      continent: "Africa",
      "iso-a2": "SH",
      "iso-a3": "SHN"
    }
  },
  {
    id: "KNA",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "KN",
      "iso-a3": "KNA"
    }
  },
  {
    id: "RKS",
    geometry: {},
    properties: {
      continent: "Europe",
      "iso-a2": "XK",
      "iso-a3": "RKS"
    }
  },
  {
    id: "PNG",
    geometry: {},
    properties: {
      continent: "Oceania",
      "iso-a2": "PG",
      "iso-a3": "PNG"
    }
  },
  {
    id: "KGZ",
    geometry: {},
    properties: {
      continent: "Asia",
      "iso-a2": "KG",
      "iso-a3": "KGZ"
    }
  },
  {
    id: "ATG",
    geometry: {},
    properties: {
      continent: "North America",
      "iso-a2": "AG",
      "iso-a3": "ATG"
    }
  }
]

const useWorldGeoJSON = () => {
  const [state, setState] = useState({ geoJson: [], geoJsonObj: {} });

  const getGeoJson = async () => {
    if (values) {
      setState((v) => ({
        ...v,
        ...values
      }));
      return;
    }
    const myFunction = await loadFunction();
    let geoJson = myFunction() || []; // Call the dynamically imported function
    geoJson.features = [...extendedCountries, ...geoJson.features];
    setTimeout(() => {
      const geoJsonObj = geoJson?.features?.reduce((acc, val) => {
        acc[val?.properties?.["iso-a3"]] = val;
        return acc;
      }, {});
      values = {
        geoJson: geoJson?.features,
        geoJsonObj
      }
      setState((v) => ({
        ...v,
        geoJson: geoJson?.features,
        geoJsonObj
      }));
    }, 0)
  };

  useEffect(() => {
    getGeoJson();
  }, []);
  return {
    ...state
  }
}

export default useWorldGeoJSON