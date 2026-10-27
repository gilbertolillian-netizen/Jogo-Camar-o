const fs = require("fs"), path = require("path"), os = require("os"), readline = require("readline");
const { subtle } = require("crypto").webcrypto;
const KEYFILE = process.env.CAM_KEYFILE || path.join(os.homedir(), ".camarao-private-key.json");
const OUT = process.env.CAM_OUT || path.join(__dirname, "..", "www", "donate-config.js");
const arg = n => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
(async () => {
  let pix = arg("pix"), nome = arg("nome"), cidade = arg("cidade"), contato = arg("contato");
  if (!pix) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const q = t => new Promise(r => rl.question(t, r));
    pix = (await q("Chave Pix (de preferência uma chave aleatória): ")).trim();
    nome = (await q("Nome que aparece no Pix (até 25 letras): ")).trim();
    cidade = (await q("Cidade (até 15 letras): ")).trim();
    contato = (await q("Como o apoiador fala com você? (WhatsApp, Instagram, e-mail ou link): ")).trim();
    rl.close();
  }
  if (!pix) { console.error("A chave Pix é obrigatória."); process.exit(1); }
  let priv;
  if (fs.existsSync(KEYFILE)) {
    priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
    console.log("Usando a chave que já existe em " + KEYFILE);
  } else {
    const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    priv = await subtle.exportKey("jwk", kp.privateKey);
    fs.writeFileSync(KEYFILE, JSON.stringify(priv), { mode: 0o600 });
    console.log("Chave privada criada em " + KEYFILE);
    console.log("GUARDE UMA CÓPIA dela em lugar seguro. NUNCA envie para o GitHub.");
  }
  const cfg = { pix, nome: nome || "", cidade: cidade || "", contato: contato || "", pub: { kty: priv.kty, crv: priv.crv, x: priv.x, y: priv.y } };
  fs.writeFileSync(OUT, "window.DON=" + JSON.stringify(cfg, null, 1) + ";\n");
  console.log("Configuração gravada em " + OUT);
})();
EOFcat > ~/camarao/tools/gerar-codigo.js <<'EOF'
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto");
const { subtle } = crypto.webcrypto;
const KEYFILE = process.env.CAM_KEYFILE || path.join(os.homedir(), ".camarao-private-key.json");
(async () => {
  if (!fs.existsSync(KEYFILE)) { console.error("Chave não encontrada. Rode antes: node tools/configurar-doacao.js"); process.exit(1); }
  const priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
  const key = await subtle.importKey("jwk", priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const alf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const n = Math.max(1, +process.argv[2] || 1);
  const dia = process.env.CAM_DIA ? +process.env.CAM_DIA : Math.floor(Date.now() / 864e5);
  for (let i = 0; i < n; i++) {
    const b = crypto.randomBytes(6);
    let id = ""; for (const x of b) id += alf[x % alf.length];
    const corpo = "CAM1." + id + "-" + dia;
    const sig = Buffer.from(await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, Buffer.from(corpo))).toString("base64url");
    console.log(corpo + "." + sig);
  }
})();
EOF 
git add -A
git commit -m "apoio por pix"
cat > ~/camarao/tools/configurar-doacao.js <<'EOF'
const fs = require("fs"), path = require("path"), os = require("os"), readline = require("readline");
const { subtle } = require("crypto").webcrypto;
const KEYFILE = process.env.CAM_KEYFILE || path.join(os.homedir(), ".camarao-private-key.json");
const OUT = process.env.CAM_OUT || path.join(__dirname, "..", "www", "donate-config.js");
const arg = n => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
(async () => {
  let pix = arg("pix"), nome = arg("nome"), cidade = arg("cidade"), contato = arg("contato");
  if (!pix) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const q = t => new Promise(r => rl.question(t, r));
    pix = (await q("Chave Pix (de preferência uma chave aleatória): ")).trim();
    nome = (await q("Nome que aparece no Pix (até 25 letras): ")).trim();
    cidade = (await q("Cidade (até 15 letras): ")).trim();
    contato = (await q("Como o apoiador fala com você? (WhatsApp, Instagram, e-mail ou link): ")).trim();
    rl.close();
  }
  if (!pix) { console.error("A chave Pix é obrigatória."); process.exit(1); }
  let priv;
  if (fs.existsSync(KEYFILE)) {
    priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
    console.log("Usando a chave que já existe em " + KEYFILE);
  } else {
    const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    priv = await subtle.exportKey("jwk", kp.privateKey);
    fs.writeFileSync(KEYFILE, JSON.stringify(priv), { mode: 0o600 });
    console.log("Chave privada criada em " + KEYFILE);
    console.log("GUARDE UMA CÓPIA dela em lugar seguro. NUNCA envie para o GitHub.");
  }
  const cfg = { pix, nome: nome || "", cidade: cidade || "", contato: contato || "", pub: { kty: priv.kty, crv: priv.crv, x: priv.x, y: priv.y } };
  fs.writeFileSync(OUT, "window.DON=" + JSON.stringify(cfg, null, 1) + ";\n");
  console.log("Configuração gravada em " + OUT);
})();
EOFcat > ~/camarao/tools/gerar-codigo.js <<'EOF'
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto");
const { subtle } = crypto.webcrypto;
const KEYFILE = process.env.CAM_KEYFILE || path.join(os.homedir(), ".camarao-private-key.json");
(async () => {
  if (!fs.existsSync(KEYFILE)) { console.error("Chave não encontrada. Rode antes: node tools/configurar-doacao.js"); process.exit(1); }
  const priv = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
  const key = await subtle.importKey("jwk", priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const alf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const n = Math.max(1, +process.argv[2] || 1);
  const dia = process.env.CAM_DIA ? +process.env.CAM_DIA : Math.floor(Date.now() / 864e5);
  for (let i = 0; i < n; i++) {
    const b = crypto.randomBytes(6);
    let id = ""; for (const x of b) id += alf[x % alf.length];
    const corpo = "CAM1." + id + "-" + dia;
    const sig = Buffer.from(await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, Buffer.from(corpo))).toString("base64url");
    console.log(corpo + "." + sig);
  }
})();
EOF 
