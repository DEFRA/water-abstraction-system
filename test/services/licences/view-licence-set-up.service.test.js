'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceSetUpService =
  require('../../../app/services/licences/fetch-charge-versions.service.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceSetUpService = require('../../../app/services/licences/view-licence-set-up.service.js')

describe('View licence set up service', () => {
  const auth = {}
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(FetchLicenceSetUpService, 'go').returns([
      {
        changeReason: { description: 'Missing thing' },
        endDate: new Date('2020-09-01'),
        id: '123',
        licenceId: '456',
        startDate: new Date('2020-01-01'),
        status: 'current'
      }
    ])
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake licence' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceSetUpService.go(testId, auth)

      expect(result).to.equal({
        activeTab: 'set-up',
        chargeInformation: [{
          action: [
            {
              link: '/licences/456/charge-information/123/view',
              text: 'View'
            }
          ],
          endDate: '1 September 2020',
          id: '123',
          reason: 'Missing thing',
          startDate: '1 January 2020',
          status: 'approved'
        }],
        licenceName: 'fake licence'
      })
    })
  })
})
