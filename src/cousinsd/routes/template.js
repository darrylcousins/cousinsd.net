
const html = ({title, body, guid, env}) => `<!DOCTYPE html>
<html lang="en">
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/cousinsd/tachyons.min.css">
<link rel="stylesheet" href="/cousinsd/index.css">
<link rel="canonical" href="https://cousinsd.net/" />
<body style="background: #0d1117">
  <div id="loadOverlay" style="background-color:#0d1117; position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:2000;"></div>
  <header class="content dn">
    <nav class="dt w-100 tr pr5"> 
      <div class="dtc v-mid tr pa3">
      ${env.remote_addr === env.authip && `
      <a class="f6 fw4 hover-white no-underline white-70 dib pv2 ph3" href="/cousinsd/">home</a> 
      <a class="f6 fw4 hover-white no-underline white-70 dib pv2 ph3" href="/cousinsd/inbox">inbox</a> 
      `}
      <a class="f6 fw4 hover-white no-underline white-70 div pv2 ph3" href="/cousinsd/outbox">outbox</a> 
      <a class="f6 fw4 hover-white no-underline white-70 dib pv2 ph3" href="/cousinsd/index">index</a> 
      <a class="f6 fw4 hover-white no-underline white-70 dib pv2 ph3" href="/cousinsd/profile">profile</a> 
      <a class="f6 fw4 hover-white no-underline white-70 dib pv2 ph3" href="/cousinsd/followers">followers</a> 
      <a class="f6 fw4 hover-white no-underline white-70 div pv2 ph3" href="/cousinsd/following">following</a> 
      </div>
    </nav> 
  </header>
  <main class="content mh5 dn">
    ${title ? `<h1>${title}</h1>` : ''}
    ${body}
    <div class="mt5 fr">${env.remote_addr}</div>
  </main>
  <script type="module" crossorigin src="/cousinsd/index.js"></script>
  <token value="${guid}"></token>
</body>
</html>
`;

export default html;
