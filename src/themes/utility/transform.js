const fs = require('fs');
const path = require('path');


function resolveTernary(condition, trueVal, falseVal) {
  if (condition) {
    return trueVal;
  }
  return falseVal;
}

function hexToRgb(hex, isFormatted = false) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  // Extract the red, green, and blue component values
  let rgbRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  let result = rgbRegex.exec(hex);
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  // Return the RGB value as a string
  if (isFormatted)
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  else
    return `${r}, ${g}, ${b}`;
}

function findTextBetweenCurlyBraces(str = '', isWithDelimeter = false) {
  const regex = /\{([^}]+)\}/;
  const match = regex.exec(str);
  return resolveTernary(match, resolveTernary(isWithDelimeter, match?.[0], match?.[1]), null);
}

function getTextsBetweenCurlyBracesOrDollarSign(str, isWithDelimeter = false) {
  const regex = /(\$?\{([^{}$]+)\})|\$([a-zA-Z0-9]+)/g;
  const matches = str.match(regex);
  if (!matches) return [];
  return matches.map(match => {
    const isDollarSignMatch = /^\$([a-zA-Z0-9]+)/.test(match);
    if (!isWithDelimeter) {
      const text = isDollarSignMatch ? match.slice(1) : match.slice(1, -1);
      return text;
    } else {
      return match;
    }
  });
}

function findColorValue (variable, jsData = {}, colorPallete = {}) {
  if (colorPallete[variable]) {
    return colorPallete[variable]
  }

  const jsDataKeys = Object.keys(jsData);
  for (let index in jsDataKeys) {
    const jsDataKey = jsDataKeys[index];
    const jsObj = jsData[jsDataKey];

    const variableObj = jsObj[variable];
    if (variableObj?.value) {
      const curlyText = findTextBetweenCurlyBraces(variableObj.value)
      if (!curlyText) {
        return variableObj.value;
      } else {
        const findedColorValue = findColorValue(curlyText, jsData, colorPallete)
        if (findedColorValue) {
          const finalValue = variableObj.value?.replace(`{${curlyText}}`, variableObj.value?.includes('rgb') ? hexToRgb(findedColorValue) : findedColorValue)
          return finalValue;
        }
      }
    }
  }
}

function findValue (variable, jsData = {}) {
  const jsDataKeys = Object.keys(jsData);
  for (let index in jsDataKeys) {
    const jsDataKey = jsDataKeys[index];
    const jsObj = jsData[jsDataKey];

    const variableObj = jsObj[variable];
    if (variableObj?.value) {
      const valueText = variableObj.value;
      const curlyTexts = getTextsBetweenCurlyBracesOrDollarSign(variableObj.value)
      if (!(curlyTexts?.length)) {
        return variableObj.value;
      } else {
        const variableValues = curlyTexts?.reduce((acc, val) => {
          const findedValue = findValue(val, jsData)
          if (findedValue) {
            acc.push(findedValue);
          }
          return acc
        }, [])
        if (variableValues?.length) {
          const texts = getTextsBetweenCurlyBracesOrDollarSign(valueText, true)
          let finalValue = valueText
          texts?.forEach((t, index) => {
            finalValue = finalValue?.replace(t, variableValues[index]);
          })
          return eval(finalValue);
        }
      }
    }
  }
}

function setTokens ({ acc, obj, category, splittedKey, jsonData, component }) {
  const tokens = Object.keys(obj);
  if (component) {
    if (!acc[splittedKey[0]][category][component]) {
      acc[splittedKey[0]][category][component] = {}
    }
  }
  for (let index in tokens) {
    const token = tokens[index];
    const tokenObj = obj[token]
    if (tokenObj?.type === 'color') {
      const curlyBracesText = findTextBetweenCurlyBraces(tokenObj.value)
      if (!curlyBracesText) {
        if (component) {
          acc[splittedKey[0]][category][component][token] = tokenObj.value;
        } else {
          acc[splittedKey[0]][category][token] = tokenObj.value;
        }
      } else {
        // if non direct value

        const findedValue = findColorValue(curlyBracesText, jsonData, acc[splittedKey[0]]['colors'])
        if(findedValue) {
          const finalValue = tokenObj.value?.replace(`{${curlyBracesText}}`, tokenObj.value?.includes('rgb') ? hexToRgb(findedValue) : findedValue)
          if (component) {
            acc[splittedKey[0]][category][component][token] = finalValue;
          } else {
            acc[splittedKey[0]][category][token] = finalValue;
          }
        } else {
          // console.log('not finded value for tokenname>>>> ' + token + ' ' + tokenObj?.value + ' ' + curlyBracesText)
        }

      }
    } else if (tokenObj?.type === 'fontFamilies') {
      // do nothing
    } else if (typeof tokenObj?.type === 'string') {
      // console.log('tokenObj>>>>', tokenObj)
      try {
        const variableTexts = getTextsBetweenCurlyBracesOrDollarSign(tokenObj.value)
        if (!(variableTexts?.length)) {
          if (tokenObj?.type === 'other') {
            let val = tokenObj?.value;
            if (tokenObj?.value?.includes(': ')) {
              val = tokenObj?.value?.split(': ')?.[1]?.slice(0, tokenObj?.value?.split(': ')?.[1]?.length - 1)
            }
            if (component) {
              acc[splittedKey[0]][category][component][token] = val;
            } else {
              acc[splittedKey[0]][category][token] = val;
            }
          } else if (component) {
            acc[splittedKey[0]][category][component][token] = eval(tokenObj.value);
          } else {
            acc[splittedKey[0]][category][token] = eval(tokenObj.value);
          }
        } else {
          const variableValues = variableTexts?.reduce((acc, val) => {
            const findedValue = findValue(val, jsonData)
            if (findedValue) {
              acc.push(findedValue);
            }
            return acc
          }, [])
          if (variableValues?.length) {
            const texts = getTextsBetweenCurlyBracesOrDollarSign(tokenObj.value, true)
            let finalValue = tokenObj.value
            texts?.forEach((t, index) => {
              finalValue = finalValue?.replace(t, variableValues[index]);
            })
            if (component) {
              acc[splittedKey[0]][category][component][token] = eval(finalValue);
            } else {
              acc[splittedKey[0]][category][token] =  eval(finalValue);
            }
          }
        }
      } catch (err) {
      }
    }
  }
}

// In Json Data under light and dark first object must be for colors
function createAntTokens(jsonData) {
  return (Object.keys(jsonData) || [])?.reduce((acc, key) => {
    const splittedKey = key.split('/')
    if (!acc[splittedKey[0]]) {
      acc[splittedKey[0]] = {}
    }
    const obj = jsonData[key];
    // iterate over object only
    if (!Array.isArray(obj) && typeof obj === 'object') {
      const category = splittedKey?.[1];
      if (!acc[splittedKey[0]]?.[category]) {
        acc[splittedKey[0]][category] = {};
      }

      // create color pallete
      if (category === 'colors') {
        const colors = Object.keys(obj)
        for (let index in colors) {
          const color = colors[index];
          const colorObj = obj[color]
          for (let key in colorObj) {
            const colorValue = colorObj[key]?.value;
            acc[splittedKey[0]][category][`${color}.${key}`] = colorValue
          }
        }
      } else if (category === 'components') {
        const components = Object.keys(obj);
        for (let index in components) {
          const component = components[index];
          setTokens ({ acc, obj: obj[component], category, splittedKey, jsonData, component });
        }
      } else {
        setTokens ({ acc, obj, category, splittedKey, jsonData })
      }
    }
    return acc
  }, {})
}

function transformFigmaTokens(_inputPath, _outputPath) {
  // Read JSON data from input file path
  const inputPath = path.join(__dirname, _inputPath);
  const jsonData = fs.readFileSync(inputPath);
  // Parse JSON data into JavaScript object
  const jsData = JSON.parse(jsonData);

  const antTokens = createAntTokens(jsData);
  // Convert JavaScript object to formatted JSON string
  const jsString = `export const tokens = ${JSON.stringify(antTokens, null, 2)};`;

  const outputPath = path.join(__dirname, _outputPath);
  // Write JavaScript string to output file path
  fs.writeFileSync(outputPath, jsString);
}

const tokenConfig = [
  { input: './jsons/token.json', output: './tokens/antToken.js' },
  { input: './jsons/tokenDark.json', output: './tokens/antTokenDark.js' },
]

for (let index = 0; index <= tokenConfig?.length; index += 1) {
  transformFigmaTokens(tokenConfig[index]?.input, tokenConfig[index]?.output)
}
