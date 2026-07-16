// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ProfileDetailsPresenter from '../../../app/presenters/users/profile-details.presenter.js'

describe('Users - Profile Details Presenter', () => {
  let profileDetails

  describe('when called with no data', () => {
    beforeEach(() => {
      profileDetails = {}
    })

    it('returns the basic page data for the view', () => {
      const result = ProfileDetailsPresenter(profileDetails)

      expect(result).toEqual({
        address: '',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        email: null,
        jobTitle: '',
        name: '',
        navigationLinks: [
          { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
          { href: '/account/update-password', text: 'Change password' },
          { href: '/signout', text: 'Sign out' }
        ],
        pageTitle: 'Profile details',
        tel: ''
      })
    })
  })

  describe('when called with full profile data', () => {
    beforeEach(() => {
      profileDetails = {
        address: `Department for Environment, Food & Rural Affairs
                  Horizon House
                  Deanery Road
                  Bristol
                  BS1 5AH`,
        email: 'test@environment-agency.gov.uk',
        jobTitle: 'Developer',
        name: 'Test User',
        tel: '01234567890'
      }
    })

    it('returns the basic page data for the view', () => {
      const result = ProfileDetailsPresenter(profileDetails)

      expect(result).toEqual({
        address: profileDetails.address,
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        email: profileDetails.email,
        jobTitle: profileDetails.jobTitle,
        name: profileDetails.name,
        navigationLinks: [
          { active: true, href: '/system/users/me/profile-details', text: 'Profile details' },
          { href: '/account/update-password', text: 'Change password' },
          { href: '/signout', text: 'Sign out' }
        ],
        pageTitle: 'Profile details',
        tel: profileDetails.tel
      })
    })
  })
})
