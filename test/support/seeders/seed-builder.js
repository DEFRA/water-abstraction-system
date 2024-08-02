'use strict'

function buildSeedValueString (keys, data) {
  let valueString = ''

  data.forEach((obj, i) => {
    valueString += '('
    keys.forEach((key, index) => {
      try {
        if (key === 'createdAt' || key === 'updatedAt') {
          valueString += `'${obj[key].toISOString()}'`
        } else {
          valueString += `'${obj[key]}'`
        }

        if (index < keys.length - 1) {
          valueString += ','
        }
      } catch (e) {
        console.error('Failed: ', obj)
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
