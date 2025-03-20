'use strict'

/**
 * Formats communications data ready for presenting in the view communications page
 * @module ViewCommunicationsPresenter
 */

/**
 * Formats communications data ready for presenting in the view communications page
 *
 * @param {module:ScheduledNotificationModel} communication - The related scheduled notification and related licence data
 *
 * @returns {object} The data formatted for the view template
 */
function go(communication) {
  const { messageType, plaintext, personalisation } = communication

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    contents: _contents(plaintext),
    messageType,
    pageTitle: 'Test page'
  }
}

function _address(personalisation) {
  const addressLines = [
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'postcode'
  ]

  const address = addressLines.map((line) => personalisation[line])

  return address.filter((line) => line)
}

function _contents(plaintext) {
  const contents = plaintext.split(/\r?\n/)

  return contents.map((line) => {
    if (line === '') {
      return {
        style: 'space',
        line: ''
      }
    }

    if (line.charAt(0) === '#') {
      return {
        style: 'bold',
        line: line.slice(1)
      }
    }

    if (line.charAt(0) === '*') {
      return {
        style: 'bulletPoint',
        line: line.slice(1)
      }
    }

    if (line.charAt(0) === '^') {
      return {
        style: 'indent',
        line: line.slice(1)
      }
    }

    return {
      style: 'normal',
      line
    }
  })
}

module.exports = {
  go
}
