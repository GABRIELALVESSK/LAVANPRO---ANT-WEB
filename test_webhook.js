const http = require('http');

// Configurações do seu teste
const WEBHOOK_URL = 'http://localhost:3000/api/asaas/webhook';
const WEBHOOK_SECRET = 'whsec_gJ1yBM4VJBRVmaEJHcn0lbA0hKx_rTK0NRjUHt0Azvc'; // O mesmo do seu .env.local

// Simulação de um Owner ID (Você pode pegar o seu real no console do navegador console.log(user.id))
// Se você não souber o seu, o teste vai tentar rodar mas o banco não vai atualizar o usuário correto.
const OWNER_ID = 'ea331ea5-0fa3-4848-b1ac-e2590bfaaa85'; // Exemplo

const payload = JSON.stringify({
    event: "PAYMENT_CONFIRMED",
    payment: {
        id: "pay_123456789",
        customer: "cus_123456789",
        value: 197.00, // Preço do plano Pro
        netValue: 190.00,
        billingType: "CREDIT_CARD",
        status: "CONFIRMED",
        externalReference: OWNER_ID // Referência para ligar com seu usuário no Supabase
    }
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'asaas-access-token': WEBHOOK_SECRET,
        'Content-Length': payload.length
    }
};

console.log('🚀 Iniciando teste de Webhook do Asaas...');
console.log(`Enviando para: ${WEBHOOK_URL}`);

const req = http.request(WEBHOOK_URL, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ SUCESSO! O servidor recebeu o webhook e respondeu OK.');
            console.log('Resposta do servidor:', data);
            console.log('\nVerifique no seu sistema se o seu plano foi atualizado para "PRO".');
        } else {
            console.log(`❌ ERRO: O servidor respondeu com status ${res.statusCode}`);
            console.log('Detalhes do erro:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ FALHA AO CONECTAR: ${e.message}`);
    console.log('Certifique-se de que o programa (npm run dev) está rodando no localhost:3000');
});

req.write(payload);
req.end();
