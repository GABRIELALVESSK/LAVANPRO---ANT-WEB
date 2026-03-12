
const key = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlNjg5Nzc2LTA1ZWMtNDk1MC05OTY1LTZkNDMyMTA1NzdmOTo6JGFhY2hfZTFiMDc2ZDgtZmUxMS00NjRiLWE2MGYtZmEyMzcxOTMyMzVh';
const fetch = require('node-fetch');
fetch('https://sandbox.asaas.com/api/v3/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'access_token': key },
  body: JSON.stringify({ name: 'Test', cpfCnpj: '00000000000000' })
}).then(res => res.json()).then(console.log);

