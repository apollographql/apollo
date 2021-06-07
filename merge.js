const algoliasearch = require('algoliasearch');
const {chunk} = require('lodash');

const CHUNK_SIZE = 1000;
const DOCSETS = [
  'rover',
  'studio',
  'federation',
  'react',
  'android',
  'ios',
  'server'
];

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

const mainIndex = client.initIndex('docs');
const subIndices = DOCSETS.map(docset => client.initIndex(docset));

async function fetchAll() {
  const objs = await Promise.all(subIndices.map(fetch));
  return objs.flat();
}

async function fetch(index) {
  let hits = [];
  await index.browseObjects({
    query: '',
    batch: batch => {
      hits = hits.concat(batch);
    }
  });
  return hits;
}

async function sendAll() {
  const allObjs = await fetchAll();
  const chunks = chunk(allObjs, CHUNK_SIZE);

  // mainIndex.saveObjects(allObjs);
  const jobs = chunks.map(async (chunk, index, array) => {
    const xOfY = `${index + 1} of ${array.length}`;
    console.log(`Saving chunk ${xOfY}`);
    await mainIndex.saveObjects(chunk).wait();
    console.log(`Chunk ${xOfY} saved`);
    return chunk.length;
  });

  return Promise.all(jobs);
}

sendAll().then(results => {
  const totalObjs = results.reduce((acc, result) => acc + result, 0);
  console.log('Docs index merge complete. %s objects merged.', totalObjs);
});

// async function moveIndex(client, sourceIndex, targetIndex) {
//   const {taskID} = await client.moveIndex(
//     sourceIndex.indexName,
//     targetIndex.indexName
//   );
//   return targetIndex.waitTask(taskID);
// }
