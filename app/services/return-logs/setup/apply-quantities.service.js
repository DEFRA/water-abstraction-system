/**
 * Recalculates the quantities and applies them to the session object
 * @module ApplyQuantitiesService
 */

import { convertFromCubicMetres, convertToCubicMetres } from '../../../lib/general.lib.js'

const METER_READINGS_METHOD = 'meterReadings'

/**
 * Recalculates the quantities and applies them to the session object
 *
 * There are several changes that can be made to the return submission that will require re-calculation of the
 * quantities saved in the session (change to UOM, change to/from meter readings etc). Therefore, whenever the user
 * revisits the check page we recalculate the quantities and update the session to ensure they are correct before
 * presenting the data.
 *
 * ## Meter readings
 *
 * When "meter readings" are used, the quantity is not directly entered by the user but calculated based on the
 * difference between the current and previous meter readings. If the meter has a x10 display, the calculated quantity
 * will be multiplied by 10.
 *
 * We start by first calculating the difference in current and previous reading. This will be the volume in the selected
 * UOM. We always display the volume in cubic metres, so next we convert this value to cubic metres. This is the value
 * we'll persist when the submission is confirmed.
 *
 * But if the UOM is not cubic metres, we also display that, and this is what `line.quantity` holds. So, to be
 * absolutely sure it represents what is _actually_ going to be submitted, we convert the calculated cubic metres value
 * back into the selected UOM and set line.quantity to this value.
 *
 * ## Absolute volumes
 *
 * When "volumes" are used the `line.quantity` is the volume in the selected UOM. So, we need to convert this to cubic
 * metres, both so we can display this to the user, but also in readiness for when the submission is confirmed.
 *
 * If the user changes the UOM during the journey, `line.quantity` remains the same, but the conversion to cubic metres
 * will be different. This is why we only calculate and set `line.quantityCubicMetres` when "volumes" is the reporting
 * method.
 *
 * @param {object} session - Session object containing the return submission data
 *
 * @returns {module:SessionModel} - The updated Session object
 */
function go(session) {
  if (session.reported === METER_READINGS_METHOD) {
    return _readingsUpdate(session)
  }

  return _volumesUpdate(session)
}

function _readingsUpdate(session) {
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

function _volumesUpdate(session) {
  session.lines.forEach((line) => {
    line.quantityCubicMetres = convertToCubicMetres(line.quantity, session.unitSymbol)
  })

  return session
}

export default {
  go
}
