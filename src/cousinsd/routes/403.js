import html from './template.js';

export default async (req, res) => {
  res.write(html({
    title: `403 Forbidden: ${req.filename}`,
    body: ``,
    env: req.env
  }));
}

