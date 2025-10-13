'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const RemoveLicencesPresenter = require('../../../../app/presenters/notices/setup/remove-licences.presenter.js')

describe('Notices - Setup - Remove licences presenter', () => {
  const licences = []
  let referenceCode
  let session

  beforeEach(() => {
    referenceCode = generateReferenceCode()

    session = {
      id: generateUUID(),
      referenceCode
    }
  })

  it('correctly presents the data', () => {
    const result = RemoveLicencesPresenter.go(licences, session)

    expect(result).to.equal({
      backLink: {
        href: `/system/notices/setup/${session.id}/check`,
        text: 'Back'
      },
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      pageTitleCaption: `Notice ${referenceCode}`,
      removeLicences: []
    })
  })
})
