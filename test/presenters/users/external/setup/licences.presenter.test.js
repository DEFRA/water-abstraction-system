// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'

// Thing under test
import LicencesPresenter from '../../../../../app/presenters/users/external/setup/licences.presenter.js'

describe('Users - External - Setup - Licences Presenter', () => {
  let session

  beforeEach(() => {
    session = UserSessionsFixture.unregistrationSession()
  })

  it('correctly presents the data', () => {
    const result = LicencesPresenter(session)

    expect(result).toEqual({
      activeNavBar: 'users',
      backLink: {
        href: `/system/users/external/${session.user.id}/licences`,
        text: 'Back'
      },
      checkBoxItems: [
        {
          checked: false,
          hint: { text: session.licences[0].licenceVersions[0].company.name },
          text: session.licences[0].licenceRef,
          value: session.licences[0].id
        },
        {
          checked: false,
          hint: { text: session.licences[1].licenceVersions[0].company.name },
          text: session.licences[1].licenceRef,
          value: session.licences[1].id
        },
        {
          divider: 'or'
        },
        {
          behaviour: 'exclusive',
          checked: false,
          text: 'All licences',
          value: 'all'
        }
      ],
      pageTitle: 'Select licences to unregister',
      pageTitleCaption: session.user.username,
      showHint: true
    })
  })

  describe('the "checkBoxItems" property', () => {
    describe('when there is only one licence to unregister', () => {
      beforeEach(() => {
        session.licences = [session.licences[0]]
      })

      it('does not include a divider or an "All licences" option', () => {
        const result = LicencesPresenter(session)

        expect(result.checkBoxItems).not.toContainEqual({ divider: 'or' })
        expect(result.checkBoxItems).not.toContainEqual({ behaviour: 'exclusive', text: 'All licences', value: 'all' })
      })
    })

    describe('when there is more than one licence to unregister', () => {
      it('includes a divider and an "All licences" option', () => {
        const result = LicencesPresenter(session)

        expect(result.checkBoxItems).toContainEqual({ divider: 'or' })
        expect(result.checkBoxItems).toContainEqual({
          behaviour: 'exclusive',
          checked: false,
          text: 'All licences',
          value: 'all'
        })
      })
    })

    describe('the "checked" property', () => {
      describe('when the user did not select any licences', () => {
        it('returns the matching licence option as checked', () => {
          const result = LicencesPresenter(session)

          expect(result.checkBoxItems[0].checked).toBe(false)
          expect(result.checkBoxItems[1].checked).toBe(false)

          // The "All licences" option
          expect(result.checkBoxItems[result.checkBoxItems.length - 1].checked).toBe(false)
        })
      })

      describe('when the user selected a licence', () => {
        beforeEach(() => {
          session.selectedLicences = [session.licences[0].id]
        })

        it('returns the matching licence option as checked', () => {
          const result = LicencesPresenter(session)

          expect(result.checkBoxItems[0].checked).toBe(true)
          expect(result.checkBoxItems[1].checked).toBe(false)

          // The "All licences" option
          expect(result.checkBoxItems[result.checkBoxItems.length - 1].checked).toBe(false)
        })
      })

      describe('when the user has previously selected "All licences"', () => {
        beforeEach(() => {
          session.allLicences = true
        })

        it('returns the "All licences" option as checked', () => {
          const result = LicencesPresenter(session)

          expect(result.checkBoxItems[result.checkBoxItems.length - 1].text).toEqual('All licences')
          expect(result.checkBoxItems[result.checkBoxItems.length - 1].checked).toBe(true)
        })
      })
    })
  })

  describe('the "showHint" property', () => {
    describe('when there is only one licence to unregister', () => {
      beforeEach(() => {
        session.licences = [session.licences[0]]
      })

      it('returns "false"', () => {
        const result = LicencesPresenter(session)

        expect(result.showHint).toBe(false)
      })
    })

    describe('when there is more than one licence to unregister', () => {
      it('returns "true"', () => {
        const result = LicencesPresenter(session)

        expect(result.showHint).toBe(true)
      })
    })
  })
})
