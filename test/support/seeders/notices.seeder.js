'use strict'

const { generateRandomInteger } = require('../../../app/lib/general.lib.js')
const EventHelper = require('../helpers/event.helper.js')

/**
 * Seeds notices for the notice tests
 *
 * @returns {Promise<object>} An object containing references to all the seeded notices
 */
async function seed() {
  const fromDateEvent = await _fromDateEvent()
  const legacyEvent = await _legacyEvent()
  const resumeAlertEvent = await _resumeAlertEvent()
  const sentByEvent = await _sentByEvent()
  const stopAlertEvent = await _stopAlertEvent()

  return {
    fromDateEvent,
    legacyEvent,
    resumeAlertEvent,
    sentByEvent,
    stopAlertEvent
  }
}

async function _resumeAlertEvent() {
  const data = _defaults()

  data.subtype = 'waterAbstractionAlerts'
  data.metadata.name = 'Water abstraction alert'
  data.metadata.options.sendingAlertType = 'resume'

  return EventHelper.add(data)
}

function _defaults() {
  return {
    createdAt: new Date('2025-03-25'),
    issuer: 'billing.data@wrls.gov.uk',
    metadata: {
      name: 'Returns: invitation',
      sent: 7218,
      error: 34,
      options: {
        excludeLicences: []
      },
      recipients: 7252
    },
    status: 'sent',
    subtype: 'returnInvitation',
    type: 'notification'
  }
}

async function _fromDateEvent() {
  const data = _defaults()

  data.referenceCode = `RINV-${generateRandomInteger(100000, 999999)}`
  data.createdAt = new Date('2025-04-12')

  return EventHelper.add(data)
}

async function _legacyEvent() {
  const data = _defaults()

  data.referenceCode = `HOF-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'hof-stop'

  return EventHelper.add(data)
}

async function _sentByEvent() {
  const data = _defaults()

  data.referenceCode = `RINV-${generateRandomInteger(100000, 999999)}`
  data.issuer = 'area.team@wrls.gov.uk'

  return EventHelper.add(data)
}

async function _stopAlertEvent() {
  const data = _defaults()

  data.referenceCode = `WAA-${generateRandomInteger(100000, 999999)}`
  data.subtype = 'waterAbstractionAlerts'
  data.metadata.name = 'Water abstraction alert'
  data.metadata.options.sendingAlertType = 'stop'

  return EventHelper.add(data)
}

module.exports = {
  seed
}
