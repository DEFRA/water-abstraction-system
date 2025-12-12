'use strict'

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 * @module ReturnsPresenter
 */

const { formatLongDate, formatPurposes, formatReturnLogStatus } = require('../base.presenter.js')
const { defaultPageSize } = require('../../../config/database.config.js')

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 *
 * @param {module:ReturnLogModel[]} returnLogs - The results from `FetchLicenceReturnsService` to be formatted
 * @param {boolean} hasRequirements - True if the licence has return requirements else false
 * @param {object} licence - The id and licence ref of the licence
 * @param {number} totalReturns - the total returns from the pagination object
 *
 * @returns {object} The data formatted for the view template
 */
function go(returnLogs, hasRequirements, licence, totalReturns) {
  const returns = _returns(returnLogs)

  const { licenceRef } = licence

  const hasReturns = returns.length > 0

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    returns,
    noReturnsMessage: _noReturnsMessage(hasReturns, hasRequirements),
    pageTitle: 'Returns',
    pageTitleCaption: `Licence ${licenceRef}`,
    tableCaption: _tableCaption(totalReturns, returns.length)
  }
}

function _noReturnsMessage(hasReturns, hasRequirements) {
  if (!hasReturns && !hasRequirements) {
    return 'No requirements for returns have been set up for this licence.'
  }

  if (hasRequirements && !hasReturns) {
    return 'No returns for this licence.'
  }

  return null
}

function _returns(returns) {
  return returns.map((returnLog) => {
    const { endDate, dueDate, metadata, returnId, returnReference, startDate } = returnLog

    return {
      dates: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
      description: metadata.description === 'null' ? '' : metadata.description,
      dueDate: dueDate ? formatLongDate(new Date(dueDate)) : '',
      link: `/system/return-logs/${returnId}`,
      purpose: formatPurposes(metadata.purposes),
      reference: returnReference,
      status: formatReturnLogStatus(returnLog)
    }
  })
}

function _tableCaption(totalAmount, currentAmount) {
  if (totalAmount > defaultPageSize) {
    return `Showing ${currentAmount} of ${totalAmount} returns`
  }

  return `Showing all ${totalAmount} returns`
}

module.exports = {
  go
}
