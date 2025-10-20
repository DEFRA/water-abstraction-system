'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const LicenceService = require('../../../../app/services/notices/setup/licence.service.js')

describe('Notices - Setup - Licence service', () => {
  let licenceRef
  let session

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    session = await SessionHelper.add({ data: { licenceRef } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        licenceRef,
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
