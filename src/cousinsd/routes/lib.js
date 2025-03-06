export const dateString = (d) => {
  d = new Date(d);
  const days = d.toDateString();
  const hours = `${ d.getHours() }`.padStart(2, '0');
  const minutes = `${ d.getMinutes() }`.padStart(2, '0');
  return `${days} ${hours}:${minutes}`;
}

export const createButton = (content, style, id, type, index) => {
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

export const caret = `<svg transform="rotate(0)" width="15px" height="15px" class="dib" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 15" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414" style="width: 1.2em; height: 1.2em; margin: 0.5em 0px 0px;"><path d="M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z"></path><path d="m18 13-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z"></path></svg>`;
