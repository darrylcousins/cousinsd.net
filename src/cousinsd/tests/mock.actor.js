import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const actor = {
  id: "https://mastodon.nz/users/cousinsd",
  inbox: "https://mastodon.nz/users/cousinsd/inbox",
  publicKey: {
    publicKeyPem: fs.readFileSync(join(__dirname, 'test-public.pem')).toString()
  }
};

export default actor;
