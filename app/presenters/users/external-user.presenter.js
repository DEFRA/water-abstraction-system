'use strict'

const { formatLongDateTime } = require('../base.presenter.js')

/**
 * Formats data for external users on the `/users/{userId}` page
 * @module ExternalUserPresenter
 */

/**
 * Formats data for external users on the `/users/{userId}` page
 *
 * @param {module:UserModel} user - The user instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(user) {
  const { id, username } = user

  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    companies: _companies(user),
    id,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: `User ${username}`,
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
  return Object.values(normalisedCompanies).map((company) => {
    const { companyName, roles } = company
    return {
      companyName,
      mostSignificantRoleName: _mostSignificantRoleName(roles)
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

function _normalisedCompanyRoles(licenceEntityRoles) {
  return licenceEntityRoles.reduce((companies, { companyEntity, role }) => {
    const company = companies[companyEntity.id] || { companyName: companyEntity.name, roles: [] }
    company.roles.push(role)
    companies[companyEntity.id] = company
    return companies
  }, {})
}

module.exports = {
  go
}
