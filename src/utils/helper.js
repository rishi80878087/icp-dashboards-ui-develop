import countriesColorsMapping from "./countriesColor";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const { APPLICATION_NAME_ENGLISH, APPLICATION_NAME_ARABIC } = publicRuntimeConfig;

export const convertToCapitalCasing = (value) => {
  if (!value) return value;

  const valueWithoutUnderscores = value.replace(/_/g, " "); // Replaces underscore from value
  return valueWithoutUnderscores
    .split(" ") // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
};

export function formatNumber(
  number,
  { decimals = 0, decimalSeparator = ".", thousandsSeparator = "," } = {}
) {
  if (number === null) {
    return "-";
  }
  // Ensure the number is a finite number
  if (!isFinite(number)) {
    return number;
  }

  // Round the number to the specified number of decimal places
  const factor = Math.pow(10, decimals);
  const roundedNumber = Math.round(number * factor) / factor;

  // Convert the number to a string
  let [integerPart, decimalPart] = roundedNumber.toFixed(decimals).split(".");

  // Add thousands separators to the integer part
  integerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandsSeparator
  );

  // Combine the integer and decimal parts with the decimal separator
  return decimalPart
    ? `${integerPart}${decimalSeparator}${decimalPart}`
    : integerPart;
}

export function checkRtl(locale) {
  return locale?.projectTranslation === "ar";
}

const nameGroupMapping = {
  Passenger_Forecasting: ["PASSENGER-FORECASTING", "ADMIN"],
  Settings: ["ADMIN"],
  Name_Prediction: ["ADMIN", "NAME-PREDICTION"],
  Active_Residence: ["ADMIN", "ICP-RESIDENCE-DASHBOARD"],
  New_Active_Residence: ["ADMIN", "ICP-NEW-RESIDENCE-DASHBOARD"],
  Active_General: ["ADMIN", "ICP-GENERAL-RESIDENCE-DASHBOARD"],
  Border_Movements: ["ADMIN", "ICP-BORDER-MOVEMENTS-DASHBOARD"],
  Border_Violations: ["ADMIN", "ICP-VIOLATIONS-RISKS-DASHBOARD"],
};

export function checkAccess({ groups, pageName }) {
 
  const rolesToCheck = nameGroupMapping[pageName];
  console.log('pagename ', pageName, rolesToCheck,groups);
  return !!groups?.find((g) => {
    return !!rolesToCheck?.find((r) => g?.includes(r));
  });
}

export const continentFlagMapping = {
  All_Nationality: "/All_Nationality.png",
  Africa: "/Africa.png",
  Asia: "/Asia.png",
  Europe: "/Europe.png",
  "North America": "/North America.png",
  "South America": "/South America.png",
  Oceania: "/Oceania.png",
  "Seven seas (open ocean)": "/Seven seas (open ocean).png",
};

export const emiratesFlagMapping = {
  0: "/all_uae.png",
  8: "/all_uae.png",
  7: "/fujairah.png",
  6: "/ras_al_khaimah.png",
  5: "/umm_al_quwain.png",
  4: "/ajman.png",
  3: "/sharjah.png",
  2: "/dubai.png",
  1: "/abu_dhabi.png",
};

export const continentKeyFlagMapping = {
  all: "/All_Nationality.png",
  africa: "/Africa.png",
  asia: "/Asia.png",
  europe: "/Europe.png",
  north_america: "/North America.png",
  south_america: "/South America.png",
  oceania: "/Oceania.png",
  seven_seas: "/Seven seas (open ocean).png",
};

export const continentKeyLabelMapping = {
  all: "all",
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  north_america: "North America",
  south_america: "South America",
  oceania: "Oceania",
  seven_seas: "Seven seas (open ocean)",
};

function hashCode(str) {
  // Generate a hash from the Alpha-3 code
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash); // hash * 31 + charCode
  }
  return hash;
}

export function getColorByAlpha3(alpha3) {
  // Generate a color based on the hash of the Alpha-3 code
  if (countriesColorsMapping[alpha3]) {
    return countriesColorsMapping[alpha3];
  }
  const hash = alpha3 ? hashCode(alpha3) : 0;

  // Extract RGB values from the hash
  const r = (hash & 0xff0000) >> 16; // Red component
  const g = (hash & 0x00ff00) >> 8; // Green component
  const b = hash & 0x0000ff; // Blue component

  // Create lighter shades, focusing on red and yellow
  const lighterR = Math.min(255, Math.floor(r * 0.7 + 100)); // Lighter Red
  const lighterG = Math.min(255, Math.floor(g * 0.7 + 100)); // Lighter Green
  const lighterB = Math.min(255, Math.floor(b * 0.1)); // Keep Blue low

  // Generate a color that favors red, yellow, and green
  return `rgb(${lighterR}, ${lighterG}, ${lighterB}})`; // Favoring red and yellow
}
export const getEmirateData = (themeVariables, values = [], isRtl = false, byCode = false) => {
  const emirateCodeColorMap = {
    4: {
      code: "ae-aj",
      color: themeVariables?.token?.["magenta.6"],
    },
    2: {
      code: "ae-du",
      color: themeVariables?.token?.["cyan.6"],
    },
    3: {
      code: "ae-sh",
      color: themeVariables?.token?.["purple.5"],
    },
    6: {
      code: "ae-rk",
      color: themeVariables?.token?.["yellow.6"],
    },
    5: {
      code: "ae-uq",
      color: themeVariables?.token?.["purple.6"],
    },
    7: {
      code: "ae-fu",
      color: themeVariables?.token?.["colorWarningHover"],
    },
    1: {
      code: "ae-az",
      color: themeVariables?.token?.["blue.6"],
    },
  };
  const resObj = {};
  
  values?.forEach((value) => {
    resObj[byCode ? value?.emirate_code : value?.emirate_name_en] = {
      ...value,
      label: isRtl ? value?.emirate_name_ar : value?.emirate_name_en,
      ...emirateCodeColorMap[value?.emirate_code],
    };
  });

  return resObj;
};

export function formatNumberSuffixes(num) {
  if (num === null || num === undefined) {
    return "";
  }

  const absNum = Math.abs(num);
  let formattedNum;

  if (absNum >= 1e12) {
    formattedNum = (num / 1e12).toFixed(1) + "t"; // Trillions
  } else if (absNum >= 1e9) {
    formattedNum = (num / 1e9).toFixed(1) + "b"; // Billions
  } else if (absNum >= 1e6) {
    formattedNum = (num / 1e6).toFixed(1) + "m"; // Millions
  } else if (absNum >= 1e3) {
    formattedNum = (num / 1e3).toFixed(1) + "k"; // Thousands
  } else {
    formattedNum = num.toString(); // Less than 1000
  }

  // Remove .0 for whole numbers
  return formattedNum.replace(/\.0$/, "");
}

export function cleanObject(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && (!Array.isArray(obj[key]) || obj[key].length > 0)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}


export function validateInput(input) {
  const regex = /^(?! )[^\s]+(?: [^\s]+)* ?$/u; // Regex to match any characters with space conditions
  return regex.test(input) || !input;
}

export const setProjectTitle = (_intl, _selectedLang) => {
  let _appTitle = _intl?.['ICP']
  const isEnglish = _selectedLang === 'en'
  if(isEnglish && APPLICATION_NAME_ENGLISH) _appTitle = APPLICATION_NAME_ENGLISH
  if(!isEnglish && APPLICATION_NAME_ARABIC) _appTitle = APPLICATION_NAME_ARABIC
  document.getElementById('project-title').innerHTML=_appTitle;
}

export function resolveTernary(condition, trueVal, falseVal) {
  if (condition) {
    return trueVal;
  }
  return falseVal;
}

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && key !== "date_range" && key !== "selectedMonthTab") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export function objectToParamString(_obj = {}) {
  const obj = removeKeys(_obj || {}) || {}
  const params = Object.keys(obj).map(key => {
    const value = obj[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val)).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  // Join all parameters with '&'
  return params.join('&');
}

function interpolateColor(color1, color2, factor) {
  if (factor <= 0) return color1;
  if (factor >= 1) return color2;
  
  // Convert hex to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // Interpolate
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getColorFromPercentage({
  percent,
  minColor: _minColor = "#A9A9A9",
  softCream: _softCream = "#E3DCA8",
  midColor: _midColor = '#D6C95E',
  maxColor: _maxColor = '#816226'
}) {
  const minColor = _minColor
  const softCream = _softCream
  const midColor = _midColor
  const maxColor = _maxColor

  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  if (percent <= 30) {
    const factor = percent / 30;
    return interpolateColor(minColor, softCream, factor);
  } else if (percent <= 70) {
    const factor = (percent - 30) / 40;
    return interpolateColor(softCream, midColor, factor);
  } else {
    const factor = (percent - 70) / 30;
    return interpolateColor(midColor, maxColor, factor);
  }
}


export const getGenderOptions = (intl) => {
  return [
    {
      label: intl?.formatMessage({ id: "Male" }),
      value: "Male",
    },
    {
      label: intl?.formatMessage({ id: "Female" }),
      value: "Female",
    },
  ];
};


const colors = [
  "var(--blue-7)",
  "var(--orange-6)",
  "var(--lime-7)",
  "var(--cyan-7)",
  "var(--gold-6)",
  "var(--purple-5)",
  "var(--gold-5)",
  "var(--green-5)",
  "var(--red-6)",
  "var(--purple-2)",
  "var(--yellow-6)",
  "var(--blue-2)",
  "var(--cyan-8)",
  "var(--brand-gold-3)",
]

export function getColorByIndex(index) {
  return colors[index] || "var(--purple-5)"
}