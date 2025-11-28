#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Instalare Sistem Formulare Electronice (Versiune Simplificată)');
console.log('================================================================\n');

// Verificare Node.js
function checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
        console.error('❌ Node.js versiunea 14 sau mai nouă este necesară');
        console.error(`   Versiunea curentă: ${nodeVersion}`);
        process.exit(1);
    }
    
    console.log(`✅ Node.js ${nodeVersion} - OK`);
}

// Creare directoare necesare
function createDirectories() {
    const dirs = ['uploads', 'logs', 'backups'];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Director creat: ${dir}`);
        } else {
            console.log(`📁 Director există: ${dir}`);
        }
    });
}

// Creare fișier de date demo
function createDemoData() {
    const demoData = [
        {
            id: 1,
            reference: 'REF-DEMO-001',
            payerName: 'SC DEMO SRL',
            payerCUI: '12345678',
            beneficiaryName: 'ANAF',
            beneficiaryCUI: '12345679',
            totalAmount: 6200.00,
            currency: 'RON',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            reference: 'REF-DEMO-002',
            payerName: 'SC EXEMPLU SA',
            payerCUI: '87654321',
            beneficiaryName: 'Primăria Sector 1',
            beneficiaryCUI: '87654322',
            totalAmount: 2975.00,
            currency: 'RON',
            status: 'approved',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];
    
    const dataFile = 'forms-data.json';
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify(demoData, null, 2));
        console.log('📄 Fișier demo creat: forms-data.json');
    } else {
        console.log('📄 Fișier demo există: forms-data.json');
    }
}

// Afișare instrucțiuni finale
function showFinalInstructions() {
    console.log('\n🎉 Instalarea s-a completat cu succes!');
    console.log('\n📋 Următorii pași:');
    console.log('1. Rulați: npm start');
    console.log('2. Accesați: http://localhost:3000');
    console.log('\n🌐 Pagini disponibile:');
    console.log('   📝 Formular: http://localhost:3000');
    console.log('   🔧 Admin: http://localhost:3000/admin');
    console.log('   🔍 Status: http://localhost:3000/status');
    console.log('\n✅ Sistemul funcționează fără MySQL!');
    console.log('📄 Datele sunt salvate în fișierul forms-data.json');
    console.log('\n🔧 Comenzi utile:');
    console.log('   npm start          - Pornire server simplificat');
    console.log('   npm run start-full - Pornire cu MySQL (dacă este instalat)');
    console.log('   npm run dev        - Pornire în mod dezvoltare');
}

// Funcție principală
async function main() {
    try {
        checkNodeVersion();
        createDirectories();
        createDemoData();
        showFinalInstructions();
    } catch (error) {
        console.error('❌ Eroare la instalare:', error.message);
        process.exit(1);
    }
}

// Rulare dacă scriptul este executat direct
if (require.main === module) {
    main();
}

module.exports = { main };
