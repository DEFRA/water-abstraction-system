/**
 * Formats data for external users on the `/users/external/setup/{id}/licences` page
 * @module LicencesPresenter
 */

/**
 * Formats data for external users on the `/users/external/setup/{id}/licences` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { activeNavBar, allLicences, licences, selectedLicences, user } = session

  const checkBoxItems = _checkBoxItems(licences, selectedLicences, allLicences)

  return {
    activeNavBar,
    backLink: { href: `/system/users/external/${user.id}/licences`, text: 'Back' },
    checkBoxItems,
    pageTitle: 'Select licences to unregister',
    pageTitleCaption: user.username,
    showHint: checkBoxItems.length > 1
  }
}

function _checkBoxItems(licences, selectedLicences, allLicences) {
  const items = licences.map((licence) => {
    const { id, licenceRef, licenceVersions } = licence
    const checked = selectedLicences.includes(id)

    return {
      checked,
      hint: {
        text: licenceVersions[0].company.name
      },
      text: licenceRef,
      value: id
    }
  })

  if (items.length === 1) {
    return items
  }

  items.push({ divider: 'or' })
  items.push({
    behaviour: 'exclusive',
    checked: !!allLicences,
    text: 'All licences',
    value: 'all'
  })

  return items
}

export { go }
export default {
  go
}
