
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
    headers: {
      'Accept': `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`
    }
  }

  const fingerUrl = `https://${domain.trim()}/.well-known/webfinger?resource=acct:${username.trim()}@${domain.trim()}`;
  cb(`Fetching ${fingerUrl}`);
  let finger;
  try {
    finger = await fetch(fingerUrl, fetchOpts).then(res => {
      return res.json();
    });
  } catch(e) {
    return { error: true, message: e.message };
  }
  cb(JSON.stringify(finger, null, 2), 'plain');
  // if response
  let actorUrl;
  for (const item of finger.links) {
    if (item.rel === 'self' && item.type.includes('json')) { // could be ld+json or activity+json
      actorUrl = item.href;
    }
  }
  if (!actorUrl) {
    return { error: true, message: 'Unable to determine url for actor data' };
  }
  cb(`Fetching ${actorUrl}`);
  let actor;
  try {
    actor = await fetch(actorUrl, fetchOpts).then(res => {
      return res.json();
    });
  } catch(e) {
    return { error: true, message: e.message };
  }
  //cb(JSON.stringify(actor, null, 2), 'plain');
  cb('Found actor ...');
  const counts = {};
  for await (const attr of ['following', 'followers', 'outbox']) {
    if (actor.hasOwnProperty(attr)) {
      cb(`Fetching ${actor[attr]}`);
      const result = await fetch(actor[attr], fetchOpts).then(res => {
        return res.json();
      });
      counts[attr] = result.totalItems;
      cb(`Returned ${attr}:`);
      cb(JSON.stringify(result, null, 2), 'plain');
    }
  };
  cb(JSON.stringify({
    preferredUsername: actor.preferredUsername,
    icon: actor.icon,
    name: actor.name,
    url: actor.url,
    id: actor.id,
    followingCount: counts.following,
    followersCount: counts.followers,
  }, null, 2), null, true);
  return {
    error: null,
    message: 'Done here for now',
  };
}
