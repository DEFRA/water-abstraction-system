// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import AbstractionAlertsPresenter from '../../../../app/presenters/company-contacts/setup/abstraction-alerts.presenter.js'

describe('Company Contacts - Setup - Abstraction Alerts Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company, licences: [] }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AbstractionAlertsPresenter(session)

      expect(result).toEqual({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,
          text: 'Back'
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation',
        showSomeLicences: false
      })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('when "abstractionAlerts" property is set on the session', () => {
        beforeEach(() => {
          session.abstractionAlerts = 'yes'
        })

        it('returns the "abstractionAlerts" value', () => {
          const result = AbstractionAlertsPresenter(session)

          expect(result.abstractionAlerts).toEqual('yes')
        })
      })

      describe('when the "abstractionAlerts" has not previously been saved', () => {
        it('returns null', () => {
          const result = AbstractionAlertsPresenter(session)

          expect(result.abstractionAlerts).toBeNull()
        })
      })
    })

    describe('the "showSomeLicences" property', () => {
      describe('when there are licences', () => {
        beforeEach(() => {
          session.licences = [generateUUID()]
        })

        it('returns true', () => {
          const result = AbstractionAlertsPresenter(session)

          expect(result.showSomeLicences).toBe(true)
        })
      })

      describe('when there are no licences', () => {
        it('returns false', () => {
          const result = AbstractionAlertsPresenter(session)

          expect(result.showSomeLicences).toBe(false)
        })
      })
    })
  })
})
