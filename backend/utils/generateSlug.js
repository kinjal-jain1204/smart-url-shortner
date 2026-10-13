const crypto = require('crypto');

// Generates a random, URL-safe 6-character Base62-like string
function generateSlug(length = 6) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += characters[randomBytes[i] % characters.length];
  }
  return result;
}

module.exports = generateSlug;