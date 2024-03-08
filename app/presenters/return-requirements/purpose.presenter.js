'use strict'

function go (session, _purposesData, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePurposes: _licencePurposes(_purposesData, payload)
  }

  return data
}
// Selected licences purposes needs to be taken from the payload
function _licencePurposes (_purposesData, payload) {
  const purposes = payload.purposes

  if (!purposes) {
    return _purposesData
  }

  return purposes
}
module.exports = {
  go
}
