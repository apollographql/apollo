---
title: State management
description: Managing your local and remote state in a GraphQL world
---

Thousands of developers have told us that Apollo Client excels at managing remote data, which equates to roughly 80% of their data needs. But what about local data (like global flags and device API results) that make up the other 20% of the pie? This is where `apollo-link-state` comes in, our solution for local state management that allows you to use your Apollo cache as the single source of truth for data in your application. Managing all your data with Apollo Client allows you to take advantage of GraphQL as a unified interface to all of your data.

<h2 id="colocate">Colocate queries with components</h2>

<h2 id="transformation">Move data transformation to the backend</h2>

<h2 id="combine">Combine local and remote data</h2>

With `apollo-link-state`, you can add client-side only fields to your remote data seamlessly and query them from your components. In this example, we’re querying the client-only field isLiked alongside our server data. Your components are made up of local and remote data, now your queries can be too!

```graphql
const GET_DOG = gql`
  query getDogByBreed($breed: String!) {
    dog(breed: $breed) {
      images {
        url
        id
        isLiked @client
      }
    }
  }
`;
```