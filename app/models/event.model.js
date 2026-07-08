/**
 * Model for events (water.events)
 * @module EventModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import NotificationModel from './notification.model.js'

export default class EventModel extends BaseModel {
  static get tableName() {
    return 'events'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['entities', 'licences', 'metadata', 'statusCounts']
  }

  static get relationMappings() {
    return {
      notifications: {
        relation: Model.HasManyRelation,
        modelClass: NotificationModel,
        join: {
          from: 'events.id',
          to: 'notifications.eventId'
        }
      }
    }
  }
}