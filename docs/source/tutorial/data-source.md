---
title: '2. Hook up your data sources'
description: Connect REST and SQL data to your graph
---

Time to accomplish: _10 Minutes_

Now that we've constructed our schema, we need to hook up our data sources to our GraphQL API. GraphQL APIs are extremely flexible because you can layer them on top of any service, including any business logic, REST APIs, databases, or gRPC services.

Apollo makes connecting these services to your graph simple with our data source API. An **Apollo data source** is a class that encapsulates all of the data fetching logic, as well as caching and deduplication, for a particular service. By using Apollo data sources to hook up your services to your graph API, you're also following best practices for organizing your code.

In the next sections, we'll build data sources for a REST API and a SQL database and connect them to Apollo Server. Don't worry if you're not familiar with either of those technologies, you won't need to understand them deeply in order to follow the examples. 😀

## Connect a REST API

First, let's connect the [Space-X v2 REST API](https://github.com/r-spacex/SpaceX-API) to our graph. To get started, install the `apollo-datasource-rest` package:

```bash
npm install apollo-datasource-rest --save
```

This package exposes the `RESTDataSource` class that is responsible for fetching data from a REST API. To build a data source for a REST API, extend the `RESTDataSource` class and define `this.baseURL`.

In our example, the `baseURL` for our API is `https://api.spacexdata.com/v2/`. Let's create our `LaunchAPI` data source by adding the code below to `src/datasources/launch.js`:

_src/datasources/launch.js_

```js
const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }
}

module.exports = LaunchAPI;
```

The Apollo `RESTDataSource` also sets up an in-memory cache that caches responses from our REST resources with no additional setup. We call this **partial query caching**. What's great about this cache is that you can reuse existing caching logic that your REST API exposes. If you're curious to learn more about partial query caching with Apollo data sources, please check out [our blog post](https://blog.apollographql.com/easy-and-performant-graphql-over-rest-e02796993b2b).

### Write data fetching methods

The next step is to add methods to the `LaunchAPI` data source that correspond to the queries our graph API needs to fetch. According to our schema, we'll need a method to get all of the launches. Let's add a `getAllLaunches` method to our `LaunchAPI` class now:

_src/datasources/launch.js_

```js
async getAllLaunches() {
  const response = await this.get('launches');
  return Array.isArray(response)
    ? response.map(launch => this.launchReducer(launch))
    : [];
}
```

The Apollo REST data sources have helper methods that correspond to HTTP verbs like `GET` and `POST`. In the code above, `this.get('launches')`, makes a `GET` request to `https://api.spacexdata.com/v2/launches` and stores the returned launches in the `response` variable. Then, the `getAllLaunches` method maps over the launches and transforms the response from our REST endpoint with `this.launchReducer`. If there are no launches, an empty array is returned.

Now, we need to write our `launchReducer` method in order to transform our launch data into the shape our schema expects. We recommend this approach in order to decouple your graph API from business logic specific to your REST API. First, let's recall what our `Launch` type looks like in our schema. You don't have to copy this code:

_src/schema.js_

```graphql
type Launch {
  id: ID!
  site: String
  mission: Mission
  rocket: Rocket
  isBooked: Boolean!
}
```

Next, let's write a `launchReducer` function to transform the data into that shape. Copy the following code into your `LaunchAPI` class:

_src/datasources/launch.js_

```js
launchReducer(launch) {
  return {
    id: launch.flight_number || 0,
    cursor: `${launch.launch_date_unix}`,
    site: launch.launch_site && launch.launch_site.site_name,
    mission: {
      name: launch.mission_name,
      missionPatchSmall: launch.links.mission_patch_small,
      missionPatchLarge: launch.links.mission_patch,
    },
    rocket: {
      id: launch.rocket.rocket_id,
      name: launch.rocket.rocket_name,
      type: launch.rocket.rocket_type,
    },
  };
}
```

With the above changes, we can easily make changes to the `launchReducer` method while the `getAllLaunches` method stays lean and concise. The `launchReducer` method also makes testing the `LaunchAPI` data source class easier, which we'll cover later.

Next, let's take care of fetching a specific launch by its ID. Let's add two methods, `getLaunchById`, and `getLaunchesByIds` to the `LaunchAPI` class.

_src/datasources/launch.js_

```js
async getLaunchById({ launchId }) {
  const response = await this.get('launches', { flight_number: launchId });
  return this.launchReducer(response[0]);
}

getLaunchesByIds({ launchIds }) {
  return Promise.all(
    launchIds.map(launchId => this.getLaunchById({ launchId })),
  );
}
```

The `getLaunchById` method takes in a flight number and returns the data for a particular launch, while `getLaunchesByIds` returns several launches based on their respective `launchIds`.

Now that we've connected our REST API successfully, let's connect our database!

## Connect a database

Our REST API is read-only, so we need to connect our graph API to a database for saving and fetching user data. This tutorial uses SQLite for our SQL database, and Sequelize for our ORM. Our `package.json` already included these packages, thus they were installed in the first part of this tutorial with `npm install`. Also, since this section contains some SQL-specific code that isn't necessary to understanding Apollo data sources, we've already built a `UserAPI` data source for you in `src/datasources/user.js`. Please navigate to that file so we can explain the overall concepts.

### Build a custom data source

Apollo doesn't have support for a SQL data source yet (although we'd love to help guide you if you're interested in contributing), so we will need to create a custom data source for our database by extending the generic Apollo data source class. You can create your own with the `apollo-datasource` package.

Here are some of the core concepts for creating your own data source:

- The `initialize` method: You'll need to implement this method if you want to pass in any configuration options to your class. Here, we're using this method to access our graph API's context.
- `this.context`: A graph API's context is an object that's shared among every resolver in a GraphQL request. We're going to explain this in more detail in the next section. Right now, all you need to know is that the context is useful for storing user information.
- Caching: While the REST data source comes with its own built in cache, the generic data source does not. You can use [our cache primitives](https://www.apollographql.com/docs/apollo-server/features/data-sources/#using-memcached-redis-as-a-cache-storage-backend) to build your own, however!

Let's go over some of the methods we created in `src/datasources/user.js` to fetch and update data in our database. You will want to reference these in the next section:

- `findOrCreateUser({ email })`: Finds or creates a user with a given `email` in the database
- `bookTrips({ launchIds })`: Takes an object with an array of `launchIds` and books them for the logged in user
- `cancelTrip({ launchId })`: Takes an object with a `launchId` and cancels that launch for the logged in user
- `getLaunchIdsByUser()`: Returns all booked launches for the logged in user
- `isBookedOnLaunch({ launchId })`: Determines whether the logged in user booked a certain launch

## Add data sources to Apollo Server

Now that we've built our `LaunchAPI` data source to connect our REST API and our `UserAPI` data source to connect our SQL database, we need to add them to our graph API.

Adding our data sources is simple, just create a `dataSources` property on your `ApolloServer` that corresponds to a function that returns an object with your instantiated data sources. Let's see what that looks like by navigating to `src/index.js` and adding the code below:

_src/index.js_

```js{3,5,6,8,12-15}
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

First, we import our `createStore` function to set up our database, as well as our data sources: `LaunchAPI` and `UserAPI`. Then, we create our database by calling `createStore`. Finally, we add the `dataSources` function to our `ApolloServer` to connect `LaunchAPI` and `UserAPI` to our graph. We also pass in our database we created to the `UserAPI` data source.

If you use `this.context` in your datasource, it's critical to create a new instance in the `dataSources` function and to not share a single instance. Otherwise, `initialize` may be called during the execution of asynchronous code for a specific user, and replace the  `this.context` by the context of another user.

Now that we've hooked up our data sources to Apollo Server, it's time to move on to the next section and learn how to call our data sources from within our resolvers.
