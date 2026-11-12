// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as FetchPurposesService from '../../../../src/services/return-versions/setup/fetch-purposes.service.js'

// Thing under test
import SubmitPurposeService from '../../../../src/services/return-versions/setup/submit-purpose.service.js'

describe('Return Versions - Setup - Submit Purpose service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      licenceVersion: {
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      multipleUpload: false,
      reason: 'major-change',
      requirements: [{}],
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      startDateOptions: 'licenceStartDate'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()

    vi.spyOn(FetchPurposesService, 'default').mockResolvedValue([
      { description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
      { description: 'Horticultural Watering', id: '49088608-ee9f-491a-8070-6831240945ac' }
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          'alias-14794d57-1acf-4c91-8b48-4b1ec68bfd6f': 'great warm machine',
          purposes: ['14794d57-1acf-4c91-8b48-4b1ec68bfd6f']
        }
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

        expect(session.requirements[0].purposes).toEqual([
          { alias: 'great warm machine', description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' }
        ])
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = SessionModelStub({ ...sessionData, checkPageVisited: true })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            text: 'Requirements for returns updated',
            titleText: 'Updated'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because it is empty', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data for the view', async () => {
          const result = await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            backLink: {
              href: `/system/return-versions/setup/${session.id}/method`,
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#purposes',
                  text: 'Select any purpose for the requirements for returns'
                }
              ],
              purposes: { text: 'Select any purpose for the requirements for returns' }
            },
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            pageTitle: 'Select the purpose for the requirements for returns',
            pageTitleCaption: 'Licence 01/ABC',
            purposes: [
              { alias: '', checked: false, description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
              {
                alias: '',
                checked: false,
                description: 'Horticultural Watering',
                id: '49088608-ee9f-491a-8070-6831240945ac'
              }
            ],
            sessionId: session.id
          })
        })
      })

      describe('because they entered an alias that is too long', () => {
        beforeEach(() => {
          payload = {
            'alias-14794d57-1acf-4c91-8b48-4b1ec68bfd6f':
              'THGBk2GM85EyXB54SsfenU2yWiKjDuPTcJCrPfTsSzojNvj6ciVmI3PXJ2fisQgXWfSI4ZPIqV5GLPtR15qbcw3Hamoeit764Cojz',
            purposes: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
          }
        })

        it('returns page data for the view', async () => {
          const result = await SubmitPurposeService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            backLink: {
              href: `/system/return-versions/setup/${session.id}/method`,
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#purposes',
                  text: 'Purpose description must be 100 characters or less'
                }
              ],
              purposes: { text: 'Purpose description must be 100 characters or less' }
            },
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            pageTitle: 'Select the purpose for the requirements for returns',
            pageTitleCaption: 'Licence 01/ABC',
            purposes: [
              {
                alias:
                  'THGBk2GM85EyXB54SsfenU2yWiKjDuPTcJCrPfTsSzojNvj6ciVmI3PXJ2fisQgXWfSI4ZPIqV5GLPtR15qbcw3Hamoeit764Cojz',
                checked: true,
                description: 'Heat Pump',
                id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
              },
              {
                alias: '',
                checked: false,
                description: 'Horticultural Watering',
                id: '49088608-ee9f-491a-8070-6831240945ac'
              }
            ],
            sessionId: session.id
          })
        })
      })
    })
  })
})
