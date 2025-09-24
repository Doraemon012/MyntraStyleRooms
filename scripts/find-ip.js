#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIPAddress();
console.log('🌐 Your local IP address is:', ip);
console.log('📡 Backend URL should be:', `http://${ip}:5000/api`);
console.log('\n📝 Update this in services/api.ts if needed.');
console.log('🔧 Or set EXPO_PUBLIC_API_URL environment variable.');
