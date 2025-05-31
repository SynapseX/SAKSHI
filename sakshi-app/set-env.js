const fs = require("fs");
const dotenv = require("dotenv");

const envFile = process.argv[2] === "prod" ? ".env.prod" : ".env";
const envConfig = dotenv.parse(fs.readFileSync(envFile));

const envObject = Object.entries(envConfig)
  .map(([key, value]) => `  window.b5984ae6676c_public.${key} = '${value}';`)
  .join("\n");

const output = `
(function(window) {
window.b5984ae6676c_public = window.b5984ae6676c_public || {};

${envObject}
})(this);
`;

fs.writeFileSync("./src/assets/d9a1251fe9ae.js", output);

console.log(`✅ Environment file generated from ${envFile}`);
