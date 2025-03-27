const fs = require("fs");
const dotenv = require("dotenv");

const envFile = process.argv[2] === "prod" ? ".env.prod" : ".env";
const envConfig = dotenv.parse(fs.readFileSync(envFile));

const envObject = Object.entries(envConfig)
  .map(([key, value]) => `  window.__env.${key} = '${value}';`)
  .join("\n");

const output = `
(function(window) {
window.__env = window.__env || {};

${envObject}
})(this);
`;

fs.writeFileSync("./src/assets/d9a1251fe9ae.js", output);

console.log(`✅ Environment file generated from ${envFile}`);
