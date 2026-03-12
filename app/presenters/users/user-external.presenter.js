'use strict'

/**
 * Formats data for external users on the `/users/external/{id}` page
 * @module UserExternalPresenter
 */

const ContactModel = require('../../models/contact.model.js')

const { formatLongDateTime, formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for external users on the `/users/external/{id}` page
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

  const { licenceEntityRoles, userVerifications } = licenceEntity

  // A user can have multiple roles for a company, so we normalise the list by company
  const normalisedCompanyRoles = _normalisedCompanyRoles(licenceEntityRoles)

  // A user can potentially have multiple verifications for a company, so we normalise the list by company
  const normalisedCompanyVerifications = _normalisedCompanyVerifications(userVerifications)

  // We need to include all companies, whether the user has roles, verifications or both for that company, so we need a
  // combined list of company IDs from both the roles and the verifications
  const companyIds = [
    ...new Set([...Object.keys(normalisedCompanyRoles), ...Object.keys(normalisedCompanyVerifications)])
  ]

  return companyIds.map((companyId) => {
    return _company(companyId, normalisedCompanyRoles, normalisedCompanyVerifications)
  })
}

function _company(companyId, normalisedCompanyRoles, normalisedCompanyVerifications) {
  const { companyEntity } = normalisedCompanyRoles[companyId] || normalisedCompanyVerifications[companyId]
  const { roles } = normalisedCompanyRoles[companyId] || { roles: [] }
  const { verifications } = normalisedCompanyVerifications[companyId] || { verifications: [] }
  const licences = _licences(companyEntity.licenceDocumentHeaders)

  return {
    companyName: companyEntity.name,
    licences,
    mostSignificantRoleName: _mostSignificantRoleName(roles),
    showLicences: licences.length > 0,
    verifications
  }
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

function _licences(licenceDocumentHeaders = []) {
  return licenceDocumentHeaders.map(({ licence: { id }, licenceRef, metadata }) => {
    return {
      licenceLink: `/system/licences/${id}/summary`,
      licenceRef,
      licenceHolderName: _licenceHolderName(metadata)
    }
  })
}

function _mostSignificantRoleName(roles = []) {
  if (roles.length === 0) {
    return 'No role'
  }

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
function _normalisedCompanyRoles(licenceEntityRoles = []) {
  const companies = licenceEntityRoles
    .filter(({ companyEntity }) => {
      return companyEntity
    })
    .reduce((normalisedCompanies, licenceEntityRole) => {
      const { companyEntity, role } = licenceEntityRole
      const company = normalisedCompanies[companyEntity.id] || { companyEntity, roles: [] }
      company.roles.push(role)
      normalisedCompanies[companyEntity.id] = company
      return normalisedCompanies
    }, {})

  return companies
}

/**
 * Normalises company verifications into an object keyed by company entity ID.
 *
 * Company verifications are returned as just a list of company and verification. But we want to know the verifications
 * for each company, groups them by company, providing an array of companies each with an array of verifications.
 *
 * @private
 */
function _normalisedCompanyVerifications(userVerifications = []) {
  const companies = userVerifications.reduce((normalisedCompanies, userVerification) => {
    const { companyEntity, createdAt, verificationCode } = userVerification
    const sent = formatLongDate(createdAt)
    const licences = _licences(userVerification.licenceDocumentHeaders)
    const company = normalisedCompanies[companyEntity.id] || { companyEntity, verifications: [] }
    company.verifications.push({ licences, sent, verificationCode })
    normalisedCompanies[companyEntity.id] = company
    return normalisedCompanies
  }, {})

  return companies
}

module.exports = {
  go
}
