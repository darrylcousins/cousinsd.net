import crypto from 'node:crypto';

class Signature {

  constructor() {
  }

  sign(strToSign, privateKey) {
    const signer = crypto.createSign('rsa-sha256');
    signer.update(strToSign);
    const signed = signer.sign(privateKey);
		signer.end();
    return signed.toString('base64'); // convert Buffer to base64 string
  }

  getDigest(reqBody) {
    return "SHA-256=" + crypto
      .createHash("rsa-sha256")
      .update(reqBody)
      .digest("base64");
  }

  //stringToSign({ path, host, date, reqBody }) {
  stringToSign(opts) {
    let strToSign = '';
    const entries = Object.entries(opts);
    let count = 1;
    for (const [k, v] of Object.entries(opts)) {
      strToSign += `${k}: ${v}`;
      if (count < entries.length) {
        strToSign += `\n`;
      }
      count++;
    }
    return strToSign;
  }

  validate({ path, reqBody, headers, publicKey }) {
    // first explode signature to get the key value pairs
    const fields = {};
    for (const pair of headers.signature.split(',')) {
      fields[pair.substring(0, pair.indexOf('='))] = pair.substring(pair.indexOf('=') + 2, pair.length - 1);
    }
    const algorithm = Object.hasOwnProperty.call(fields, 'algorithm') ? fields.algorithm : 'rsa-sha256';
    const opts = { };
    
    // 'headers' contains the list of fields used in the signature
    for (const header of fields.headers.split(' ')) {
      if (header === '(request-target)') {
        opts['(request-target)'] = `post ${path}`;
      } else if (header === 'digest') {
        opts.digest = this.getDigest(reqBody);
      } else {
        if (Object.hasOwnProperty.call(headers, header.replace('-', '_'))) {
          opts[header] = headers[header.replace('-', '_')];
        }
      }
    }
    const signature = Buffer.from(fields.signature, 'base64');
		const verifier = crypto.createVerify(algorithm);
    const strToSign = this.stringToSign(opts);
		verifier.write(strToSign);
		verifier.end();
		const valid = verifier.verify(publicKey, signature);
    return valid;
  }

  headers({ inbox, reqBody, privateKey, keyId }) {
		const date = new Date().toUTCString();
    const url = new URL(inbox);
    const host = url.host;
    const path = url.pathname;
    const digest = this.getDigest(reqBody);
    const headerNames = ["(request-target)", "host", "date", "digest"];
    const opts = {
      "(request-target)": `post ${path}`,
      host,
      date,
      digest
    };
    const strToSign = this.stringToSign(opts);
    const signed_b64 = this.sign(strToSign, privateKey);
    const signature = `keyId="${keyId}",headers="${headerNames.join(' ')}",signature="${signed_b64}",algorithm="rsa-sha256"`;
    //const signature = `keyId="${keyId}",headers="${headerNames.join(' ')}",signature="${signed_b64}"`;

    return {
      date,
      host,
      signature,
      digest,
      accept: 'application/activity+json',
      'content-type': 'application/activity+json',
    }
  }

}

export default Signature;
