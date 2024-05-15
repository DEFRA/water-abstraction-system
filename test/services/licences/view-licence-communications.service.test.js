'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceCommunicationsService = require('../../../app/services/licences/view-licence-communications.service.js')

describe('View Licence Communications service', () => {
  const auth = {}
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake licence' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceCommunicationsService.go(testId, auth)

      expect(result).to.equal({
        activeTab: 'communications',
        communications: [],
        licenceName: 'fake licence'
      })
    })
  })
})
