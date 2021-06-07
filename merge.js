const algoliasearch = require('algoliasearch');
const {chunk} = require('lodash');

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

const docsets = [
  'rover',
  'studio',
  'federation',
  'react',
  'android',
  'ios',
  'server'
];

const mainIndex = client.initIndex('docs');
const subIndices = docsets.map(docset => client.initIndex(docset));

async function fetchAll() {
  const objs = await Promise.all(
    subIndices.map(async theIndex => fetch(theIndex))
  );
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
  console.log(allObjs.length);
  const chunkSize = 1000;
  const chunks = chunk(allObjs, chunkSize);

  mainIndex.saveObjects(allObjs);

  const chunkJobs = chunks.map(async function (chunked) {
    return mainIndex.saveObjects(chunked).wait();
  });

  await Promise.all(chunkJobs);
}

sendAll();

// async function moveIndex(client, sourceIndex, targetIndex) {
//   const {taskID} = await client.moveIndex(
//     sourceIndex.indexName,
//     targetIndex.indexName
//   );
//   return targetIndex.waitTask(taskID);
// }
