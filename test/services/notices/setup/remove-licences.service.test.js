'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const RemoveLicencesService = require('../../../../app/services/notices/setup/remove-licences.service.js')

describe('Notices - Setup - Remove licences service', () => {
  const licences = []

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licences, referenceCode: 'RINV-1234' } })
  })

  it('correctly presents the data', async () => {
    const result = await RemoveLicencesService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      backLink: 'check',
      caption: 'Notice RINV-1234',
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      removeLicences: []
    })
  })
})
