// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import LicenceFixture from '../../../support/fixtures/licence.fixture.js'
import { generateUUID } from '../../../support/generators.js'

// Thing under test
import CancelPresenter from '../../../../app/presenters/company-contacts/setup/cancel.presenter.js'

describe('Company Contacts - Setup - Cancel Presenter', () => {
  let company
  let licences
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    licences = [LicenceFixture.licence()]

    session = {
      abstractionAlertLicences: null,
      abstractionAlerts: 'yes',
      company,
      email: 'eric@test.com',
      id: generateUUID(),
      licences,
      name: 'Eric'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter(session)

      expect(result).toEqual({
        abstractionAlertsLabel: 'Yes, for all licences',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/check`,
          text: 'Back'
        },
        email: 'eric@test.com',
        licences: [],
        name: 'Eric',
        pageTitle: 'You are about to cancel this contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('and the company contact is being edited', () => {
      beforeEach(() => {
        session.companyContact = { id: generateUUID() }
      })

      it('returns page data for the view', () => {
        const result = CancelPresenter(session)

        expect(result.pageTitle).toEqual('You are about to cancel editing this contact')
      })
    })
  })
})
