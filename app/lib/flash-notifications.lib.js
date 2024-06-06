'use strict'

/**
 * General helper methods
 * @module NotificationLib
 */

/**
 * Sets the default flash notification of {title: Updated, text: Changes made}
 */
function flashNotification (yar, title = 'Updated', text = 'Changes made') {
  yar.flash('notification', {
    title,
    text
  })
}

module.exports = {
  flashNotification
}
