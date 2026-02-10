'use strict'

/**
 * Formats data for external users on the `/users/{userId}` page
 * @module ExternalUserPresenter
 */

const ContactModel = require('../../models/contact.model.js')

const { formatLongDateTime } = require('../base.presenter.js')

/**
 * Formats data for external users on the `/users/{userId}` page
 *
 * @param {module:UserModel} user - The user, including their related companies and the licence document headers that
 * are attached to those companies
 *
 * @returns {object} The data formatted for the view template
 */
function go(user) {
  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    companies: _companies(user),
    id: user.id,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: `User ${user.username}`,
    pageTitleCaption: 'External',
    status: user.$status()
  }
}

function _companies(user) {
  const { licenceEntity } = user

  if (!licenceEntity) {
    return []
  }

  const { licenceEntityRoles } = licenceEntity

  // A user can have multiple roles for a company, so we normalise the list by company
  const normalisedCompanies = _normalisedCompanyRoles(licenceEntityRoles)

  // We're only going to display the most significant role for each company
  return normalisedCompanies.map((company) => {
    const { companyEntity, roles } = company
    const licences = _licences(companyEntity)
    return {
      companyName: companyEntity.name,
      licences,
      mostSignificantRoleName: _mostSignificantRoleName(roles),
      showLicences: licences.length > 0
    }
  })
}

function _lastSignedIn(user) {
  const { lastLogin } = user

  if (!lastLogin) {
    return 'Never signed in'
  }

  return `Last signed in ${formatLongDateTime(lastLogin)}`
}

function _licenceHolderName(licenceDocumentHeaderMetadata) {
  // LicenceDocumentHeader metadata has the licence holder contact details, but only for licences that are currently
  // active - for expired licences, the contact details are removed from the base metadata, but are still held in
  // the `contacts` array.
  // So we need to find the contact with role 'Licence holder' to get the details we need
  const licenceHolder =
    licenceDocumentHeaderMetadata.contacts?.find((contact) => {
      return contact.role === 'Licence holder'
    }) ?? {}

  const { forename: firstName, initials, name: lastName, salutation } = licenceHolder

  return ContactModel.fromJson({ firstName, initials, lastName, salutation }).$name()
}

function _licences(companyEntity) {
  return companyEntity.licenceDocumentHeaders.map(({ licence: { id }, licenceRef, metadata }) => {
    return {
      licenceLink: `/system/licences/${id}/summary`,
      licenceRef,
      licenceHolderName: _licenceHolderName(metadata)
    }
  })
}

function _mostSignificantRoleName(roles) {
  if (roles.includes('primary_user')) {
    return 'Primary user'
  }

  if (roles.includes('user_returns')) {
    return 'Returns user'
  }

  if (roles.includes('user')) {
    return 'Agent'
  }

  return 'Unknown role'
}

/**
 * Normalises company roles into an object keyed by company entity ID.
 *
 * Company roles are returned as just a list of company and role. But we want to know the roles for each company, so
 * this function groups them by company, providing an array of companies each with an array of roles.
 *
 * @private
 */
function _normalisedCompanyRoles(licenceEntityRoles) {
  const companies = licenceEntityRoles
    .filter(({ companyEntityId }) => {
      return companyEntityId
    })
    .reduce((normalisedCompanies, licenceEntityRole) => {
      const { companyEntity, companyEntityId, role } = licenceEntityRole
      const company = normalisedCompanies[companyEntityId] || { companyEntity, roles: [] }
      company.roles.push(role)
      normalisedCompanies[companyEntityId] = company
      return normalisedCompanies
    }, {})

  return Object.values(companies)
}

module.exports = {
  go
}
