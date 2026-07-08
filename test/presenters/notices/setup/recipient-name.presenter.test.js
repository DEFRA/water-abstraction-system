// Test helpers
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Thing under test
import RecipientNamePresenter from '../../../../app/presenters/notices/setup/recipient-name.presenter.js'

describe('Notices - Setup - Recipient Name presenter', () => {
  let referenceCode
  let session

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    session = { id: '123', referenceCode }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RecipientNamePresenter(session)

      expect(result).toEqual({
        backLink: { text: 'Back', href: `/system/notices/setup/${session.id}/select-recipients` },
        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })

    describe('and the name has previously been set', () => {
      beforeEach(() => {
        session.contactName = 'Ronald Weasley'
      })

      it('returns previously set name', () => {
        const result = RecipientNamePresenter(session)

        expect(result.name).toEqual('Ronald Weasley')
      })
    })
  })
})
