import type { BaseRecord } from '@hanzo/base/react'

/**
 * The two collections provisioned from schema.sql, typed for the app. Base
 * stamps id/created/updated/owner/org itself; these are the app-declared fields.
 * Keep this in lockstep with schema.sql and what the views read/write.
 */

/** A listed digital drop. `file` is the delivered asset name (download stub). */
export interface Drop extends BaseRecord {
  name: string
  price: string
  file: string
  desc: string
}

/** A claim on a drop by a user. `drop` = Drop.id, `user` = the IAM user key. */
export interface Claim extends BaseRecord {
  drop: string
  user: string
}
