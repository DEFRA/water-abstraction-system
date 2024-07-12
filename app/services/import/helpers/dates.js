'use strict'

// 21/01/2006 to 2006-01-21
function formatNaldToISO (date) {
  if (date === 'null') {
    return null
  }

  const [day, month, year] = date.split('/')

  const isoDateString = `${year}-${month}-${day}`

  if (isValidDate(isoDateString)) {
    return isoDateString
  } else {
    //  TODO: what do we want to do ? allow the top catch to log the error
    return null
  }
}

function isValidDate (dateString) {
  const date = new Date(dateString)

  // TODO: test this does not move leap year
  return !isNaN(date.getTime())
}

module.exports = {
  formatNaldToISO
}
