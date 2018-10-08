---
title: "3. Write your graph's resolvers"
description: Start here for the Apollo fullstack tutorial
---

It's time to finally leverage all the data sources logic in our graph's resolvers. Resolvers provide the instructions for turning a GraphQL operation into data. They are functions that fetch or modify data from underlying data sources for fields in a schema type. There are a few things to note about resolver functions.

1. A resolver function must bear the same name as the field it operates on.
2. A resolver function must return the type of data that was specified in the schema field.

<h2 id="data-sources">Call your data sources in resolvers</h2>

In the previous section of this tutorial, two data source classes were created and passed as options to the `ApolloServer` constructor. We'll access those data sources in our resolvers soon! First, let's know more about a resolver function signature.

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

Go ahead and create a `resolvers.js` file in the `src` directory. Let's start with the `Query` resolver functions.

Copy the code below and paste it in the file.

_src/resolvers.js_

```js
module.exports = {
  Query: {
    launches: async (root, __, { dataSources }) =>
      dataSources.launchAPI.getAllLaunches(),
    launch: (root, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser(),
  },
};
```

The code above shows the resolver functions for the `Query` type fields: `launches`, `launch`, and `me`.

Note that the `{ dataSources }` appear as the third argument in any resolver function because Apollo Server puts the `dataSources` object on the context for every request.

The `launches` resolver invokes the `getAllLaunches` function from the launch data source class and returns its data.

The `launch` resolver takes in an `id` as the second argument which represents a `launchId`. Then, a request is made to fetch a launch by calling the `getLaunchById` method of the launch data source class.

The `me` resolver simply checks if a user exists or not via the `findOrCreateUser()` from the user data source class. If the user doesn't exist, then a new user is created, stored and returned.

The resolver functions look simple and concise because the logic is embedded in the launch and user data sources. Both classes abstracted the code away.

Now, let's move on to the `Mutation` resolver functions.

Copy the code below and paste it just after the `Query` resolver functions in the file.

_src/resolvers.js_

```js
...
Mutation: {
  bookTrip: async (root, { launchId }, { dataSources }) =>
    dataSources.userAPI.bookTrip({ launchId }),
  cancelTrip: async (root, { launchId }, { dataSources }) =>
    dataSources.userAPI.cancelTrip({ launchId }),
  login: async (root, { email }, { dataSources }) => {
    const user = await dataSources.userAPI.findOrCreateUser({ email });
    if (user) return new Buffer(email).toString('base64');
    return false;
  },
}
```

As shown in the code above, there are three resolver functions, `bookTrip`, `cancelTrip`, and `login`.

The `bookTrip` function takes in a `launchId`,and makes a request to book a trip for that particular launch.

The `cancelTrip` function takes in a `launchId`, and makes a request via the `cancelTrip` method of the user data source to cancel a trip.

The `login` function takes in an email, checks the user table in the database via the `findOrCreateUser` method to verify if the user exists or not. If the user exists or a new user is created, return a `base64` encoding of the user's email.

The `base64` encoding of the user's detail is for obscuring the data. The result is a form of unique string token which we use for authentication.

Now, let's get to the `User` resolver functions.

Copy the code below and paste it just after the `Mutation` resolver functions.

_src/resolvers.js_

```js
...
...
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

When trips for a particular user are requested for, what data is returned?

The `trips` resolver function works like the steps outlined below:

1. It fetches the ids of all the launches a user has ever booked a trip for via the user data source's `getLaunchIdsByUser()` method. Check the code for the `getLaunchIdsByUser` method in the `UserAPI` class to refresh your memory on how the fetch happens.
2. If there are no launch ids, an empty array is returned. This means the user has not embarked on any trip.
3. If there's an array of launch ids, fetch all the launches via their ids.

<h2 id="write-query">Write a query in the playground</h2>

<h2 id="authentication">Authenticate users</h2>

<h2 id="testing">Test your graph</h2>