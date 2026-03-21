'use strict'

/**
 * Formats data for the '/company-contacts/{id}' page
 * @module ViewCompanyContactPresenter
 */

const NotificationsTablePresenter = require('../notifications/notifications-table.presenter.js')

/**
 * Formats data for the '/company-contacts/{id}' page
 *
 * @param {module:CompanyModel} company - The customer from the companies table
 * @param {module:CompanyContactModel} companyContact - The customer contact from the company contacts table
 * @param {module:NotificationModel[]} notifications - All notifications linked to the company contact email address
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, companyContact, notifications) {
  return {
    backLink: {
      href: `/system/companies/${company.id}/contacts`,
      text: 'Go back to licence holder contacts'
    },
    notifications: NotificationsTablePresenter.go(notifications, null, null, companyContact.id),
    pageTitle: `Communications for ${companyContact.contact.$name()}`,
    pageTitleCaption: company.name
  }
}

module.exports = {
  go
}
