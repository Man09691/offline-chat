const forge = require('node-forge');
const fs = require('fs');
const os = require('os');

// Get your local IP
const interfaces = os.networkInterfaces();
let localIP = '127.0.0.1';
Object.values(interfaces).forEach(iface => {
  iface.forEach(d => {
    if (d.family === 'IPv4' && !d.internal) localIP = d.address;
  });
});
console.log('📡 Generating cert for IP:', localIP);

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{ name: 'commonName', value: localIP }];
cert.setSubject(attrs);
cert.setIssuer(attrs);

// ✅ This is the key fix — SAN with IP
cert.setExtensions([{
  name: 'subjectAltName',
  altNames: [
    { type: 7, ip: localIP },
    { type: 7, ip: '127.0.0.1' }
  ]
}]);

cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync('key.pem', forge.pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync('cert.pem', forge.pki.certificateToPem(cert));

console.log('✅ cert.pem and key.pem generated with SAN!');