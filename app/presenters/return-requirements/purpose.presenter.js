'use strict'

function go (session, purposesData, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePurposes: _licencePurposes(purposesData, payload)
  }

  return data
}

// Selected licences purposes needs to be taken from the payload
function _licencePurposes (purposesData, payload) {
  const purposes = payload.purposes

  if (!purposes) {
    return purposesData
  }

  return purposes
}

module.exports = {
  go
}
