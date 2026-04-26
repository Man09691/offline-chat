const forge = require('node-forge');
const fs = require('fs');
const os = require('os');

// Get local IP automatically
const interfaces = os.networkInterfaces();
let localIP = '127.0.0.1';
Object.values(interfaces).forEach(iface => {
    iface.forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
            localIP = details.address;
        }
    });
});

console.log('Generating cert for IP:', localIP);

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [{ name: 'commonName', value: localIP }];
cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add IP as Subject Alternative Name — this is what Chrome checks
cert.setExtensions([{
    name: 'subjectAltName',
    altNames: [
        { type: 7, ip: localIP },
        { type: 7, ip: '127.0.0.1' },
        { type: 2, value: 'localhost' }
    ]
}]);

cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync('cert.pem', forge.pki.certificateToPem(cert));
fs.writeFileSync('key.pem', forge.pki.privateKeyToPem(keys.privateKey));
console.log('✅ cert.pem and key.pem generated for', localIP, '(valid 10 years)');