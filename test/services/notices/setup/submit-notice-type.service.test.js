// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import { NoticeJourney, NoticeType, NoticeTypes } from 'water-abstraction-engine/lib/static-lookups.lib.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as featureFlagsConfig from '../../../../src/config/feature-flags.config.js'

// Thing under test
import SubmitNoticeTypeService from '../../../../src/services/notices/setup/submit-notice-type.service.js'

describe('Notices - Setup - Submit Notice Type service', () => {
  let auth
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications'] }
    }

    sessionData = { id: generateUUID() }

    yarStub = YarStub()

    vi.spyOn(featureFlagsConfig, 'default', 'get').mockReturnValue({ alternateReturnInvitationPeriods: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when validation is successful', () => {
    beforeEach(() => {
      payload = { noticeType: 'invitations' }
    })

    describe('and the journey is for "standard"', () => {
      beforeEach(() => {
        sessionData.journey = NoticeJourney.STANDARD
      })

      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.checkPageVisited = true
          sessionData.noticeType = NoticeType.INVITATIONS

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted value', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.noticeType).toEqual(payload.noticeType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('saves the related notice data', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          const relatedData = NoticeTypes[payload.noticeType]

          expect(session.name).toEqual(relatedData.name)
          expect(session.notificationType).toEqual(relatedData.notificationType)
          expect(session.referenceCode.startsWith(relatedData.prefix)).toBe(true)
          expect(session.subType).toEqual(relatedData.subType)
          expect(session.$update).toHaveBeenCalled()
        })

        describe('and the selected "noticeType" has changed', () => {
          describe('from "invitations" to "reminders"', () => {
            beforeEach(() => {
              payload = { noticeType: NoticeType.REMINDERS }
            })

            it('sets a flash message', async () => {
              await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

              // Check we add the flash message
              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({
                text: 'Notice type updated',
                titleText: 'Updated'
              })
            })

            it('returns a redirect to the "returns-period" page', async () => {
              const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

              expect(result).toEqual({ redirectUrl: 'returns-period' })
            })
          })

          describe('from "reminders" to "invitations"', () => {
            beforeEach(() => {
              payload = { noticeType: NoticeType.INVITATIONS }

              sessionData.noticeType = NoticeType.REMINDERS

              session = SessionModelStub(sessionData)

              vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
            })

            it('returns a redirect to the "invitation-period" page', async () => {
              const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

              expect(result).toEqual({ redirectUrl: 'invitation-period' })
            })
          })
        })

        describe('and the selected "noticeType" has not changed', () => {
          it('does not set a flash message', async () => {
            await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(yarStub.flash).not.toHaveBeenCalled()
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(async () => {
          sessionData.checkPageVisited = false

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted value', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.noticeType).toEqual(payload.noticeType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('saves the related notice data', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          const relatedData = NoticeTypes[payload.noticeType]

          expect(session.name).toEqual(relatedData.name)
          expect(session.notificationType).toEqual(relatedData.notificationType)
          expect(session.referenceCode.startsWith(relatedData.prefix)).toBe(true)
          expect(session.subType).toEqual(relatedData.subType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('does not set a flash message', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })

        describe('and the notice type is "invitations"', () => {
          it('returns a redirect to the "invitation-period" page', async () => {
            const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(result).toEqual({ redirectUrl: 'invitation-period' })
          })
        })

        describe('and the notice type is "reminders"', () => {
          beforeEach(() => {
            payload = { noticeType: NoticeType.REMINDERS }
          })

          it('returns a redirect to the "returns-period" page', async () => {
            const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(result).toEqual({ redirectUrl: 'returns-period' })
          })
        })
      })
    })

    describe('and the journey is for "adhoc"', () => {
      beforeEach(() => {
        sessionData.journey = NoticeJourney.ADHOC
      })

      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.checkPageVisited = true
          sessionData.noticeType = NoticeType.INVITATIONS

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted value', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.noticeType).toEqual(payload.noticeType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('saves the related notice data', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          const relatedData = NoticeTypes[payload.noticeType]

          expect(session.name).toEqual(relatedData.name)
          expect(session.notificationType).toEqual(relatedData.notificationType)
          expect(session.referenceCode.startsWith(relatedData.prefix)).toBe(true)
          expect(session.subType).toEqual(relatedData.subType)
          expect(session.$update).toHaveBeenCalled()
        })

        describe('and the selected "noticeType" has changed', () => {
          beforeEach(() => {
            payload = { noticeType: NoticeType.REMINDERS }
          })

          it('sets a flash message', async () => {
            await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            // Check we add the flash message
            const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

            expect(flashType).toEqual('notification')
            expect(bannerMessage).toEqual({
              text: 'Notice type updated',
              titleText: 'Updated'
            })
          })

          it('resets the "checkPageVisited" flag', async () => {
            await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(session.checkPageVisited).toBe(false)
            expect(session.$update).toHaveBeenCalled()
          })

          it('returns a redirect to the "licence" page, not the "check-notice-type" page', async () => {
            const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(result).toEqual({ redirectUrl: 'licence' })
          })
        })

        describe('and the selected "noticeType" has not changed', () => {
          it('does not set a flash message', async () => {
            await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(yarStub.flash).not.toHaveBeenCalled()
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(async () => {
          sessionData.checkPageVisited = false

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted value', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.noticeType).toEqual(payload.noticeType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('saves the related notice data', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          const relatedData = NoticeTypes[payload.noticeType]

          expect(session.name).toEqual(relatedData.name)
          expect(session.notificationType).toEqual(relatedData.notificationType)
          expect(session.referenceCode.startsWith(relatedData.prefix)).toBe(true)
          expect(session.subType).toEqual(relatedData.subType)
          expect(session.$update).toHaveBeenCalled()
        })

        it('does not set a flash message', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })

        it('returns a redirect to the "licence" page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'licence' })
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#noticeType',
              text: 'Select the notice type'
            }
          ],
          noticeType: {
            text: 'Select the notice type'
          }
        },
        noticeTypes: [
          {
            checked: false,
            text: 'Returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Returns reminder',
            value: 'reminders'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
