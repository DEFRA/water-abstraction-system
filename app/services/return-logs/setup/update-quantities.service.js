'use strict'

/**
 * Updates the quantities saved in the session when revisiting the check page (session.checkPageVisited is true)
 * @module UpdateQuantitiesService
 */

const { convertFromCubicMetres, convertToCubicMetres } = require('../../../lib/general.lib.js')

const METER_READINGS_METHOD = 'meterReadings'

/**
 * Updates the quantities saved in the session when revisiting the check page (session.checkPageVisited is true)
 *
 * There are several changes that can be made to the return submission that will require re-calculation of the
 * quantities saved in the session (change to UOM, change to/from meter readings etc). Therefore, whenever the user
 * revisits the check page we recalculate the quantities and update the session to ensure they are correct before
 * presenting the data.
 *
 * When "volumes" are used the line.quantity is calculated from line.quantityCubicMetres in the sessions data as this
 * will always be populated with the correct volume in cubic metres. Whereas the line.quantity may require updating if
 * the UOM has been changed.
 *
 * When "meter readings" are used, the line.quantity and line.quantityCubicMetres both need to be calculated based on
 * the difference between the current and previous meter readings. If the meter has a x10 display, the calculated
 * quantity will be multiplied by 10.
 *
 * @param {object} session - Session object containing the return submission data
 *
 * @returns {Promise<module:SessionModel>} - The updated Session object
 */
async function go(session) {
  if (session.reported === METER_READINGS_METHOD) {
    return _readingsUpdate(session)
  }

  return _volumesUpdate(session)
}

async function _readingsUpdate(session) {
  const multiplier = session.meter10TimesDisplay === 'yes' ? 10 : 1
  let previousReading = session.startReading ?? 0

  session.lines.forEach((line) => {
    if (typeof line.reading === 'number') {
      const userQuantity = (line.reading - previousReading) * multiplier

      line.quantityCubicMetres = convertToCubicMetres(userQuantity, session.unitSymbol)
      line.quantity = convertFromCubicMetres(line.quantityCubicMetres, session.unitSymbol)
      previousReading = line.reading
    } else {
      // We null the quantities to ensure that any previously saved quantities are removed if the reading is now missing
      line.quantity = null
      line.quantityCubicMetres = null
    }
  })

  return session
}

async function _volumesUpdate(session) {
  session.lines.forEach((line) => {
    line.quantity = convertFromCubicMetres(line.quantityCubicMetres, session.unitSymbol)
  })

  return session
}

module.exports = {
  go
}
