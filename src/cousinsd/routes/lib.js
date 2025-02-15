export const dateString = (d) => {
  d = new Date(d);
  const days = d.toDateString();
  const hours = `${ d.getHours() }`.padStart(2, '0');
  const minutes = `${ d.getMinutes() }`.padStart(2, '0');
  return `${days} ${hours}:${minutes}`;
}

