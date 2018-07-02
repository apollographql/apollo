---
title: File uploads
description: Implementing file uploads in GraphQL apps
---

File uploads are a requirement for many applications. Apollo Server supports the [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec) for uploading files as mutation arguments using [apollo-upload-server](https://github.com/jaydenseric/apollo-upload-server).

## File upload with default options

Apollo Server automatically adds the `Upload` scalar to the schema, so any existing declaration of `scalar Upload` in the schema should be removed.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Query: {
    files: () => {
      // Return the record of files uploaded from your DB or API or filesystem.
    }
  },
  Mutation: {
    async singleUpload(parent, { upload }) {
      const { stream, filename, mimetype, encoding } = await upload;

      // 1. Validate file metadata.

      // 2. Stream file contents into cloud storage:
      // https://nodejs.org/api/stream.html

      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )

      return { id, filename, mimetype, encoding };
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```


## Scalar Upload

The `Upload` type automatically added to the schema by Apollo Server resolves an object containing the following:

- `stream`
- `filename`
- `mimetype`
- `encoding`


### File upload options

The `ApolloServer` constructor supports the following configuration properties. They are:

- `maxFieldSize`: represents allowed non-file multipart form field size in bytes.
- `maxFileSize`: represents the allowed file size in bytes.
- `maxFiles`: represents the allowed number of files. It can accept as many files as possible.


## Client setup 

From the client side, you need to install the `apollo-upload-client` package. It enables file uploads via GraphQL mutations.

```sh
npm install apollo-upload-client
```

_File uploads example from the client for a single file:_

```js
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      id
    }
  }
`;

const uploadFile = () => {
  return (   
    <Mutation mutation={UPLOAD_FILE}>
      {uploadFile => (
        <input
        type="file"
        required
        onChange={({ target: { validity, files: [file] } }) =>
          validity.valid && uploadFile({ variables: { file } });
        }
      />
      )}
    </Mutation>
  );
};
```

_File uploads example from the client for multiple files:_

```js
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

export const UPLOAD_MULTIPLE_FILES = gql`
  mutation uploadMultipleFiles($files: [Upload!]!) {
    uploadMultipleFiles(files: $files) {
      id
    }
  }
`;

const uploadMultipleFiles = () => {
  return (   
    <Mutation mutation={UPLOAD_MULTIPLE_FILES}>
      {uploadFile => (
        <input
        type="file"
        multiple
        required
        onChange={({ target: { validity, files } }) =>
          validity.valid && uploadMultipleFiles({ variables: { files } });
        }
       />
      )}
    </Mutation>
  );
};
```

_Blob example from the client:_

```js
import gql from 'graphql-tag'

// Apollo Client instance
import client from './apollo'

const file = new Blob(['Foo.'], { type: 'text/plain' })

// Optional, defaults to `blob`
file.name = 'bar.txt'

client.mutate({
  mutation: gql`
    mutation($file: Upload!) {
      uploadFile(file: $file) {
        id
      }
    }
  `,
  variables: { file }
})
```

Use [FileList](https://developer.mozilla.org/en/docs/Web/API/FileList), [File](https://developer.mozilla.org/en/docs/Web/API/File), [Blob](https://developer.mozilla.org/en/docs/Web/API/Blob) instances anywhere within query or mutation input variables to send a GraphQL multipart request.

**Jayden Seric**, author of [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client) has [an example app on GitHub](https://github.com/jaydenseric/apollo-upload-examples/tree/master/app). It's a web app using [Next.js](https://github.com/zeit/next.js/), [react-apollo](https://github.com/apollographql/react-apollo), and [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client).