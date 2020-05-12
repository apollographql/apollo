---
title: "4. Write mutation resolvers"
description: Learn how a GraphQL mutation modifies data
---

> Time to accomplish: 10 minutes

## Define mutation resolvers

Writing `Mutation` resolvers is similar to the resolvers we've already written. First, let's write the `login` resolver to complete our authentication flow. Add the code below to your resolver map underneath the `Query` resolvers:

```js:title=src/resolvers.js
Mutation: {
  login: async (_, { email }, { dataSources }) => {
    const user = await dataSources.userAPI.findOrCreateUser({ email });
    if (user) return Buffer.from(email).toString('base64');
  }
},
```

The `login` resolver receives an email address and returns a token if a user exists. In a later section, we'll learn how to save that token on the client.

Now, let's add the resolvers for `bookTrips` and `cancelTrip` to `Mutation`:

```js:title=src/resolvers.js
Mutation: {
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

Both `bookTrips` and `cancelTrip` must return the properties specified on our `TripUpdateResponse` type from our schema, which contains a success indicator, a status message, and an array of launches that we've either booked or cancelled. The `bookTrips` mutation can get tricky because we have to account for a partial success where some launches could be booked and some could fail. Right now, we're simply indicating a partial success in the `message` field to keep it simple.

## Authenticate users

Access control is a feature that almost every app will have to handle at some point. In this tutorial, we're going to focus on teaching you the essential concepts of authenticating users instead of focusing on a specific implementation.

Here are the steps you'll want to follow:

1. The context function on your `ApolloServer` instance is called with the request object each time a GraphQL operation hits your API. Use this request object to read the authorization headers.
1. Authenticate the user within the context function.
1. Once the user is authenticated, attach the user to the object returned from the context function. This allows us to read the user's information from within our data sources and resolvers, so we can authorize whether they can access the data.

Let's open up `src/index.js` and update the `context` function on `ApolloServer` to the code shown below:

```js{1,4,8,10}:src/index.js
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
  // .... with the rest of the server object code below, typeDefs, resolvers, etc....
```

Just like in the steps outlined above, we're checking the authorization headers on the request, authenticating the user by looking up their credentials in the database, and attaching the user to the `context`. While we definitely don't advocate using this specific implementation in production since it's not secure, all of the concepts outlined here are transferable to how you'll implement authentication in a real world application.

How do we create the token passed to the `authorization` headers? Let's move on to the next section, so we can write our resolver for the `login` mutation.


### Run mutations in GraphQL Playground

It's time for the fun part - running our mutations in the playground! Go back to the playground in your browser and reload the schema with the little return arrow at the top on the right of the address line.

GraphQL mutations are structured exactly like queries, except they use the `mutation` keyword. Let's copy the mutation below and run in the playground:

```graphql
mutation LoginUser {
  login(email: "daisy@apollographql.com")
}
```

You should receive back a string that looks like this: `ZGFpc3lAYXBvbGxvZ3JhcGhxbC5jb20=`. Copy that string because we will need it for the next mutation.

Now, let's try booking some trips. Only authorized users are permitted to book trips, however. Luckily, the playground has a section where we can paste in our authorization header from the previous mutation to authenticate us as a user. First, paste this mutation into the playground:

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

Next, paste our authorization header into the HTTP Headers box at the bottom:

```json
{
  "authorization": "ZGFpc3lAYXBvbGxvZ3JhcGhxbC5jb20="
}
```

Then, run the mutation. You should see a success message, along with the ids of the mutations we just booked. Testing mutations manually in the playground is a good way to explore our API, but in a real-world application, we should run automated tests so we can safely refactor our code. In the next section, you'll actually learn about running your graph in production instead of testing your graph.
