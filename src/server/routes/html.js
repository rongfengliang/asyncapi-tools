const os = require('os');
const express = require('express');
const router = express.Router();
const AsyncAPIGenerator = require('asyncapi-generator');
const archiver = require('archiver');
const version = require('../middlewares/version');

module.exports = router;

router.post('/generate', version, async (req, res) => {
  try {
    const generator = new AsyncAPIGenerator('html', os.tmpdir(), {
      entrypoint: 'index.html',
      output: 'string',
    });
    const html = await generator.generateFromString(req.body);

    res.send(html);
  } catch (e) {
    return res.status(422).send({
      code: 'incorrect-format',
      message: e.message,
      errors: Array.isArray(e.errors) ? e.errors : null
    });
  }
});

router.get('/template/css/*', async (req, res) => {
  const filename = req.params[0];

  try {
    const content = await AsyncAPIGenerator.getTemplateFile('html', `css/${filename}`);

    res.header('Content-Type', 'text/css').send(content);
  } catch (e) {
    console.error(e);
    return res.status(404).send();
  }
});

router.get('/template/js/*', async (req, res) => {
  const filename = req.params[0];

  try {
    const content = await AsyncAPIGenerator.getTemplateFile('html', `js/${filename}`);

    res.header('Content-Type', 'application/javascript').send(content);
  } catch (e) {
    console.error(e);
    return res.status(404).send();
  }
});

router.post('/download', version, async (req, res, next) => {
  const archive = archiver('zip');
  res.attachment('asyncapi.zip');
  archive.pipe(res);

  archive.append(req.body.data, { name: 'asyncapi.yml' });
  try {
    const generator = new AsyncAPIGenerator('html', os.tmpdir(), {
      entrypoint: 'index.html',
      output: 'string',
    });
    const html = await generator.generateFromString(req.body.data);
    archive.append(html, { name: 'index.html' });
  } catch (e) {
    console.error(e);
    return res.status(422).send({
      code: 'incorrect-format',
      message: e.message,
      errors: Array.isArray(e) ? e : null
    });
  }

  try {
    const css = await AsyncAPIGenerator.getTemplateFile('html', 'css/tailwind.min.css');
    archive.append(css, { name: 'css/tailwind.min.css' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }

  try {
    const css = await AsyncAPIGenerator.getTemplateFile('html', 'css/atom-one-dark.min.css');
    archive.append(css, { name: 'css/atom-one-dark.min.css' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }

  try {
    const css = await AsyncAPIGenerator.getTemplateFile('html', 'css/main.css');
    archive.append(css, { name: 'css/main.css' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }

  try {
    const js = await AsyncAPIGenerator.getTemplateFile('html', 'js/highlight.min.js');
    archive.append(js, { name: 'js/highlight.min.js' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }

  try {
    const js = await AsyncAPIGenerator.getTemplateFile('html', 'js/main.js');
    archive.append(js, { name: 'js/main.js' });

    archive.finalize();
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }
});
