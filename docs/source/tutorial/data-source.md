---
title: "2. Hook up your data sources"
description: Start here for the Apollo fullstack tutorial
---

Apollo data sources provide the best experience for fetching and caching data from REST endpoints, web services, and databases. It's a new pattern for loading data from various sources, with built-in support for deduplication, caching, and error handling.

<h2 id="rest-api">Connect a REST API</h2>

To get started connecting to a REST API, install the `apollo-datasource` and `apollo-datasource-rest` packages:

```bash
npm install apollo-datasource-rest
```

The `apollo-datasource-rest` exposes the `RESTDataSource` class that is responsible for fetching data from a given REST API. To define a data source for the REST endpoint, extend the `RESTDataSource` class and implement the data fetching methods that your resolvers require. Let's look at a simple example to understand how data sources work.

```js
import { RESTDataSource } from 'apollo-datasource-rest';

export class MvrpAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://mvrp.herokuapp.com/api/';
  }

  async getAllCars() {
    return this.get('cars');
  }

  async getACar(plateNumber) {
    const result = await this.get('car', {
      plateNumber
    });

    return result[0];
  }
};
```

The `https://mvrp.herokuapp.com/api/` endpoint is a simple REST API that returns data for cars. Furthermore, the `MvrpAPI` class implementation in the code above contains a `getAllCars` and `getACar` functions that wrap convenience methods provided by the `RESTDataSource` class for performing HTTP requests. In this example, the built-in `get` method used is responsible for `GET` requests.

Now that you have an understanding of how data sources work, let's hook it up for our tutorial app.

Create a new `datasources` folder inside the `src` directory. This folder will contain our data source files. Now, create `launch.js` within the `datasources` directory.

The REST API endpoint we'll use for our app is `https://api.spacexdata.com/v2/`. Add the endpoint as a base URL as shown in the code below:

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

The next step is to add methods to the `LaunchAPI` class that corresponds to the type of queries our UI will fetch from the server. According to our app specifications, we'll need to get all launches, and get a specific launch. So, let's take care of getting all launches.

```js
...
async getAllLaunches() {
  const res = await this.get('launches');

  return res.map(launch => {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.flight_number || 0}-${launch.mission_name}`,
      mission: {
        name: launch.mission_name,
        patch: null, // what to do here?
      },
      year: launch.launch_year,
      date: launch.launch_date_unix,
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
      launchSuccess: launch.launch_success,
    };
  });
}
```

In the code above, `this.get('launches')`, makes a `GET` request to `https://api.spacexdata.com/v2/launches` and stores the returned data in the `res` variable. The `getAllLaunches` method then returns an object that corresponds with the schema fields of the `Launch` schema type.

Let's refactor the `getAllLaunches` method to be a lot cleaner and concise.

```js
...
launchReducer(launch) {
  return {
    id: launch.flight_number || 0,
    cursor: `${launch.flight_number || 0}-${launch.mission_name}`,
    mission: {
      name: launch.mission_name,
      patch: null, // what to do here?
    },
    year: launch.launch_year,
    date: launch.launch_date_unix,
    rocket: {
      id: launch.rocket.rocket_id,
      name: launch.rocket.rocket_name,
      type: launch.rocket.rocket_type,
    },
    launchSuccess: launch.launch_success,
  };
}

async getAllLaunches() {
  const res = await this.get('launches');

  return res && res.length ? res.map(l => this.launchReducer(l)) : [];
}
```

With the above changes, we can easily make changes to the `launchReducer` method while the `getAllLaunches` method stays lean and concise.

Now, let's take care of getting a specific launch. Add the following methods, `getLaunchById`, and `getLaunchesByIds` to the `LaunchAPI` class.

```js
...
async getLaunchById({ launchId }) {
  const res = await this.get('launches', { flight_number: launchId });
  return this.launchReducer(res[0]);
}

async getLaunchesByIds({ launchIds }) {
  return Promise.all(
    launchIds.map(launchId => this.getLaunchById({ launchId })),
  );
}
```

The `getLaunchById` method takes in a flight number and returns the data for a particular launch, while `getLaunchesByIds` returns several launches based on their respective `launchIds`. `Promise.all()` takes an array of promises and returns a single promise that resolves when all the promises in the array have been resolved with their fulfilled values.


<h2 id="database">Connect a database</h2>