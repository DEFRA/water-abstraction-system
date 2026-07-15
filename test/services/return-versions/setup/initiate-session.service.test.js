// Test helpers
import LicenceModel from '../../../../app/models/licence.model.js'
import http2 from 'node:http2'

// Things we need to stub
import * as FetchLicenceService from '../../../../app/services/return-versions/setup/fetch-licence.service.js'

// Thing under test
import InitiateSessionService from '../../../../app/services/return-versions/setup/initiate-session.service.js'

const { HTTP_STATUS_NOT_FOUND } = http2.constants

describe('Return Versions - Setup - Initiate Session service', () => {
  const journey = 'returns-required'

  let licence

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the matching licence exists', () => {
      describe('and it "ends"', () => {
        beforeEach(async () => {
          licence = _licence()

          vi.spyOn(FetchLicenceService, 'default').mockResolvedValue(licence)
        })

        it('creates a new session record containing details of the licence', async () => {
          const result = await InitiateSessionService(licence.id, journey)

          const { data } = result

          expect(data).toMatchObject({
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
          })
        })
      })

      describe('and it does not "end"', () => {
        beforeEach(async () => {
          licence = _licence()
          licence.expiredDate = null

          vi.spyOn(FetchLicenceService, 'default').mockResolvedValue(licence)
        })

        it('creates a new session record containing details of the licence', async () => {
          const result = await InitiateSessionService(licence.id, journey)

          const { data } = result

          expect(data).toMatchObject({
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
          })
        })
      })
    })

    describe('and the matching licence does not exist', () => {
      beforeEach(async () => {
        licence = undefined
        vi.spyOn(FetchLicenceService, 'default').mockResolvedValue(licence)
      })

      it('throws a Boom not found error', async () => {
        await expect(InitiateSessionService('e456e538-4d55-4552-84f7-6a7636eb1945', journey)).rejects.toMatchObject({
          isBoom: true,
          data: { id: 'e456e538-4d55-4552-84f7-6a7636eb1945' },
          output: {
            payload: {
              statusCode: HTTP_STATUS_NOT_FOUND,
              error: 'Not Found',
              message: 'Licence for new return requirement not found'
            }
          }
        })
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
        issueDate: null,
        startDate: new Date('2022-05-01'),
        status: 'current',
        company: {
          id: '9d4284a2-1915-492c-9891-77e2dce430cb',
          type: 'organisation',
          name: 'Licence Holder Ltd'
        }
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
    ]
  })
}
