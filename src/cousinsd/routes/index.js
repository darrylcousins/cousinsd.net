export default (data) => {
  return `<p>Bleh</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
}
