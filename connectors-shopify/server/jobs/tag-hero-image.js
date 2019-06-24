import { FileRecord } from "@reactioncommerce/file-collections";
import fetch from "node-fetch";
import { Jobs, Tags, MediaRecords } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";

/**
 * @summary Add media from URL
 * @param {String} url - url from which to grab image
 * @param {Object} metadata - Metadata to add to the image
 * @returns {Promise<void>} - Result of Media insert
 */
async function addMediaFromUrl({ url, metadata }) {
  const fileRecord = await FileRecord.fromUrl(url, { fetch });

  // Set workflow to "published" to bypass revision control on insert for this image.
  const doc = {
    ...fileRecord,
    metadata: {
      ...fileRecord.metadata,
      workflow: "published"
    }
  };

  const mediaRecordId = await MediaRecords.insert(doc);

  // Because we don't have access to the URL of the file, we have to take
  // do our best to get he URL as it will be once the file is finished being processed.
  const heroMediaUrl = `${FileRecord.downloadEndpointPrefix}/${Media.name}/${mediaRecordId}/large/${fileRecord.original.name}`;

  return Tags.updateOne({
    _id: metadata.tagId
  }, {
    $set: {
      heroMediaUrl
    }
  });
}

export const importImages = () => {
  Jobs.processJobs("connectors/shopify/import/tag-image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, (job, callback) => {
    const { data } = job;
    const { url } = data;
    try {
      Promise.await(addMediaFromUrl(data));
      job.done(`Finished importing image from ${url}`);
      callback();
    } catch (error) {
      job.fail(`Failed to import image from ${url}.`);
      callback();
    }
  });
};
