'use strict'

/**
 * Formats data for common licence data `/licences/{id}` page's
 * @module ViewLicenceReturnsPresenter
 */

const { formatLongDate } = require('../base.presenter')

/**
 * Formats data for common licence data `/licences/{id}` page's
 *
 * @returns {Object} The data formatted for the view template
 */
function go (returnsData) {
  const returns = _formatReturnToTableRow(returnsData)

  return {
    activeTab: 'returns',
    returnsUrl: 'return/internal',
    returns
  }
}

function _formatPurpose (purpose) {
  const [firstPurpose] = purpose
  return firstPurpose.alias ? firstPurpose.alias : firstPurpose.tertiary.description
  /* Old Nunjucks converted to presenter logic
    {% macro returnRequirementPurposes(return) %}
  {% for purpose in return.returnRequirement.returnRequirementPurposes %}
  {{ ', ' if not loop.first }}
  {{ purpose.purposeAlias | titleCase if purpose.purposeAlias else purpose.purposeUse.name | titleCase }}
  {% endfor %}
  {% endmacro %}
   */
}

function _formatStatus (status) {
  if (status === 'completed') return 'COMPLETE'
  if (status === 'due') return 'OVERDUE'
  return 'NO STATUS'
}
function _formatReturnToTableRow (returns) {
  return returns.map(r => {
    return {
      id: r.id,
      reference: r.returnReference || 'No REF !!',
      purpose: _formatPurpose(r.metadata.purposes),
      dueDate: formatLongDate(new Date(r.dueDate)),
      status: _formatStatus(r.status)
    }
  })
}

module.exports = {
  go
}
