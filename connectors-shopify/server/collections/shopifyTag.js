import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { Tags } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file ShopifyTag
 *
 * @module connectors-shopify
 */

/**
 * @name ShopifyTag
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary ShopifyTag schema attached to Tags
 * @property {Number} shopifyId Shopify ID
 */
export const ShopifyTag = new SimpleSchema({
  sortOrder: {
    type: String,
    optional: true
  },
  image: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("ShopifyTag", ShopifyTag);

Tags.attachSchema(ShopifyTag, { selector: { type: "simple" } });
