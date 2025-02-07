'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesPresenter = require('../../../../app/presenters/notifications/setup/remove-licences.presenter.js')

describe('Notifications Setup - Remove licences presenter', () => {
  const licences = []

  it('correctly presents the data', () => {
    const result = RemoveLicencesPresenter.go(licences)

    expect(result).to.equal({
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      removeLicences: []
    })
  })
})
