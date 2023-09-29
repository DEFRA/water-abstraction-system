'use strict'

async function go (id) {
  const mockedReturnReviewData = {
    id: '83a67627-f523-4a0b-8875-24e990d1c89c',
    name: 'boo',
    otherId: id
  }

  return _response(mockedReturnReviewData)
}

function _response (mockedReturnReviewData) {
  return mockedReturnReviewData
}

module.exports = {
  go
}
