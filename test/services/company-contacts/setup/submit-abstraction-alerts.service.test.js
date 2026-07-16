// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAbstractionAlertsService from '../../../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js'

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let company
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, licences: [] }

    payload = { abstractionAlerts: 'yes' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionAlertsService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        abstractionAlerts: 'yes'
      })
      expect(session.$update).toHaveBeenCalled()
    })

    describe('the redirect URL', () => {
      describe('when "abstractionAlerts" is "yes"', () => {
        it('redirects to the check page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/check` })
        })
      })

      describe('when "abstractionAlerts" is "no"', () => {
        beforeEach(() => {
          payload = { abstractionAlerts: 'no' }
        })

        it('redirects to the check page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/check` })
        })
      })

      describe('when "abstractionAlerts" is "some"', () => {
        beforeEach(() => {
          payload = { abstractionAlerts: 'some' }
        })

        it('redirects to the licences page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/licences` })
        })
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(async () => {
          sessionData = {
            ...sessionData,
            checkPageVisited: true,
            abstractionAlerts: 'yes'
          }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitAbstractionAlertsService(session.id, payload, yarStub)

              expect(yarStub.flash).not.toHaveBeenCalled()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { abstractionAlerts: 'no' }
            })

            it('sets a notification', async () => {
              await SubmitAbstractionAlertsService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Water abstraction alerts updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

      expect(result).toEqual({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,

          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#abstractionAlerts',
              text: 'Should the contact get water abstraction alerts'
            }
          ],
          abstractionAlerts: {
            text: 'Should the contact get water abstraction alerts'
          }
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation',
        showSomeLicences: false
      })
    })
  })
})
