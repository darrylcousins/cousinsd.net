// build the body of the document
export default (req, res, doc) => {
  const button = `pointer br1 ba white b--moon-gray pv2 ph4 ml1 mv1 bg-animate border-box relative bg-dark-gray hover-bg-gray`;
  let result = '';
  result += `
  <h2>${doc.name}</h2>
  <p class="copy">${doc.summary}</p>
  <p class="copy bt pt3">
    <label for="search">Search ActivityPub:</label>
    <input class="mr1 pa2 ba bg-transparent hover-bg-near-white w5 input-reset br1 near-white hover-black" 
      type="search" id="search" name="search">
    <input type="submit" id="searchButton" class="${button}">
  </p>
  <div id="final-search" class="collapsible" data-collapsed="true"></div>
  <div id="action-search" class="collapsible" data-collapsed="true"></div>
  <div id="action-follow" class="collapsible" data-collapsed="true"></div>
  `;
  return result;
}
