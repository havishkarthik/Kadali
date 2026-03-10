// Validates requests from IoT devices using a shared API key.
// Devices must include the key via the X-Device-Api-Key header.
// Set DEVICE_API_KEY in .env; if not set, the middleware is bypassed in
// development to ease local testing.
function deviceApiKeyAuth(req, res, next) {
  const apiKey = process.env.DEVICE_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ success: false, message: 'Server misconfiguration: DEVICE_API_KEY not set' });
    }
    return next(); // bypass in non-production when key is not configured
  }

  const provided = req.headers['x-device-api-key'];
  if (!provided || provided !== apiKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing device API key' });
  }
  next();
}

module.exports = deviceApiKeyAuth;
