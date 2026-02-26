'use strict'

/**
 * Merges contiguous or overlapping licence versions in descending chronological order.
 *
 * This function expects the input array to be sorted from newest to oldest.
 * If a licence period immediately precedes or overlaps with the previous one in
 * the list, they are merged into a single period by extending the start date
 * backwards. The ID of the most recent version in the merged group is preserved.
 *
 * Note: All licence version start and end dates are assumed to be of type Date.
 *
 * @param {object[]} licenceVersions - An array of licence version objects.
 *
 * @returns {object[]} A new array containing the merged licence versions,
 * maintaining the original descending order.
 */
function formatLicenceVersions(licenceVersions) {
  if (!licenceVersions || licenceVersions.length === 0) return []

  return licenceVersions.reduce((acc, curr) => {
    if (acc.length === 0) {
      acc.push({ ...curr })
      return acc
    }

    const prev = acc[acc.length - 1]
    const prevStart = prev.startDate
    const currentEnd = curr.endDate
    const currStart = curr.startDate

    // Calculate "Yesterday" relative to the last licence version start date
    const lastStartYesterday = new Date(prevStart)
    lastStartYesterday.setDate(lastStartYesterday.getDate() - 1)

    if (currentEnd.getTime() >= prevStart.getTime() || currentEnd.getTime() === lastStartYesterday.getTime()) {
      if (currStart.getTime() < prevStart.getTime()) {
        prev.startDate = curr.startDate
      }
    } else {
      acc.push({ ...curr })
    }

    return acc
  }, [])
}

module.exports = {
  formatLicenceVersions
}
