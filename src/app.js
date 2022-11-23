import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { fileURLToPath } from 'url';
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import ejs from 'ejs';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const getAvailableModels = () => {
  const models2dLocation = path.resolve(__dirname, '..', 'public', 'assets', 'models');
  const models2d = fs.readdirSync(models2dLocation)
    .filter(el => fs.lstatSync(`${models2dLocation}/${el}`).isDirectory())
    .map(el => {
      const name = el.split(/[\s_-]/g).filter(s => ['pro', 'free', 'en', 'cn', 'jp', 'kr'].indexOf(s) === -1).join(' ')
      const [index] = fs.readdirSync(`${models2dLocation}/${el}/runtime`).filter(file => file.indexOf('model3.json') > -1) || [];
      return {
        key: _.startCase(_.toLower(name)),
        val: index ? `/public/assets/models/${el}/runtime/${index}` : null
      }
    })
    .filter(el => el.val);
  return models2d
}

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyStatic, {
  root: publicDir,
  prefix: '/public/',
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'node_modules'),
  prefix: '/node_modules/',
  decorateReply: false // the reply decorator has been added by the first plugin registration
})

fastify.register(fastifyView, {
  engine: { ejs },
  root: path.join(__dirname, 'views'),
  propertyName: 'render', // The template can now be rendered via `reply.render()` and `fastify.render()`
  defaultContext: {
    ENV: process.env.NODE_ENV
  },
});

fastify.get('/:character', (req, reply) => {
  const { character } = req.params;
  const availableModels = getAvailableModels();
  console.log(availableModels)
  const [selectedModel] = availableModels.filter(model => model.key.toLowerCase() === character.toLowerCase())
  if (!selectedModel) return reply.redirect(`/${availableModels[0].key.toLowerCase()}`)
  return reply.render('index.ejs', {
    MODEL_LIVE_2D: selectedModel.val
  });
});

export default fastify
