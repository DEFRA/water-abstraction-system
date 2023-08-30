'use strict'

/**
 * Used to generate a 'friendly' response from TwoPartService that better matches the UI
 * @module FriendlyResponseService
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../presenters/base.presenter.js')

function go (billingPeriod, matchedChargeVersions) {
  const response = {
    note: 'This response aims to match the UI. Note this means the entity names and structure DO NOT match what is in the DB.',
    billingPeriod: {
      startDate: formatLongDate(billingPeriod.startDate),
      endDate: formatLongDate(billingPeriod.endDate)
    },
    licences: []
  }

  _formatFriendlyLicences(response.licences, matchedChargeVersions)

  return response
}

function _formatFriendlyLicences (licences, matchedChargeVersions) {
  matchedChargeVersions.forEach((matchedChargeVersion) => {
    const { licenceId, licenceRef, chargeVersions, returnsStatuses, returnsReady } = matchedChargeVersion

    const friendlyLicence = {
      id: licenceId,
      licenceRef,
      returnsStatuses,
      returnsReady,
      chargeInformations: []
    }

    _formatFriendlyChargeInformation(friendlyLicence.chargeInformations, chargeVersions)

    licences.push(friendlyLicence)
  })
}

function _formatFriendlyChargeInformation (chargeInformations, chargeVersions) {
  chargeVersions.forEach((chargeVersion) => {
    const { chargeVersionId, status, startDate, endDate, chargeElements } = chargeVersion
    const friendlyChargeInformation = {
      id: chargeVersionId,
      status,
      startDate,
      endDate,
      chargeReferences: []
    }

    _formatFriendlyChargeReferences(friendlyChargeInformation.chargeReferences, chargeElements)

    chargeInformations.push(friendlyChargeInformation)
  })
}

function _formatFriendlyChargeReferences (chargeReferences, chargeElements) {
  chargeElements.forEach((chargeElement) => {
    const {
      additionalCharges,
      adjustments,
      billingChargeCategory,
      chargeElementId,
      chargePurposes,
      description,
      eiucRegion,
      isRestrictedSource,
      loss,
      returns,
      source,
      volume,
      waterModel
    } = chargeElement

    const formattedAdditionalCharges = _formatAdditionalCharges(additionalCharges)
    const formattedAdjustments = _formatAdjustments(adjustments)

    const friendlyChargeReference = {
      id: chargeElementId,
      chargeReference: billingChargeCategory.reference,
      chargeDescription: billingChargeCategory.shortDescription,
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
    _formatFriendlyChargeElements(friendlyChargeReference.chargeElements, chargePurposes)

    chargeReferences.push(friendlyChargeReference)
  })
}

function _formatFriendlyChargeElements (chargeElements, chargePurposes) {
  chargePurposes.forEach((chargePurpose) => {
    const {
      authorisedAnnualQuantity,
      chargePurposeId,
      description,
      isSection127AgreementEnabled,
      loss,
      purposesUse,
      timeLimitedStartDate,
      timeLimitedEndDate,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth
    } = chargePurpose
    const friendlyChargeElement = {
      id: chargePurposeId,
      description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      annualQuantities: authorisedAnnualQuantity,
      timeLimit: _formatTimeLimit(timeLimitedStartDate, timeLimitedEndDate),
      loss
    }

    if (isSection127AgreementEnabled) {
      friendlyChargeElement.twoPartTariffAgreementsApply = 'Yes, two-part tariff agreements should apply to this element'
    }

    friendlyChargeElement.legacyId = purposesUse.legacyId

    chargeElements.push(friendlyChargeElement)
  })
}

function _formatFriendlyReturns (returns, matchedReturns) {
  matchedReturns.forEach((matchedReturn) => {
    const { returnId, endDate, metadata, startDate, status } = matchedReturn

    const { periodEndDay, periodEndMonth, periodStartDay, periodStartMonth } = metadata.nald

    const friendlyReturn = {
      id: returnId,
      siteDescription: _titleCaseAllWords(metadata.description),
      purpose: _formatPurpose(metadata.purposes[0]),
      returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
      twoPartTariff: metadata.isTwoPartTariff,
      status,
      code: metadata.purposes[0].tertiary.code
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
