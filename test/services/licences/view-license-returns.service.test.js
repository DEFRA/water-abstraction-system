'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewLicenceService = require('../../../app/services/licences/view-licence.service')
// Thing under test
const ViewLicenceReturnsService = require('../../../app/services/licences/view-license-returns.service')

describe('View Licence service returns', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake license' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceReturnsService.go(testId)

        expect(result).to.equal({
          activeTab: 'returns',
          licenceName: 'fake license',
          message: 'hello returns'
        })
      })
    })
  })
})
