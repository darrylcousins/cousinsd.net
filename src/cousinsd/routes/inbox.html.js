const createButton = (content, style, id, type, index) => {
  //const classes = `pointer br2 ba pv2 ph4 ml1 mv1 bg-animate border-box b--navy bg-near-white black-70 hover-bg-moon-gray relative`;
  let colors;
  if (style === 'blue') {
    colors = `bg-navy hover-bg-dark-blue`;
  } else if (style === 'red') {
    colors = `bg-dark-red hover-bg-red`;
  } else if (style === 'gold') {
    colors = `bg-orange hover-bg-gold`;
  } else if (style === 'green') {
    colors = `bg-dark-green hover-bg-green`;
  } else if (style === 'grey') {
    colors = ` bg-dark-gray hover-bg-gray`;
  }
  const classes = `fr pointer br1 ba white b--moon-gray pv2 ph4 ml1 mv1 bg-animate border-box relative ${colors}`;
  return `<button
    id="${content}-${type}-${id}" 
    class="${classes}" title="${content}" type="button">${content}</button>`;
}

export default (doc) => {
  let result = '';
  for (let [index, message] of doc.entries()) {
    const { _id, actor, data, inserted } = message;
    const id = _id;
    result += `
      <div id="wrapper-${id}" class="mb4 collapsible" data-collapsed="false">
        <div class="orange bt pt2 mt3">${inserted}</div>
        ${data.type === 'Follow' ? createButton('Accept', 'green', id, data.type, index) : ''}
        ${createButton('Ignore', 'gold', id, data.type, index)}
        <div class="mb1 cf"></div>
        <div class="mb3">
          <div class="dib w4">Actor:</div>
          <div class="dib">
            <a href="${actor.id}" target="_blank" class="no-underline underline-hover light-blue dim">${actor.id}</a>
          </div>
        </div>
        <div>
          <div class="dib w4">Type:</div>
          <div class="dib"><b>${data.type}</b></div>
        </div>
        <div id="action-${id}" class="collapsible" data-collapsed="true"></div>
        <div id="controller-${id}" class="pointer">
          <div class="dib w4">Data:</div>
          <div class="dib">${caret}</div>
        </div>
        </div>
        <div id="data-${id}" class="collapsible">
          <div id="object-${id}" class="code">${JSON.stringify(data, null, 2)}</div>
        </div>
      </div>
    `;
  }
  return result;
}

const caret = `<svg transform="rotate(0)" width="15px" height="15px" class="dib" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 15" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414" style="width: 1.2em; height: 1.2em; margin: 0.5em 0px 0px;"><path d="M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z"></path><path d="m18 13-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z"></path></svg>`;
