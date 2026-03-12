
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
console.log('KEY:', process.env.ASAAS_API_KEY);

