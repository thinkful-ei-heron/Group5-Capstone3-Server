const express = require('express');
const ProxyRouter = express.Router();
const fetch = require('node-fetch');

ProxyRouter.route('/wayback').get(async (req, res) => {
  const { target } = req.query;
  const prepped = encodeURIComponent(target.split('://')[1]);
  const waybackRes = await fetch(
    `http://archive.org/wayback/available?url=${prepped}`
  );
  if (!waybackRes.ok) {
    return res.status(waybackRes.status).json({ error: 'wayback error' });
  }
  const json = await waybackRes.json();
  const { archived_snapshots, url } = json;
  return res.status(200).json({ archived_snapshots, url });
});
ProxyRouter.route('/memento').get(async (req, res) => {
  const { target } = req.query;
  if (target.includes('?')) {
    //need to partially URI encode
    const parts = target.split('?');
    parts[1] = encodeURIComponent(parts[1]);
    target = parts.join('%3f');
  }
  const mementoRes = await fetch(
    `http://timetravel.mementoweb.org/prediction/json/${target}`
  );
  if (!mementoRes.ok) {
    return res.status(mementoRes.status).json({ error: 'memento error' });
  }
  const { original_uri, memento_info } = await mementoRes.json();
  return res.status(200).json({ original_uri, memento_info });
});

module.exports = ProxyRouter;
