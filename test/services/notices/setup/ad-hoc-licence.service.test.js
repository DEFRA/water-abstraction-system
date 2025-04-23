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
const AdHocLicenceService = require('../../../../app/services/notices/setup/ad-hoc-licence.service.js')

describe('Notices - Setup - Ad Hoc Licence service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111', referenceCode: 'ADHC-1234' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AdHocLicenceService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        licenceRef: '01/111',
        pageTitle: 'Enter a licence number',
        referenceCode: 'ADHC-1234'
      })
    })
  })
})
