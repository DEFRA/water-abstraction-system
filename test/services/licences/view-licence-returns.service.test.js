'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const DetermineLicenceHasReturnVersionsService = require('../../../app/services/licences/determine-licence-has-return-versions.service.js')
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceReturnsService = require('../../../app/services/licences/view-licence-returns.service.js')

describe('View Licence Returns service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  const page = 1

  let auth

  beforeEach(async () => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: ['returns'],
        groups: [],
        scope: ['returns'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    Sinon.stub(DetermineLicenceHasReturnVersionsService, 'go').returns(true)

    Sinon.stub(FetchLicenceReturnsService, 'go').resolves({
      pagination: { total: 1 },
      returns: []
    })

    Sinon.stub(ViewLicenceService, 'go').resolves({
      licenceName: 'fake licence'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceReturnsService.go(testId, auth, page)

        expect(result).to.equal({
          activeTab: 'returns',
          returns: [],
          noReturnsMessage: 'No returns for this licence.',
          licenceName: 'fake licence',
          pagination: { numberOfPages: 1 }
        })
      })
    })
  })
})
