#!/usr/bin/env node
// Gera códigos EXCLUSIVOS de skins especiais. Só quem tem a sua chave privada consegue gerar.
// Uso: node tools/gerar-codigo-exclusivo.js moranguete      (1 código)
//      node tools/gerar-codigo-exclusivo.js salsicha 3      (3 códigos)
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto");
const { subtle } = crypto.webcrypto;
const TIPOS = { moranguete: "MOR1", salsicha: "SAL1" };
const KEYFILE = process.env.CAM_KEYFILE || path.join(os.homedir(), ".camarao-private-key.json");
(async () => {
  const tipo = (process.argv[2] || "").toLowerCase();
  if (!TIPOS[tipo]) { console.error("Use: node tools/gerar-codigo-exclusivo.js " + Object.keys(TIPOS).join("|") + " [quantidade]"); process.exit(1); }
  if (!fs.existsSync(KEYFILE)) { console.error("Chave não encontrada. Rode antes: node tools/configurar-doacao.js"); process.exit(1); }
  const priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
  const key = await subtle.importKey("jwk", priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const alf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const n = Math.max(1, +process.argv[3] || 1);
  const dia = Math.floor(Date.now() / 864e5);
  for (let i = 0; i < n; i++) {
    const b = crypto.randomBytes(6);
    let id = ""; for (const x of b) id += alf[x % alf.length];
    const corpo = TIPOS[tipo] + "." + id + "-" + dia;
    const sig = Buffer.from(await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, Buffer.from(corpo))).toString("base64url");
    console.log(corpo + "." + sig);
  }
})();
