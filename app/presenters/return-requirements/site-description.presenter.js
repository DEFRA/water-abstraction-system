'use strict'

function go (session, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licenceSiteDescription: _licenceSiteDescription(payload)
  }

  return data
}

function _licenceSiteDescription (payload) {
  const siteDescription = payload.siteDescription

  if (!siteDescription) {
    return null
  }

  return siteDescription
}

module.exports = {
  go
}
