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
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

describe('View Licence service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  let fetchLicenceResult

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
          abstractionPeriods: null,
          abstractionPeriodsAndPurposesLinkText: null,
          id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
          documentId: '40306a46-d4ce-4874-9c9e-30ab6469b3fe',
          endDate: null,
          licenceHolder: 'Unregistered licence',
          licenceName: 'Unregistered licence',
          licenceRef: '01/130/R01',
          pageTitle: 'Licence 01/130/R01',
          purposes: null,
          region: 'South West',
          registeredTo: null,
          startDate: '7 March 2013',
          sourceOfSupply: null,
          warning: null
        })
      })
    })

    describe('and it does not have a licence holder', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.licenceHolder = null
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return unregistered licence for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('and it does have a licence holder', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.licenceHolder = 'Test Company'
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the licence holder for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.licenceHolder).to.equal('Test Company')
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

    describe("and it did 'end' in the past", () => {
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

    describe("and it did 'ends' today", () => {
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

    describe("and it did 'ends' in the future", () => {
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

    describe('and it has a source of supply', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: [{
            purposePoints: [{
              point_source: {
                NAME: 'SURFACE WATER SOURCE OF SUPPLY'
              }
            }]
          }]
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal('SURFACE WATER SOURCE OF SUPPLY')
      })
    })

    describe('and it does not have a source of supply name', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: [{
            purposePoints: [{
              point_source: {}
            }]
          }]
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a source of supply point_source', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: [{
            purposePoints: [{}]
          }]
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an empty purposePoints array', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: [{
            purposePoints: []
          }]
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposePoints array', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: [{}]
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an empty purposes array', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = {
          purposes: []
        }
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposes array', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.permitLicence = undefined
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })
  })
})

function _testLicence () {
  return LicenceModel.fromJson({
    id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    licenceDocumentHeader: {
      id: '40306a46-d4ce-4874-9c9e-30ab6469b3fe'
    },
    licenceRef: '01/130/R01',
    licenceName: 'Unregistered licence',
    region: {
      id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
      displayName: 'South West'
    },
    registeredTo: null,
    startDate: new Date('2013-03-07')
  })
}
