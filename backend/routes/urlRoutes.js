const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const ClickLog = require('../models/ClickLog'); // 1. Imported ClickLog model
const generateSlug = require('../utils/generateSlug');
const extractTelemetry = require('../utils/telemetry'); // 2. Imported telemetry helper

// POST: /api/shorten
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl, customSlug } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    let slug = customSlug ? customSlug.trim() : generateSlug();

    const existing = await Url.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: 'This slug or alias is already in use.' });
    }

    const newUrl = await Url.create({
      originalUrl,
      slug
    });

    const shortUrl = `${process.env.BASE_URL}/${newUrl.slug}`;
    return res.status(201).json({
      originalUrl: newUrl.originalUrl,
      shortUrl,
      slug: newUrl.slug
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: /:slug (Redirect Route with Telemetry Logging)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Look up the link
    const urlRecord = await Url.findOne({ slug });

    if (!urlRecord) {
      return res.status(404).send('Short URL not found');
    }

    // 2. Extract telemetry details from the request
    const telemetryData = extractTelemetry(req);

    // 3. Save click record asynchronously
    ClickLog.create({
      urlId: urlRecord._id,
      ...telemetryData
    }).catch(err => console.error('Failed to log click telemetry:', err));

    // 4. Increment the basic click counter
    urlRecord.clicks += 1;
    await urlRecord.save();

    // 5. Redirect the visitor to the original destination
    return res.redirect(urlRecord.originalUrl);
  } catch (error) {
    console.error('Error handling redirect:', error);
    return res.status(500).send('Internal Server Error');
  }
});
// GET: /api/analytics/:slug (Fetch aggregated telemetry for charts)
router.get('/analytics/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Find the URL record
    const urlRecord = await Url.findOne({ slug });
    if (!urlRecord) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // 2. Fetch all clicks for this link
    const totalClicks = urlRecord.clicks || 0;

    // 3. Unique visitors based on distinct IP hashes
    const uniqueVisitors = (await ClickLog.distinct('ipHash', { urlId: urlRecord._id })).length;

    // 4. Breakdown by Device Type
    const devices = await ClickLog.aggregate([
      { $match: { urlId: urlRecord._id } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $project: { device: '$_id', count: 1, _id: 0 } }
    ]);

    // 5. Breakdown by Top Countries
    const countries = await ClickLog.aggregate([
      { $match: { urlId: urlRecord._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { country: '$_id', count: 1, _id: 0 } }
    ]);

    // 6. Breakdown by Browser
    const browsers = await ClickLog.aggregate([
      { $match: { urlId: urlRecord._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { browser: '$_id', count: 1, _id: 0 } }
    ]);

    return res.status(200).json({
      slug: urlRecord.slug,
      originalUrl: urlRecord.originalUrl,
      createdAt: urlRecord.createdAt,
      totalClicks,
      uniqueVisitors,
      devices,
      countries,
      browsers
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;