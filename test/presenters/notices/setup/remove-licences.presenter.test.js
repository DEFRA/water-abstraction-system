'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesPresenter = require('../../../../app/presenters/notices/setup/remove-licences.presenter.js')

describe('Notices - Setup - Remove licences presenter', () => {
  const licences = []
  const referenceCode = 'RINV-1234'
  const sessionId = '123'

  it('correctly presents the data', () => {
    const result = RemoveLicencesPresenter.go(licences, referenceCode, sessionId)

    expect(result).to.equal({
      backLink: '/system/notices/setup/123/check',
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      pageTitleCaption: 'Notice RINV-1234',
      referenceCode,
      removeLicences: []
    })
  })
})
