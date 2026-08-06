/**
 * Orchestrates fetching and presenting the data for `/profiles/me/details` page
 * @module ViewProfileDetailsService
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import UserModel from 'water-abstraction-engine/models/user.model.js'
import { readFlashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import ProfileDetailsPresenter from '../../presenters/users/profile-details.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/users/me/profile-details` page
 *
 * The required fields are held in an attribute called `contactDetails` in the `userData` JSON field in the UserModel.
 * This requires use of the `ref` function to access the nested fields as well as casting them to Objection's text type
 * and giving them appropriate aliases.
 *
 * @param {number} userId - The user's ID
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
export default async function viewProfileDetailsService(userId, yar) {
  const profileDetails = await _fetchProfileDetails(userId)

  const notification = readFlashNotification(yar)

  const pageData = ProfileDetailsPresenter(profileDetails)

  return {
    notification,
    ...pageData
  }
}

async function _fetchProfileDetails(userId) {
  return UserModel.query()
    .where('userId', userId)
    .limit(1)
    .first()
    .select([
      Objection.ref('userData:contactDetails.address').castText().as('address'),
      Objection.ref('userData:contactDetails.email').castText().as('email'),
      Objection.ref('userData:contactDetails.jobTitle').castText().as('jobTitle'),
      Objection.ref('userData:contactDetails.name').castText().as('name'),
      Objection.ref('userData:contactDetails.tel').castText().as('tel')
    ])
}
