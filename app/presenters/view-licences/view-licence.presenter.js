'use strict'
const { format, isAfter } = require('date-fns')
const { dataFormat } = require('../../lib/static-lookups.lib.js')

/**
 * Formats the end date of the licence
 * @module ViewLicencePresenter
 */
function _endDate (licenceData) {
  if (licenceData.licence.expiredDate) {
    const expiredDate = new Date(licenceData.licence.expiredDate)
    if (!isAfter(Date.now(), expiredDate)) {
      return `${format(expiredDate, dataFormat)}`
    }
    return null
  }
  return null
}

/**
 * Formats data for the `/view-licence/{id}/` page
 * @module ViewLicencePresenter
 */
function go (licenceData) {
  const endDate = _endDate(licenceData)

  return {
    id: licenceData.licence.id,
    licenceRef: licenceData.licence.licenceRef,
    region: licenceData.licence.region.displayName,
    startDate: format(new Date(licenceData.licence.startDate), dataFormat),
    ...(endDate && { endDate })
  }
}

module.exports = {
  go
}
