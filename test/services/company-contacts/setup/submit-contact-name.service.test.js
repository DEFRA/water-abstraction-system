// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitContactNameService from '../../../../app/services/company-contacts/setup/submit-contact-name.service.js'

describe('Company Contacts - Setup - Contact Name Service', () => {
  let company
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { name: 'Eric' }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactNameService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        name: 'Eric'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/company-contacts/setup/${session.id}/contact-email`
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true,
            name: 'Eric'
          })

          FetchSessionDal.mockResolvedValue(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitContactNameService(session.id, payload, yarStub)

              expect(yarStub.flash).not.toHaveBeenCalled()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { name: 'Bob' }
            })

            it('sets a notification', async () => {
              await SubmitContactNameService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Name updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitContactNameService(session.id, payload, yarStub)

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
      const result = await SubmitContactNameService(session.id, payload, yarStub)

      expect(result).toEqual({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#name',
              text: 'Enter a name for the contact'
            }
          ],
          name: {
            text: 'Enter a name for the contact'
          }
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
