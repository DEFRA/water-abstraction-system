'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicenceAbstractionConditionsService = require('../../../app/services/licences/fetch-licence-abstraction-conditions.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

describe('View Licence service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let fetchLicenceResult

  beforeEach(() => {
    Sinon.stub(FetchLicenceAbstractionConditionsService, 'go').resolves({
      conditions: [],
      purposeIds: [],
      numberOfConditions: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it has no optional fields', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return all the mandatory data and default values for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result).to.equal({
          activeNavBar: 'search',
          documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
          licenceId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
          licenceName: 'Unregistered licence',
          licenceRef: '01/130/R01',
          notification: null,
          pageTitle: 'Licence 01/130/R01',
          registeredTo: null,
          roles: null,
          warning: null
        })
      })
    })

    describe('and it does not have an expired, lapsed, or revoke date', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal(null)
      })
    })
    describe('and it did \'end\' in the past', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
      })

      describe('because it was revoked', () => {
        beforeEach(() => {
          fetchLicenceResult.ends = { date: new Date('2023-03-07'), priority: 1, reason: 'revoked' }
          Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
        })

        it('will include the revoked warning message for use in the view licence page', async () => {
          const result = await ViewLicenceService.go(testId)

          expect(result.warning).to.equal('This licence was revoked on 7 March 2023')
        })
      })

      describe('because it was lapsed', () => {
        beforeEach(() => {
          fetchLicenceResult.ends = { date: new Date('2023-03-07'), priority: 1, reason: 'lapsed' }
          Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
        })

        it('will include the lapsed warning message for use in the view licence page', async () => {
          const result = await ViewLicenceService.go(testId)

          expect(result.warning).to.equal('This licence lapsed on 7 March 2023')
        })
      })

      describe('because it was expired', () => {
        beforeEach(() => {
          fetchLicenceResult.ends = { date: new Date('2023-03-07'), priority: 1, reason: 'expired' }
          Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
        })

        it('will include the expired warning message for use in the view licence page', async () => {
          const result = await ViewLicenceService.go(testId)

          expect(result.warning).to.equal('This licence expired on 7 March 2023')
        })
      })
    })

    describe('and it did \'ends\' today', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.ends = { date: new Date(), priority: 1, reason: 'revoked' }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will include a warning message for use in the view licence page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.startWith('This licence was revoked on')
      })
    })

    describe('and it did \'ends\' in the future', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()

        // Set the 'end' date to tomorrow
        const today = new Date()
        // 86400000 is one day in milliseconds
        const tomorrow = new Date(today.getTime() + 86400000)
        fetchLicenceResult.ends = { date: tomorrow, priority: 1, reason: 'revoked' }

        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will include a warning message for use in the view licence page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.be.null()
      })
    })
  })
})

function _testLicence () {
  return LicenceModel.fromJson({
    id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    licenceRef: '01/130/R01',
    licenceName: 'Unregistered licence',
    registeredTo: null,
    startDate: new Date('2013-03-07'),
    licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' }
  })
}
