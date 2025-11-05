// Polyfills for Jest testing environment

// URL polyfill
const { URL, URLSearchParams } = require('url');
global.URL = URL;
global.URLSearchParams = URLSearchParams;
// TextEncoder/TextDecoder polyfill
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// Fetch polyfill
global.fetch = require('jest-fetch-mock');
