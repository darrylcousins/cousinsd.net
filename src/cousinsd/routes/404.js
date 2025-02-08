import html from './template.js';

export default async (req, res) => {
  res.write(html({
    title: `Darryl Cousins - 404`,
    body: `<h1>404 - Not Found - ${req.filename}</h1>`,
  }));
}

