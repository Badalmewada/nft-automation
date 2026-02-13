const crypto = require("crypto");

const SECRET = "dev-secret-key";

function encrypt(text) {
  const cipher = crypto.createCipher("aes-256-ctr", SECRET);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipher("aes-256-ctr", SECRET);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
