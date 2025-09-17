'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const RemoveLicencesPresenter = require('../../../../app/presenters/notices/setup/remove-licences.presenter.js')

describe('Notices - Setup - Remove licences presenter', () => {
  const licences = []
  const referenceCode = generateReferenceCode()

  it('correctly presents the data', () => {
    const result = RemoveLicencesPresenter.go(licences, referenceCode)

    expect(result).to.equal({
      backLink: 'check',
      caption: 'Notice RINV-1234',
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      removeLicences: []
    })
  })
})
