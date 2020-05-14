---
title: "4. Write mutation resolvers"
description: Learn how a GraphQL mutation modifies data
---

> Time to accomplish: 10 minutes

We've written all of the resolvers we need for schema fields that apply to query operations. Now, let's write resolvers for our schema's **mutations**. This process is nearly identical.

## `login`

First, let's write a resolver for `Mutation.login`, which enables a user to log in to our application. Add the following to your resolver map below the `Query` field:

```js:title=src/resolvers.js
// Query: {
//   ...
// },
Mutation: {
  login: async (_, { email }, { dataSources }) => {
    const user = await dataSources.userAPI.findOrCreateUser({ email });
    if (user) return Buffer.from(email).toString('base64');
  }
},
```

This resolver takes an `email` address and returns a login token for a corresponding user entity. If a user entity doesn't yet exist for this email address, one is created.

In a later chapter, we'll learn how to save this login token on the client.

### Authenticating logged-in users

> The authentication method used in our example application is not at all secure and should not be used by production applications. However, you can apply the principles demonstrated below to a token-based authentication method that _is_ secure.

Our `Mutation.login` resolver returns a token that clients can use to authenticate themselves to our server. Now, we need to add logic to our server to actually perform the authentication.

In `src/index.js`, pass a `context` function to the constructor of `ApolloServer` that matches the following:

```js:title=src/index.js
const isEmail = require('isemail');

const server = new ApolloServer({
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');

    if (!isEmail.validate(email)) return { user: null };

    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || null;

    return { user: { ...user.dataValues } };
  },
  // Additional constructor options
});
```

The `context` function defined above is called once for _every GraphQL operation_ that clients send to our server. The return value of this function becomes the [`context` argument](./resolvers/#the-resolver-function-signature) that's passed to every resolver that runs as part of that operation.

Here's what our `context` function does:

1. Obtain the value of the `Authorization` header (if any) included in the incoming request.
2. Decode the value of the `Authorization` header.
3. If the decoded value resembles an email address, obtain user details for that email address from the database and return an object that includes those details in the `user` field.

By creating this `context` object at the beginning of each operation's execution, all of our resolvers can access the details for the logged-in user and perform actions specifically _for_ that user.

## `bookTrips` and `cancelTrip`

Now let's add resolvers for `bookTrips` and `cancelTrip` to the `Mutation` object:

```js:title=src/resolvers.js
Mutation: {
  
  // login: ...

  bookTrips: async (_, { launchIds }, { dataSources }) => {
    const results = await dataSources.userAPI.bookTrips({ launchIds });
    const launches = await dataSources.launchAPI.getLaunchesByIds({
      launchIds,
    });

    return {
      success: results && results.length === launchIds.length,
      message:
        results.length === launchIds.length
          ? 'trips booked successfully'
          : `the following launches couldn't be booked: ${launchIds.filter(
              id => !results.includes(id),
            )}`,
      launches,
    };
  },
  cancelTrip: async (_, { launchId }, { dataSources }) => {
    const result = await dataSources.userAPI.cancelTrip({ launchId });

    if (!result)
      return {
        success: false,
        message: 'failed to cancel trip',
      };

    const launch = await dataSources.launchAPI.getLaunchById({ launchId });
    return {
      success: true,
      message: 'trip cancelled',
      launches: [launch],
    };
  },
},
```

To match our schema, these two resolvers both return an object that conforms to the structure of the `TripUpdateResponse` type. This type's fields include a `success` indicator, a status `message`, and an array of `launches` that the mutation either booked or canceled.

> The `bookTrips` resolver needs to account for the possibility of a **partial success**, where some launches are booked successfully and others fail. The code above indicates a partial success in the `message` field.

## Run mutations in GraphQL Playground

We're ready to test out our mutations! Restart your server and return to GraphQL Playground in your browser.

### Obtain a login token

GraphQL mutations are structured exactly like queries, except they use the `mutation` keyword. Paste the mutation below and run it in GraphQL Playground:

```graphql
mutation LoginUser {
  login(email: "daisy@apollographql.com")
}
```

The server should respond with a string that looks like this: 

```
ZGFpc3lAYXBvbGxvZ3JhcGhxbC5jb20=
```

This is your login token (which is just the Base64 encoding of the email address you provided). Copy it to use in the next mutation.

### Book trips

Let's try booking some trips. Only authenticated users are allowed to book trips, so we'll include our login token in our request.

First, paste the mutation below into GraphQL playground:

```graphql
mutation BookTrips {
  bookTrips(launchIds: [67, 68, 69]) {
    success
    message
    launches {
      id
    }
  }
}
```

Next, paste the following into the HTTP Headers box in the bottom left:

```json:title=HTTP_HEADERS
{
  "authorization": "ZGFpc3lAYXBvbGxvZ3JhcGhxbC5jb20="
}
```

Run the mutation. You should see a success message, along with the `id`s of the trips we just booked.

Running mutations manually in GraphQL Playground is a helpful way to test out our API, but a real-world application should run automated tests so we can safely refactor our code. In the next section, you'll learn about running your graph in production instead of testing your graph locally.
