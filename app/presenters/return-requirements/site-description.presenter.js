'use strict'

function go (session) {
  const data = {
    id: session.id,
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
