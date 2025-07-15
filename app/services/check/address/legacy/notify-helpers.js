'use strict'

const MAX_ADDRESS_LINES = 6

/**
 * Creates the notification address in the format expected by existing
 * notifications for the supplied Contact model
 * @param  {Contact} contact
 *
 * @returns {object} contact details object for personalisation
 */
function mapContactAddress(contact) {
  const { postcode } = contact

  const addressLines = reduceAddressLines([
    contact.getFullName(),
    contact.addressLine1,
    contact.addressLine2,
    contact.addressLine3,
    contact.addressLine4,
    contact.town,
    contact.county,
    contact.country
  ])

  return addressLines.reduce(
    (acc, line, index) => {
      return { ...acc, [`address_line_${index + 1}`]: line }
    },
    { postcode }
  )
}

/**
 * Reduces the number of address lines to 6 (the max in Notify)
 * The first line is not altered as it contains the recipient name
 * @param  {string[]} lines
 *
 * @returns {string[]}
 */
function reduceAddressLines(lines) {
  const compacted = lines.filter((line) => {
    return line
  })

  let index = 1
  while (compacted.length > MAX_ADDRESS_LINES) {
    const newLine = compacted.slice(index, index + 2).join(', ')
    compacted.splice(index, 2, newLine)
    index++
  }

  return compacted
}

module.exports = {
  mapContactAddress
}
