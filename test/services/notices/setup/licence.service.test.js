'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const LicenceService = require('../../../../app/services/notices/setup/licence.service.js')

describe('Notices - Setup - Licence service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceService.go(session.id)

      expect(result).to.equal({
        backLink: `/manage`,
        activeNavBar: 'manage',
        licenceRef: '01/111',
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
