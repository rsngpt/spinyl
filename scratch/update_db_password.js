const https = require('https');

const token = 'sbp_67e2290f4b61c7f7032d1be90b5d5a7a70ce2f47';
const projectRef = 'ngpbgyqybxzbzzfkoyew';
const newPassword = 'SpinylDb2026Password!';

const data = JSON.stringify({
  password: newPassword
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/password`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending PATCH request to update database password...');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Body: ${body}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Database password updated successfully!');
      process.exit(0);
    } else {
      console.error('Failed to update database password.');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request Error: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
