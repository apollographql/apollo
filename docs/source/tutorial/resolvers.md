---
title: "3. Define resolvers"
description: Learn how a GraphQL query fetches data
---

> Time to accomplish: 15 minutes

We've designed our schema and configured our data sources, but our server doesn't yet know how to _use_ its data sources to populate the schema's fields. To achieve this, we'll define a collection of resolvers.

**A resolver is a function that's responsible for populating the data for a single field in your schema.** Whenever a client queries for a particular field, the resolver for that field handles fetching the requested data from the appropriate data source.

A resolver function returns one of the following:

* Data of the type required by the resolver's corresponding schema field (string, integer, object, etc.)
* A promise that fulfills with data of the required type

## The resolver function signature

Before we start writing resolvers, let's cover what the resolver function signature looks like. Resolver functions can optionally accept four positional arguments:

```js
fieldName: (parent, args, context, info) => data;
```

- `parent`: The return value of the resolver for this field's parent (a parent field's resolver always executes _before_ the resolvers for that field's children).
- `args`: An object that contains all [GraphQL arguments](https://graphql.org/graphql-js/passing-arguments/) provided for this field.
- `context`: An object shared across all resolvers that are executing for a particular operation. Use this to share per-request state, such as authentication information and access to data sources.
- `info`: Information about the execution state of the operation (used only in advanced cases).

Of these four arguments, our app will mostly use `context`. It enables our resolvers to share instances of our `LaunchAPI` and `UserAPI` data sources. To see how that works, let's get started creating some resolvers.

## Write query resolvers

As mentioned above, the resolver for a parent field always executes before the resolvers for that field's children. Therefore, let's start by defining resolvers for some of our schema's top-level fields: the fields of the `Query` type.

As `src/schema.js` shows, our schema's `Query` type defines three fields: `launches`, `launch`, and `me`. To define resolvers for these fields, open `src/resolvers.js` and paste the code below:

```js:title=src/resolvers.js
module.exports = {
  Query: {
    launches: (_, __, { dataSources }) =>
      dataSources.launchAPI.getAllLaunches(),
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  }
};
```

As this code shows, resolvers are defined as a **map**, where the map's keys correspond to our schema's types and fields.

* All three resolver functions assign their first positional argument (`parent`) to the variable `_` as a convention to indicate that they don't use it.

* The `launches` and `me` functions assign their _second_ positional argument (`args`) to `__` for the same reason. The `launch` function _does_ use the `args` argument, however, because the `launch` field takes an `id` argument.

* All three resolver functions _do_ use the third positional argument (`context`). Specifically, they destructure it to access our data sources to call methods on them.

* None of the resolver functions even specifies the fourth positional argument (`info`), because they don't use it and there's no other need to include it.

As you can see, these resolver functions are short! That's because most of the logic they rely on is part of the `LaunchAPI` and `UserAPI` data sources. By keeping resolvers thin as a best practice, you can safely refactor your backing logic while reducing the likelihood of breaking your API.

### Run queries in the playground

Apollo Server sets up GraphQL Playground so that you can run queries and explore your schema with ease. Go ahead and start your server by running `npm start` and open up the playground in a browser window at `http://localhost:4000/`.

Start by copying the GraphQL query below and pasting it in the left side of the playground. Then, hit the play button at the center to get a response.

```graphql
query GetLaunches {
  launches {
    id
    mission {
      name
    }
  }
}
```

When you write a GraphQL query, you always want to start with the **operation keyword** (either query or mutation) and its name (like `GetLaunches`). It's important to give your queries descriptive names so they're discoverable in Apollo developer tooling. Next, we use a pair of curly braces after the query name to indicate the body of our query. We specify the `launches` field on the `Query` type and use another pair of curly braces to indicate a **selection set**. The selection set describes which fields we want our query response to contain.

What's awesome about GraphQL is that the shape of your query will match the shape of your response. Try adding and removing fields from your query and notice how the response shape changes.

Now, let's write a launch query that accepts an argument. Copy the query below and paste it in the playground. Then, click the play button to get a response.

```graphql
query GetLaunchById {
  launch(id: 60) {
    id
    rocket {
      id
      type
    }
  }
}
```

Instead of hard coding the argument `60`, you can also set variables in the bottom left corner. Here's how to run that same query with variables:

```graphql
query GetLaunchById($id: ID!) {
  launch(id: $id) {
    id
    rocket {
      id
      type
    }
  }
}
```

You can paste `{ "id": 60 }` into the Query Variables section below before running your query. Feel free to experiment with running more queries before moving on to the next section.

### Paginated queries

Running the `launches` query returned a large data set of launches, which can slow down our app. How can we ensure we're not fetching too much data at once?

**Pagination** is a solution to this problem that ensures that the server only sends data in small chunks. Cursor-based pagination is our recommended approach over numbered pages, because it eliminates the possibility of skipping items and displaying the same item more than once. In cursor-based pagination, a constant pointer (or **cursor**) is used to keep track of where in the data set the next items should be fetched from.

We'll use cursor-based pagination for our graph API. Open up the `src/schema.js` file and update the `Query` type with `launches` and also add a new type called `LaunchConnection` to the schema as shown below:

```graphql:title=src/schema.js
type Query {
  launches( # replace the current launches query with this one.
    """
    The number of results to show. Must be >= 1. Default = 20
    """
    pageSize: Int
    """
    If you add a cursor here, it will only return results _after_ this cursor
    """
    after: String
  ): LaunchConnection!
  launch(id: ID!): Launch
  me: User
}

"""
Simple wrapper around our list of launches that contains a cursor to the
last item in the list. Pass this cursor to the launches query to fetch results
after these.
"""
type LaunchConnection { # add this below the Query type as an additional type.
  cursor: String!
  hasMore: Boolean!
  launches: [Launch]!
}
```

You'll also notice we've added comments (also called docstrings) to our schema, indicated by `"""`. Now, the `launches` query takes in two parameters, `pageSize` and `after`, and returns a `LaunchConnection`. The `LaunchConnection` type returns a result that shows the list of launches, in addition to a `cursor` field that keeps track of where we are in the list and a `hasMore` field to indicate if there's more data to be fetched.

Open up the `src/utils.js` file and check out the `paginateResults` function. The `paginateResults` function in the file is a helper function for paginating data from the server. Now, let's update the necessary resolver functions to accommodate pagination.

Let's import `paginateResults` and replace the `launches` resolver function in the `src/resolvers.js` file with the code below:

```js{1,5-26}:title=src/resolvers.js
const { paginateResults } = require('./utils');

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();

      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor of the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
     me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser(),
  }
};
```

Let's test the cursor-based pagination we just implemented. If you stopped your server, go ahead and restart your graph API again with `npm start`, and run this query in the playground:

```graphql
query GetLaunches {
  launches(pageSize: 3) {
    launches {
      id
      mission {
        name
      }
    }
  }
}
```

Thanks to our pagination implementation, you should only see three launches returned back from our API.

## Connect resolvers to Apollo Server

First, let's connect our resolver map to Apollo Server. Right now, it's just an empty object, but we should add it to our `ApolloServer` instance so we don't have to do it later. Navigate to `src/index.js` and add the following code to the file:

```js:title=src/index.js
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers'); // highlight-line

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers, // highlight-line
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

Apollo Server will automatically add the `launchAPI` and `userAPI` to our resolvers' context so we can easily call them.



## Write resolvers on types

It's important to note that you can write resolvers for any types in your schema, not just queries and mutations. This is what makes GraphQL so flexible.

You may have noticed that we haven't written resolvers for all our types, yet our queries still run successfully. GraphQL has default resolvers; therefore, we don't have to write a resolver for a field if the parent object has a property with the same name.

Let's look at a case where we do want to write a resolver on our `Mission` type. Navigate to `src/resolvers.js` and copy this resolver into our resolver map underneath the `Query` property:

```js:title=src/resolvers.js
Mission: {
  // make sure the default size is 'large' in case user doesn't specify
  missionPatch: (mission, { size } = { size: 'LARGE' }) => {
    return size === 'SMALL'
      ? mission.missionPatchSmall
      : mission.missionPatchLarge;
  },
},
```

```js:title=src/schema.js
  type Mission {
    # ... with rest of schema
    missionPatch(mission: String, size: PatchSize): String
  }
```

The first argument passed into our resolver is the parent, which refers to the mission object. The second argument is the size we pass to our `missionPatch` field, which we use to determine which property on the mission object we want our field to resolve to.

Now that we know how to add resolvers on types other than `Query` and `Mission`, let's add some more resolvers to the `Launch` and `User` types. Copy this code into your resolver map:

```js:title=src/resolvers.js
Launch: {
  isBooked: async (launch, _, { dataSources }) =>
    dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
},
User: {
  trips: async (_, __, { dataSources }) => {
    // get ids of launches by user
    const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

    if (!launchIds.length) return [];

    // look up those launches by their ids
    return (
      dataSources.launchAPI.getLaunchesByIds({
        launchIds,
      }) || []
    );
  },
},
```

You may be wondering where we're getting the user from in order to fetch their booked launches. This is a great observation - we still need to authenticate our user! Let's learn how to authenticate users and attach their user information to the context in the next section before we move onto `Mutation` resolvers.

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

## Write Mutation resolvers

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

### Run mutations in the playground

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
