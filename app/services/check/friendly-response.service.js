'use strict'

/**
 * Used to generate a 'friendly' response from TwoPartService that better matches the UI
 * @module FriendlyResponseService
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../presenters/base.presenter.js')

function go (billingPeriod, responseData) {
  const response = {
    note: 'This response aims to match the UI. Note this means the structure DOES NOT match what is in the DB.',
    billingPeriod: {
      startDate: formatLongDate(billingPeriod.startDate),
      endDate: formatLongDate(billingPeriod.endDate)
    },
    licences: []
  }

  _formatFriendlyLicences(response.licences, responseData)

  return response
}

function _formatFriendlyLicences (licences, responseData) {
  responseData.forEach((licence) => {
    const { licenceId, licenceRef, chargeVersions, returnsStatuses, returnsReady } = licence

    const friendlyLicence = {
      id: licenceId,
      licenceRef,
      returnsStatuses,
      returnsReady,
      chargeVersions: []
    }

    _formatFriendlyChargeVersion(friendlyLicence.chargeVersions, chargeVersions)

    licences.push(friendlyLicence)
  })
}

function _formatFriendlyChargeVersion (friendlyChargeVersions, chargeVersions) {
  chargeVersions.forEach((chargeVersion) => {
    const { chargeVersionId, status, startDate, endDate, chargeReferences } = chargeVersion
    const friendlyChargeVersion = {
      id: chargeVersionId,
      status,
      startDate,
      endDate,
      chargeReferences: []
    }

    _formatFriendlyChargeReferences(friendlyChargeVersion.chargeReferences, chargeReferences)

    friendlyChargeVersions.push(friendlyChargeVersion)
  })
}

function _formatFriendlyChargeReferences (friendlyChargeReferences, chargeReferences) {
  chargeReferences.forEach((chargeReference) => {
    const {
      additionalCharges,
      adjustments,
      chargeCategory,
      chargeElementId,
      chargeElements,
      description,
      eiucRegion,
      isRestrictedSource,
      loss,
      returns,
      source,
      volume,
      waterModel
    } = chargeReference

    const formattedAdditionalCharges = _formatAdditionalCharges(additionalCharges)
    const formattedAdjustments = _formatAdjustments(adjustments)

    const friendlyChargeReference = {
      id: chargeElementId,
      chargeReference: chargeCategory.reference,
      chargeDescription: chargeCategory.shortDescription,
      description,
      source,
      loss,
      volume,
      waterAvailability: _formatWaterAvailability(isRestrictedSource),
      waterModel,
      additionalChargesApply: (Object.keys(formattedAdditionalCharges).length > 0),
      adjustmentsApply: (Object.keys(formattedAdjustments).length > 0),
      eiucRegion,
      additionalCharges: formattedAdditionalCharges,
      adjustments: formattedAdjustments,
      chargeElements: [],
      returns: []
    }

    _formatFriendlyReturns(friendlyChargeReference.returns, returns)
    _formatFriendlyChargeElements(friendlyChargeReference.chargeElements, chargeElements)

    friendlyChargeReferences.push(friendlyChargeReference)
  })
}

function _formatFriendlyChargeElements (friendlyChargeElements, chargeElements) {
  chargeElements.forEach((chargeElement) => {
    const {
      authorisedAnnualQuantity,
      billableAnnualQuantity,
      chargePurposeId,
      description,
      isSection127AgreementEnabled,
      loss,
      purpose,
      timeLimitedStartDate,
      timeLimitedEndDate,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth
    } = chargeElement
    const friendlyChargeElement = {
      id: chargePurposeId,
      description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      authorisedAnnualQuantity,
      billableAnnualQuantity,
      timeLimit: _formatTimeLimit(timeLimitedStartDate, timeLimitedEndDate),
      loss
    }

    if (isSection127AgreementEnabled) {
      friendlyChargeElement.twoPartTariffAgreementsApply = 'Yes, two-part tariff agreements should apply to this element'
    }

    friendlyChargeElement.legacyId = purpose.legacyId

    friendlyChargeElements.push(friendlyChargeElement)
  })
}

function _formatFriendlyReturns (returns, matchedReturns) {
  matchedReturns.forEach((matchedReturn) => {
    const { returnId, endDate, metadata, startDate, status, volumes } = matchedReturn

    const { periodEndDay, periodEndMonth, periodStartDay, periodStartMonth } = metadata.nald

    const friendlyReturn = {
      id: returnId,
      siteDescription: _titleCaseAllWords(metadata.description),
      purpose: _formatPurpose(metadata.purposes[0]),
      returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
      twoPartTariff: metadata.isTwoPartTariff,
      status,
      code: metadata.purposes[0].tertiary.code,
      volumes
    }

    returns.push(friendlyReturn)
  })
}

function _formatAdditionalCharges (additionalCharges) {
  const friendlyAdditionalCharges = {}

  if (!additionalCharges) {
    return friendlyAdditionalCharges
  }

  if (additionalCharges.supportedSource) {
    friendlyAdditionalCharges.supportedSource = true
    friendlyAdditionalCharges.supportedSourceName = additionalCharges.supportedSource.name
  } else {
    friendlyAdditionalCharges.supportedSource = false
  }

  friendlyAdditionalCharges.supplyPublicWater = !!additionalCharges.isSupplyPublicWater

  return friendlyAdditionalCharges
}

function _formatAdjustments (adjustments) {
  const friendlyAdjustments = {}

  if (!adjustments) {
    return friendlyAdjustments
  }

  if (adjustments.aggregate) {
    friendlyAdjustments.aggregateFactor = Number(adjustments.aggregate)
  }

  if (adjustments.charge) {
    friendlyAdjustments.adjustmentFactor = Number(adjustments.charge)
  }

  if (adjustments.winter) {
    friendlyAdjustments.winter = !!adjustments.winter
  }

  if (adjustments.s127) {
    friendlyAdjustments.twoPartTariffAgreement = !!adjustments.s127
  }

  if (adjustments.s126) {
    friendlyAdjustments.abatementAgreement = Number(adjustments.s126)
  }

  if (adjustments.s130) {
    friendlyAdjustments.canalAndRiverTrustAgreement = !!adjustments.s130
  }

  return friendlyAdjustments
}

function _formatPurpose (purpose) {
  if (purpose.alias) {
    return _titleCaseAllWords(purpose.alias)
  }

  return _titleCaseAllWords(purpose.tertiary.description)
}

function _formatTimeLimit (startDate, endDate) {
  if (!startDate) {
    return 'No'
  }

  return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
}

function _formatWaterAvailability (isRestrictedSource) {
  if (isRestrictedSource) {
    return 'Restricted availablity or no availability'
  }

  return 'Available'
}

function _titleCaseAllWords (stringToBeTitleCased) {
  const lowercaseWords = stringToBeTitleCased.toLowerCase().split(' ')

  const titleCaseWords = lowercaseWords.reduce((words, lowercaseWord) => {
    // If stringToBeTitleCased contains a double space it will cause the title casing to crash
    if (lowercaseWord.trim() !== '') {
      const titleCasedWord = `${lowercaseWord[0].toUpperCase()}${lowercaseWord.slice(1)}`
      words.push(titleCasedWord)
    }

    return words
  }, [])

  return titleCaseWords.join(' ')
}

module.exports = {
  go
}
