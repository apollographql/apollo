---
title: GraphQL benefits
description: Why adopting GraphQL and Apollo will help you ship features faster
---

// insert intro here

<h2 id="declarative">Declarative data fetching</h2>

One of the main advantages of adopting GraphQL is its declarative approach to data fetching. With GraphQL, there's no need to call multiple endpoints from the client or aggregate the data manually like you have to with traditional REST data fetching. Instead, you specify exactly the data you need and GraphQL gives you exactly what you asked for.

With REST, you would have to call all of these endpoints for each item in the list, filter down the data you need, and aggregate all of the remaining data into the shape your components consume.

```bash
GET /api/dogs/breeds
GET /api/dogs/images
GET /api/dogs/activities
```

Not only is this approach time-consuming, it's also prone to error and difficult to reuse logic across platforms. Compare this with GraphQL's declarative way to query data:

```graphql
const GET_DOGS = gql`
  query {
    dogs {
      id
      breed
      image {
        url
      }
      activities {
        name
      }
    }
  }
`;
```

Here, we're describing the shape of the object we want to receive from the server. GraphQL takes care of combining and filtering the data while returning exactly what we ask for.

How do we use this query in our app? Apollo Client builds off of GraphQL's declarative approach to data fetching. In a React app, all of the logic for retrieving your data, tracking loading and error states, and updating your UI is encapsulated in a single Query component. This encapsulation makes composing your data fetching components with your presentational components a breeze! Let’s see how to fetch GraphQL data with Apollo Client in a React app:

```jsx
const Feed = () => (
  <Query query={GET_DOGS}>
    {({ loading, error, data }) => {
      if (error) return <Error />
      if (loading || !data) return <Fetching />;

      return <DogList dogs={data.dogs} />
    }}
  </Query>
);
```

Apollo Client takes care of the request cycle from start to finish, including tracking loading and error states for you. There’s no middleware to set up or boilerplate to write before making your first request, nor do you need to worry about transforming and caching the response. All you have to do is describe the data your component needs and let Apollo Client do the heavy lifting. 💪

You’ll find that when you switch to Apollo Client, you’ll be able to delete a lot of unnecessary code related to data management. The exact amount will vary depending on your application, but some teams have reported up to thousands of lines. To learn more about how Apollo Client enables advanced features like optimistic UI, refetching, and pagination with less code, check out our guide on [state management](../guides/state-mgmt.html).

<h2 id="performance">Improved performance</h2>

In many cases, layering a GraphQL API over your existing REST endpoints can improve your app's performance, especially on devices with slow network connections. While you should always measure to determine how integrating GraphQL will affect your application, it's generally accepted that GraphQL improves performance by helping avoid round trips to the server and reducing payload size.

<h3 id="payload">Smaller payloads</h3>

Since the response back from the server contains only the properties you specify in your query, GraphQL can significantly reduce payload size compared to a REST endpoint. Let's take a look at our dogs query from earlier in the article:

```graphql
const GET_DOGS = gql`
  query {
    dogs {
      id
      breed
      image {
        url
      }
      activities {
        name
      }
    }
  }
`;
```

The response back from the server will be a list of dog objects with `id`, `breed`, `image`, and `activities` properties. It doesn't matter if the underlying REST endpoints we call in our resolvers return back objects with 100 properties! All of those extraneous properties will be filtered out before the response is sent back to the client.

<h3 id="round-trip">Avoid round trips</h3>

Since each GraphQL request returns only one response, switching to GraphQL can help you avoid costly round trips from the client to your server. With REST, each resource represents a round trip, which can quickly add up. If you're fetching items in a list, you'll have to complete a round trip for every resource multiplied by the number of items, causing slow load times especially on mobile devices.

```bash
GET /api/dogs/breeds
GET /api/dogs/images
GET /api/dogs/activities
```

With GraphQL, each query represents a single round trip from the client to server. If you'd like to reduce round trips even further, you can implement [query batching](https://www.apollographql.com/docs/engine/query-batching.html) to batch multiple queries into a single request. 

<h2 id="dev-experience">Developer experience</h2>

Implementing GraphQL in your organization via the Apollo platform can help you ship features faster due to its excellent developer experience. Features that are normally difficult to execute, such as fullstack caching, data normalization, and optimistic UI suddenly become trivial thanks to Apollo Client, Apollo Server, and Apollo Engine. Our #1 goal is to simplify data management across the stack.

<h3 id="data">Explore your API</h3>

<h3 id="frontend">Simplify front-end code</h3>

<h3 id="tooling">Advanced, modern tooling</h3>