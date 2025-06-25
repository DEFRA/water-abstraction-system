'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicenceService = require('../../../../app/services/return-versions/setup/fetch-licence.service.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/return-versions/setup/initiate-session.service.js')

describe('Return Versions - Setup - Initiate Session service', () => {
  const journey = 'returns-required'

  let licence

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the matching licence exists', () => {
      describe('and it "ends"', () => {
        beforeEach(async () => {
          licence = _licence()

          Sinon.stub(FetchLicenceService, 'go').resolves(licence)
        })

        it('creates a new session record containing details of the licence', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { data } = result

          expect(data).to.equal(
            {
              checkPageVisited: false,
              licence: {
                id: '3cc3eb61-34fe-449c-ab28-611f55a9280d',
                currentVersionStartDate: licence.licenceVersions[0].startDate,
                endDate: licence.expiredDate,
                licenceRef: '01/94/56/9693',
                licenceHolder: 'Licence Holder Ltd',
                returnVersions: [
                  {
                    id: '0758a3a7-8008-4513-a461-69054e2a1c1f',
                    startDate: licence.returnVersions[0].startDate,
                    reason: 'new-licence',
                    modLogs: [
                      {
                        id: 'c496a62c-f5e6-4899-9f49-114aabafb43e',
                        reasonDescription: 'Record Loaded During Migration'
                      }
                    ]
                  }
                ],
                startDate: licence.startDate,
                waterUndertaker: false
              },
              multipleUpload: false,
              journey,
              requirements: [{}]
            },
            { skip: ['id'] }
          )
        })
      })

      describe('and it does not "end"', () => {
        beforeEach(async () => {
          licence = _licence()
          licence.expiredDate = null

          Sinon.stub(FetchLicenceService, 'go').resolves(licence)
        })

        it('creates a new session record containing details of the licence', async () => {
          const result = await InitiateSessionService.go(licence.id, journey)

          const { data } = result

          expect(data).to.equal(
            {
              checkPageVisited: false,
              licence: {
                id: '3cc3eb61-34fe-449c-ab28-611f55a9280d',
                currentVersionStartDate: licence.licenceVersions[0].startDate,
                endDate: null,
                licenceRef: '01/94/56/9693',
                licenceHolder: 'Licence Holder Ltd',
                returnVersions: [
                  {
                    id: '0758a3a7-8008-4513-a461-69054e2a1c1f',
                    startDate: licence.returnVersions[0].startDate,
                    reason: 'new-licence',
                    modLogs: [
                      {
                        id: 'c496a62c-f5e6-4899-9f49-114aabafb43e',
                        reasonDescription: 'Record Loaded During Migration'
                      }
                    ]
                  }
                ],
                startDate: licence.startDate,
                waterUndertaker: false
              },
              multipleUpload: false,
              journey,
              requirements: [{}]
            },
            { skip: ['id'] }
          )
        })
      })
    })

    describe('and the matching licence does not exist', () => {
      beforeEach(async () => {
        licence = undefined
        Sinon.stub(FetchLicenceService, 'go').resolves(licence)
      })

      it('throws a Boom not found error', async () => {
        const error = await expect(
          InitiateSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945', journey)
        ).to.reject()

        expect(error.isBoom).to.be.true()
        expect(error.data).to.equal({ id: 'e456e538-4d55-4552-84f7-6a7636eb1945' })

        const { statusCode, error: errorType, message } = error.output.payload

        expect(statusCode).to.equal(404)
        expect(errorType).to.equal('Not Found')
        expect(message).to.equal('Licence for new return requirement not found')
      })
    })
  })
})

function _licence() {
  return LicenceModel.fromJson({
    id: '3cc3eb61-34fe-449c-ab28-611f55a9280d',
    expiredDate: new Date('2026-06-16'),
    lapsedDate: null,
    licenceRef: '01/94/56/9693',
    revokedDate: null,
    startDate: new Date('2022-01-01'),
    waterUndertaker: false,
    licenceVersions: [
      {
        id: 'a2e39067-3076-4106-b83a-fb48b6307c50',
        startDate: new Date('2022-05-01')
      }
    ],
    returnVersions: [
      {
        id: '0758a3a7-8008-4513-a461-69054e2a1c1f',
        startDate: new Date('2022-05-01'),
        reason: 'new-licence',
        modLogs: [
          {
            id: 'c496a62c-f5e6-4899-9f49-114aabafb43e',
            reasonDescription: 'Record Loaded During Migration'
          }
        ]
      }
    ],
    licenceDocument: {
      id: '57a815e5-83a0-46a5-b60e-231edd098501',
      licenceDocumentRoles: [
        {
          id: '5e975fad-dc76-4f7b-8fe0-01887553c6fd',
          contact: null,
          company: {
            id: 'af8ad37b-248b-4aa4-a85c-a6c892f0f15e',
            name: 'Licence Holder Ltd',
            type: 'organisation'
          }
        }
      ]
    }
  })
}
