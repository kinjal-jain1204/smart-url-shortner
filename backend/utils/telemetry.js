const crypto = require('crypto');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

function extractTelemetry(req) {
  // 1. Extract IP address (handles proxies and local development)
  const rawIp = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() || 
    req.socket.remoteAddress || 
    '127.0.0.1';

  // 2. Anonymize IP using SHA-256 hash for privacy
  const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex');

  // 3. Resolve Geolocation from IP
  const geo = geoip.lookup(rawIp);
  const country = geo ? geo.country : 'Unknown';
  const city = geo ? geo.city : 'Unknown';

  // 4. Parse User-Agent Header
  const userAgentString = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgentString);
  const parsedUA = parser.getResult();

  const browser = parsedUA.browser.name || 'Unknown';
  const os = parsedUA.os.name || 'Unknown';
  const rawDeviceType = parsedUA.device.type; // mobile, tablet, or undefined (desktop)
  const deviceType = rawDeviceType ? rawDeviceType : 'desktop';

  // 5. Bot Detection
  const botPattern = /bot|crawler|spider|crawling|curl|postman/i;
  const isBot = botPattern.test(userAgentString);

  // 6. Referrer extraction
  let referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
  if (referrer !== 'Direct') {
    try {
      const parsedUrl = new URL(referrer);
      referrer = parsedUrl.hostname; // store "instagram.com" instead of full messy query string
    } catch {
      referrer = 'Direct';
    }
  }

  return {
    ipHash,
    country,
    city,
    deviceType,
    os,
    browser,
    referrer,
    isBot
  };
}

module.exports = extractTelemetry;