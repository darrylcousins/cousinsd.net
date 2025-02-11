
export default async ({ data, mongo, cb }) => {
  const { q } = data;
  if (!q) {
    return {
      error: true,
      message: 'No search input',
    };
  }
  const parts = q.split('@');
  if (parts.length !== 3) {
    return {
      error: true,
      message: 'Incorrect input, please use "@user@domain.net"',
    };
  }
  const [ username, domain ] = parts.slice(1);

  const fetchOpts = {
    method: 'GET',
    accept: 'application/activity+json',
  }

  const fingerUrl = `https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`;
  cb(`Fetching ${fingerUrl}`);
  const finger = await fetch(fingerUrl, fetchOpts).then(res => {
    return res.json();
  });
  cb(JSON.stringify(finger, null, 2), 'plain');
  // if response
  const actorUrl = finger.links[0].href;
  cb(`Fetching ${actorUrl}`);
  const actor = await fetch(actorUrl, fetchOpts).then(res => {
    return res.json();
  });
  let following;
  let followers;
  //cb(JSON.stringify(actor, null, 2), 'plain');
  cb('Found actor ...');
  if (actor.hasOwnProperty('following')) {
    following = await fetch(actor.following, fetchOpts).then(res => {
      return res.json();
    });
    cb('Actor follows:');
    cb(JSON.stringify(following, null, 2), 'plain');
  }
  if (actor.hasOwnProperty('followers')) {
    followers = await fetch(actor.followers, fetchOpts).then(res => {
      return res.json();
    });
    cb('Actor is followed:');
    cb(JSON.stringify(followers, null, 2), 'plain');
  }
  

  return {
    error: null,
    message: 'Done here for now',
  };
}
