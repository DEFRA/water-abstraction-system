/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 * @module ReturnsPresenter
 */

import { formatLongDate, formatReturnLogStatus } from 'water-abstraction-engine/presenters/base.presenter.js'

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 *
 * @param {module:ReturnLogModel[]} returnLogs - The results from `FetchLicenceReturnsService` to be formatted
 * @param {boolean} hasRequirements - True if the licence has return requirements else false
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
export default function returnsPresenter(returnLogs, hasRequirements, licence) {
  const returns = _returns(returnLogs)

  const { licenceRef } = licence

  const hasReturns = returns.length > 0

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    returns,
    noReturnsMessage: _noReturnsMessage(hasReturns, hasRequirements),
    pageTitle: 'Returns',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _formatPurposes(purposes) {
  return purposes.map((purpose) => {
    const { alias, description } = purpose

    // If no alias set just return the description
    if (!alias) {
      return description
    }

    const duplication = alias.trim().toLowerCase() === description.trim().toLowerCase()

    // If the alias is just a duplication of the purpose description, there is no point in overloading the display with
    // the duplication. So, we just return the purpose's description.
    if (duplication) {
      return description
    }

    return `${description} (${alias})`
  })
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
    const { endDate, dueDate, id: returnLogId, purposes, returnReference, siteDescription, startDate } = returnLog

    return {
      dates: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
      description: siteDescription ?? '',
      dueDate: dueDate ? formatLongDate(new Date(dueDate)) : '',
      link: `/system/return-logs/${returnLogId}/details`,
      purposes: _formatPurposes(purposes),
      reference: returnReference,
      status: formatReturnLogStatus(returnLog)
    }
  })
}
