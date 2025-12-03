'use strict'

const RegionHelper = require('../support/helpers/region.helper.js')
const { generateNoticeReferenceCode, generateUUID } = require('../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateReference } = require('../support/helpers/return-requirement.helper.js')
const { NoticeJourney, NoticeType, NoticeTypes } = require('../../app/lib/static-lookups.lib.js')

/**
 * Creates an abstraction alert stop notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 *
 * @returns {object} The notice setup session fixture
 */
function abstractionAlertStop(licenceRef = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('WAA-')

  const licenceMonitoringStations = [
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 10,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      id: generateUUID(),
      latestNotification: null,
      licence: {
        id: generateUUID(),
        licenceRef
      },
      measureType: 'flow',
      notes: null,
      restrictionType: 'stop',
      thresholdGroup: 'flow-50-m3/s',
      thresholdValue: 50,
      thresholdUnit: 'm3/s'
    },
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 10,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      id: generateUUID(),
      latestNotification: null,
      licence: {
        id: generateUUID(),
        licenceRef
      },
      measureType: 'flow',
      notes: null,
      restrictionType: 'stop',
      thresholdGroup: 'flow-500-Ml/d',
      thresholdValue: 500,
      thresholdUnit: 'Ml/d'
    }
  ]

  return {
    alertEmailAddress: 'admin-internal@wrls.gov.uk',
    alertEmailAddressType: 'username',
    alertThresholds: ['flow-50-m3/s', 'flow-500-Ml/d'],
    alertType: 'stop',
    id,
    licenceRefs: [licenceRef],
    licenceMonitoringStations,
    journey: NoticeJourney.ALERTS,
    monitoringStationId: generateUUID(),
    monitoringStationName: 'DEATH STAR',
    monitoringStationRiverName: '',
    name: 'Water abstraction alert',
    noticeType: NoticeType.ABSTRACTION_ALERTS,
    notificationType: NoticeTypes[NoticeType.ABSTRACTION_ALERTS].notificationType,
    referenceCode,
    relevantLicenceMonitoringStations: [licenceMonitoringStations[0]],
    removedThresholds: [],
    subType: NoticeTypes[NoticeType.ABSTRACTION_ALERTS].subType
  }
}

/**
 * Creates an ad-hoc invitation notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 *
 * @returns {object} The notice setup session fixture
 */
function adHocInvitation(licenceRef = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('RINV-')

  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/notices/setup/${id}/contact-type`,
        text: 'Back'
      },
      redirectUrl: `/system/notices/setup/${id}/add-recipient`,
      activeNavBar: 'notices',
      pageTitleCaption: `Notice ${referenceCode}`
    },
    checkPageVisited: true,
    dueReturns: [_generateReturnLog(licenceRef)],
    id,
    journey: NoticeJourney.ADHOC,
    licenceRef,
    name: 'Returns: invitation',
    noticeType: NoticeType.INVITATIONS,
    notificationType: NoticeTypes[NoticeType.INVITATIONS].notificationType,
    referenceCode,
    subType: NoticeTypes[NoticeType.INVITATIONS].subType
  }
}

/**
 * Creates an ad-hoc reminder notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 *
 * @returns {object} The notice setup session fixture
 */
function adHocReminder(licenceRef = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('RREM-')

  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/notices/setup/${id}/contact-type`,
        text: 'Back'
      },
      redirectUrl: `/system/notices/setup/${id}/add-recipient`,
      activeNavBar: 'notices',
      pageTitleCaption: `Notice ${referenceCode}`
    },
    checkPageVisited: true,
    dueReturns: [_generateReturnLog(licenceRef)],
    id,
    journey: NoticeJourney.ADHOC,
    licenceRef,
    name: 'Returns: reminder',
    noticeType: NoticeType.REMINDERS,
    notificationType: NoticeTypes[NoticeType.REMINDERS].notificationType,
    referenceCode,
    subType: NoticeTypes[NoticeType.REMINDERS].subType
  }
}

/**
 * Creates a paper return notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 * @param {string|null} [selectedReturnLog=null] - The return log to include in `dueReturns` and marked as the selected
 * return
 *
 * @returns {object} The notice setup session fixture
 */
function paperReturn(licenceRef = null, selectedReturnLog = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('PRTF-')
  const dueReturn = selectedReturnLog ? _transformReturnLog(selectedReturnLog) : _generateReturnLog(licenceRef)

  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/notices/setup/${id}/contact-type`,
        text: 'Back'
      },
      redirectUrl: `/system/notices/setup/${id}/add-recipient`,
      activeNavBar: 'notices',
      pageTitleCaption: `Notice ${referenceCode}`
    },
    checkPageVisited: true,
    dueReturns: [dueReturn],
    id,
    journey: NoticeJourney.ADHOC,
    licenceRef,
    name: 'Paper returns',
    noticeType: NoticeType.PAPER_RETURN,
    notificationType: NoticeTypes[NoticeType.PAPER_RETURN].notificationType,
    referenceCode,
    selectedReturns: [dueReturn.returnId],
    subType: NoticeTypes[NoticeType.PAPER_RETURN].subType
  }
}

/**
 * Creates a standard invitation notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 *
 * @returns {object} The notice setup session fixture
 */
function standardInvitation(licenceRef = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('RINV-')

  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/notices/setup/${id}/contact-type`,
        text: 'Back'
      },
      redirectUrl: `/system/notices/setup/${id}/add-recipient`,
      activeNavBar: 'notices',
      pageTitleCaption: `Notice ${referenceCode}`
    },
    checkPageVisited: true,
    determinedReturnsPeriod: {
      name: 'allYear',
      summer: 'false',
      dueDate: null,
      endDate: '2025-03-31T00:00:00.000Z',
      quarterly: false,
      startDate: '2024-04-01T00:00:00.000Z'
    },
    id,
    journey: NoticeJourney.STANDARD,
    licenceRef,
    name: 'Returns: invitation',
    noticeType: NoticeType.INVITATIONS,
    notificationType: NoticeTypes[NoticeType.INVITATIONS].notificationType,
    referenceCode,
    returnsPeriod: 'allYear',
    subType: NoticeTypes[NoticeType.INVITATIONS].subType
  }
}

/**
 * Creates a standard reminder notice setup session fixture for testing purposes
 *
 * This represents the session at the point the `/check` page has been reached. To represent earlier pages you may need
 * to remove properties
 *
 * @param {string|null} [licenceRef=null] - The licence reference. If not provided, one will be generated
 *
 * @returns {object} The notice setup session fixture
 */
function standardReminder(licenceRef = null) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const id = generateUUID()
  const referenceCode = generateNoticeReferenceCode('RREM-')

  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/notices/setup/${id}/contact-type`,
        text: 'Back'
      },
      redirectUrl: `/system/notices/setup/${id}/add-recipient`,
      activeNavBar: 'notices',
      pageTitleCaption: `Notice ${referenceCode}`
    },
    checkPageVisited: true,
    determinedReturnsPeriod: {
      name: 'allYear',
      summer: 'false',
      dueDate: null,
      endDate: '2025-03-31T00:00:00.000Z',
      quarterly: false,
      startDate: '2024-04-01T00:00:00.000Z'
    },
    id,
    journey: NoticeJourney.STANDARD,
    licenceRef,
    name: 'Returns: reminder',
    noticeType: NoticeType.REMINDERS,
    notificationType: NoticeTypes[NoticeType.REMINDERS].notificationType,
    referenceCode,
    returnsPeriod: 'allYear',
    subType: NoticeTypes[NoticeType.REMINDERS].subType
  }
}

function _generateReturnLog(licenceRef) {
  const returnReference = generateReference()
  const region = RegionHelper.select()

  return {
    dueDate: null,
    endDate: '2025-03-31T00:00:00.000Z',
    naldAreaCode: 'MIDLT',
    purpose: 'Spray Irrigation - Direct',
    regionCode: region.naldRegionId,
    regionName: region.name,
    returnId: generateUUID(),
    returnLogId: `v1:2:${licenceRef}:${returnReference}:2024-04-01:2025-03-31`,
    returnReference,
    returnsFrequency: 'month',
    siteDescription: 'Death star trench',
    startDate: '2024-04-01T00:00:00.000Z',
    twoPartTariff: false
  }
}

function _transformReturnLog(returnLog) {
  const region = RegionHelper.select()
  const { description, nald, isTwoPartTariff } = returnLog.metadata

  return {
    dueDate: returnLog.dueDate ? returnLog.dueDate.toISOString() : null,
    endDate: returnLog.endDate.toISOString(),
    naldAreaCode: nald.areaCode,
    purpose: 'Spray Irrigation - Direct',
    regionCode: nald.regionCode,
    regionName: region.name,
    returnId: returnLog.returnId,
    returnLogId: returnLog.id,
    returnReference: returnLog.returnReference,
    returnsFrequency: returnLog.returnsFrequency,
    siteDescription: description,
    startDate: returnLog.startDate.toISOString(),
    twoPartTariff: isTwoPartTariff
  }
}

module.exports = {
  abstractionAlertStop,
  adHocInvitation,
  adHocReminder,
  paperReturn,
  standardInvitation,
  standardReminder
}
