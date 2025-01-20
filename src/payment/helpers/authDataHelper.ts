import { util, pki, jsbn } from 'node-forge';


/**
 * Converts a string to hexadecimal format.
 * @param {string} str - The input string.
 * @returns {string} - The hexadecimal representation of the string.
 */
export const toHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex;
};

/**
 * Generates authentication data.
 * @param {Object} options - The options containing card details and keys.
 * @returns {string} - The encrypted authentication string.
 */
export const authData = (options) => {
  const authString = `1Z${options.card}Z${options.pin}Z${options.exp}Z${options.cvv}`;
  const hexString = toHex(authString);

  const authDataBytes = util.hexToBytes(hexString);
  const clearSecureBytes = util.createBuffer();

  const rsa = pki.rsa;
  const modulos = new jsbn.BigInteger(options.publicKeyModulus, 16);
  const exp = new jsbn.BigInteger(options.publicKeyExponent, 16);
  const publicKey = rsa.setPublicKey(modulos, exp);

  clearSecureBytes.putBytes(authDataBytes);
  const clearBytes = clearSecureBytes.getBytes();

  const encryptedBytes = publicKey.encrypt(clearBytes);
  const auth = util.encode64(encryptedBytes);

  return auth;
};
