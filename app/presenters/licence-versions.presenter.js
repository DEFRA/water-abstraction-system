'use strict'

/**
 * Merges contiguous or overlapping licence versions in descending chronological order
 *
 * This function expects the input array to be sorted from newest to oldest. If a licence period immediately precedes or
 * overlaps with the previous one in the list, they are merged into a single period by extending the start date
 * backwards. The ID of the most recent version in the merged group is preserved, along with any other properties
 * present.
 *
 * > All licence version start and end dates are assumed to be of type Date.
 *
 * For example, if the licence versions passed in were contiguous as below.
 *
 * |ID|Start date     |End date       |
 * |--|---------------|---------------|
 * |3 |6 November 2015|2 February 2023|
 * |2 |1 April 2002   |5 November 2015|
 * |1 |1 April 1977   |31 March 2002  |
 *
 * Then the result would be the following.
 *
 * |ID|Start date     |End date       |
 * |--|---------------|---------------|
 * |3 |1 April 1977   |2 February 2023|
 *
 * The same applies if they are overlapping.
 *
 * |ID|Start date     |End date        |
 * |--|---------------|----------------|
 * |2 |2 January 2002 |3 January 2002  |
 * |1 |1 January 2002 |2 January 2002  |
 *
 * This would result in.
 *
 * |ID|Start date     |End date       |
 * |--|---------------|---------------|
 * |2 |1 January 2002 |3 January 2002 |
 *
 * When they are not continuous or overlapping, they are not merged.
 *
 * |ID|Start date     |End date       |
 * |--|---------------|---------------|
 * |3 |6 October 2016 |2 February 2023|
 * |2 |1 April 2002   |5 November 2015|
 * |1 |1 April 1977   |31 March 2002  |
 *
 * |ID|Start date     |End date        |
 * |--|---------------|----------------|
 * |3 |6 October 2016 |2 February 2023 |
 * |2 |1 April 1977   |5 November 2015 |
 *
 * @param {object[]} licenceVersions - An array of licence version objects
 *
 * @returns {object[]} A new array containing the merged licence versions, maintaining the original descending order
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
    const prevEnd = prev.endDate
    const currentEnd = curr.endDate
    const currStart = curr.startDate

    // Calculate "Yesterday" relative to the last licence version start date
    const lastStartYesterday = new Date(prevStart)
    lastStartYesterday.setDate(lastStartYesterday.getDate() - 1)

    if (currentEnd.getTime() >= prevStart.getTime() || currentEnd.getTime() === lastStartYesterday.getTime()) {
      if (currStart.getTime() < prevStart.getTime()) {
        prev.startDate = currStart
      }

      if (currStart.getTime() === prevStart.getTime() && currentEnd.getTime() > prevEnd.getTime()) {
        prev.endDate = currentEnd
        prev.id = curr.id
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
