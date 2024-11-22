'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactPresenter = require('../../../../app/presenters/import/legacy/contact.presenter.js')

describe('Import Legacy Contact presenter', () => {
  let legacyContact

  beforeEach(() => {
    legacyContact = _legacyContact()
  })

  it('correctly transforms the data', () => {
    const result = ContactPresenter.go(legacyContact)

    expect(result).to.equal({
      salutation: 'Mr',
      initials: 'H',
      firstName: 'James',
      lastName: 'Bond',
      externalId: '1:007'
    })
  })
})

function _legacyContact() {
  return {
    salutation: 'Mr',
    initials: 'H',
    first_name: 'James',
    last_name: 'Bond',
    external_id: '1:007'
  }
}
