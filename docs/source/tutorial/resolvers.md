---
title: "3. Write your graph's resolvers"
description: Start here for the Apollo fullstack tutorial
---

It's time to finally leverage all the data sources logic in our graph's resolvers. Resolvers provide the instructions for turning a GraphQL operation into data. They are functions that fetch or modify data from underlying data sources for fields in a schema type.

<h2 id="data-sources">Call your data sources in resolvers</h2>

In the previous section of this tutorial, two data source classes were created and passed as options to the `ApolloServer` constructor. We'll access those data sources in our resolvers soon!

Resolver functions accepts four arguments:

```js
fieldName(parent, args, context, info) {
 // implementation
}
```

* **parent**: This is an object that contains the result returned from the resolver on the parent field.
* **args**: This is an object that contains the field arguments specified in a query.
* **context**: This is an object shared by all resolvers in a particular query, and is used to contain per-request state, including authentication information, dataloader instances, and anything else that should be taken into account when resolving the query.
* **info**: This argument has information about the execution state of the query. Mostly used in advanced cases.

Create a `resolvers.js` file in the `src` directory. Copy the code below and paste it in the file.

```js
module.exports = {
  Query: {
    launches: async (root, { pageSize = 20, after }, { dataSources }) => {
      return dataSources.launchAPI.getAllLaunches();
    },
    launch: (root, { id }, { dataSources }) => {
      return dataSources.launchAPI.getLaunchById({ launchId: id });
    },
    me: async (_, __, { dataSources, user: { email } }) => {
      if (!email) return null;
      return dataSources.userAPI.findOrCreateUser({ email });
    },
  },
};
```

The code above shows the resolver functions for the `Query` type. Let's analyze it.

The `launches` field in the schema's Query type has two arguments, `pageSize`, and `after` which are necessary for pagination. This is why they appear as the second argument in the `launches` resolver function as shown in the code above. `{ dataSources }` appear as the third argument because Apollo Server puts them on the context for every request.

In the body of the `launches` async resolver function, a request is made to fetch all launches via the `getAllLaunches` method on the `LaunchAPI` data source.

The `launch` async function takes in an `id` as the second argument which represents a `launchId`. A request is made to fetch a launch by calling the `getLaunchById` method of the `launchAPI` data source class.

The `me` async function // Wait for the code to be stable.

Copy the code below for the `Mutation` type and paste it just after the `Query` resolver functions in the file.

```js
module.exports = {
  Query: {
    ...
  },
  Mutation: {
    bookTrip: async (root, { launchId }, { dataSources, user }) => {
      return dataSources.userAPI.bookTrip({
        userId: user.id,
        launchId: launchId,
      });
    },
    cancelTrip: async (root, { launchId }, { dataSources, user }) => {
      return dataSources.userAPI.cancelTrip({
        launchId: launchId,
        userId: user.id,
      });
    },
    login: async (root, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) return new Buffer(email).toString('base64');
      return false;
    },
  }
}
```

// Explanation for Mutation resolver function here. Wait till we are sure of what we are doing in the context logic

Copy the code below for the `Launch` type and paste it just after the `Mutation` resolver functions.

```js
module.exports = {
  ...
  ...
  Launch: {
    passengers: async (launch, _, { dataSources }) => {
      const res = await dataSources.userAPI.getUsersByLaunch({
        launchId: launch.id,
      });
      return res && res.length ? res : [];
    },
  },
}
```

// Explanation for Launch resolver function here. Wait till we are sure of what we are doing in the context logic

Copy the code below for the `User` type and paste it just after the `Launch` resolver function.

```js
module.exports = {
  ...
  ...
  User: {
    trips: async (_, __, { dataSources, user: { id } }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser({
        userId: id,
      });

      if (!launchIds.length) return [];

      // look up those launches by their ids
      return (dataSources.launchAPI.getLaunchesByIds({ launchIds }) || []);
    },
  },
}
```

<h2 id="write-query">Write a query in the playground</h2>

<h2 id="authentication">Authenticate users</h2>

<h2 id="testing">Test your graph</h2>