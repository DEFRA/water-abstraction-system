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
const CancelService = require('../../../../app/services/notices/setup/cancel.service.js')

describe('Notices - Setup - Cancel service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111', referenceCode: 'ADHC-1234', journey: 'ad-hoc' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CancelService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/check`,
        pageTitle: 'You are about to cancel this notice',
        referenceCode: 'ADHC-1234',
        summaryList: {
          text: 'Licence number',
          value: '01/111'
        }
      })
    })
  })
})
