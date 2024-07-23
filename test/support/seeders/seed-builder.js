'use strict'

function buildSeedValueString (keys, data) {
  let valueString = ''

  data.forEach((obj, i) => {
    valueString += '('
    keys.forEach((key, index) => {
      valueString += `'${obj[key]}'`

      if (index < keys.length - 1) {
        valueString += ','
      }
    })

    valueString += ')'

    if (i < data.length - 1) {
      valueString += ','
    }
  })

  return valueString
}

module.exports = {
  buildSeedValueString
}
