#!/usr/bin/env node
// Cria a chave que o SERVIDOR usa para assinar os códigos do Pix automático.
// A chave pública é adicionada ao donate-config.js; a privada é mostrada UMA vez para você colar na Cloudflare (segredo SIGN_KEY).
const fs = require("fs"), path = require("path"), os = require("os");
const { subtle } = require("crypto").webcrypto;
const KEYFILE = process.env.CAM_SERVERKEY || path.join(os.homedir(), ".camarao-server-key.json");
const CFG = process.env.CAM_OUT || path.join(__dirname, "..", "www", "donate-config.js");
(async () => {
  if (!fs.existsSync(CFG)) { console.error("Não achei " + CFG + ". Rode antes: node tools/configurar-doacao.js"); process.exit(1); }
  const src = fs.readFileSync(CFG, "utf8");
  const m = src.match(/^window\.DON=([\s\S]*);\s*$/);
  if (!m) { console.error("Formato inesperado em " + CFG); process.exit(1); }
  let priv;
  if (fs.existsSync(KEYFILE)) {
    priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
    console.log("Usando a chave do servidor que já existe em " + KEYFILE);
  } else {
    const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    priv = await subtle.exportKey("jwk", kp.privateKey);
    fs.writeFileSync(KEYFILE, JSON.stringify(priv), { mode: 0o600 });
    console.log("Chave do servidor criada em " + KEYFILE);
  }
  const cfg = JSON.parse(m[1]);
  const pub = { kty: priv.kty, crv: priv.crv, x: priv.x, y: priv.y };
  cfg.pubs = (cfg.pubs || []).filter(k => !(k.x === pub.x && k.y === pub.y)).concat([pub]);
  fs.writeFileSync(CFG, "window.DON=" + JSON.stringify(cfg, null, 1) + ";\n");
  console.log("Chave pública do servidor adicionada em " + CFG);
  console.log("\nCOPIE a linha abaixo e cole como segredo SIGN_KEY na Cloudflare (não envie a ninguém):\n");
  console.log(JSON.stringify(priv));
})();
