---
title: Testing React Apollo
description: Have peace of mind when using React-Apollo in production
---

Running tests against code meant for production has long been a best practice. It provides additional security for the code that's already written, as well as prevents accidental regressions in the future. Components utilizing React Apollo are no exception.

Although React Apollo has a lot going on under the hood, the library provides multiple tools for testing that simplify those abstractions, and allows complete focus on the component logic. These testing utilities have long been used to test the React Apollo library itself, so you can trust in their stability and long-term support.

## An introduction

React Apollo relies on [context](https://reactjs.org/docs/context.html) in order to pass the Apollo Client instance through the React component tree. In addition, React Apollo makes network requests in order to fetch data. This behavior affects how you write tests for components that use React Apollo.

This guide will explain step-by-step how you can test your React Apollo code. The following examples will be using the [Jest](https://facebook.github.io/jest/docs/en/tutorial-react.html) testing framework, but most concepts should be reusable with other libraries. These examples also show the basic [Test renderer](https://reactjs.org/docs/test-renderer.html) from the React library.

Consider the example below:

```js
import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

// make sure the query is also exported -- not just the component
export const GET_DOG_QUERY = gql`
  query getDog($name: String) {
    dog(name: $name) {
      id
      name
      breed
    }
  }
`;

export const Dog = ({ name }) => (
  <Query query={GET_DOG_QUERY} variables={{ name }}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;

      return (
        <div id="dog-info">
          {data.dog.name} has breed {data.dog.breed}
        </div>
      );
    }}
  </Query>
);
```

If we were to try and write a test for the `<Dog />` component then we would get an error that the `client` is missing in the context.

```js
// Broken because it's missing Apollo Client in the context
it('should render without error', () => {
  renderer.create(<Dog />);
});
```

In order to fix this we could wrap the component in an `ApolloProvider` and pass an instance of Apollo Client to the `client` prop. However, this will cause our tests to run against an actual backend which makes the tests very unpredictable for the following reasons:

- The server could be down
- There may be no network connection
- The results are not guaranteed to be the same for every query

```js
// Not predictable
it('renders without error', () => {
  renderer.create(
    <ApolloProvider client={client}>
      <Dog name="Buck" />
    </ApolloProvider>,
  );
});
```

## MockedProvider

To test the component in true isolation, we can mock all calls to the GraphQL endpoint. This makes the UI consistent every time tests are run, since they don't depend on any remote data.

React Apollo provides the `MockedProvider` component in the `react-apollo/test-utils` library to do just that! `MockedProvider` allows us to specify the exact results that should be returned for a certain query using the `mocks` prop.

Here's an example of a test for the above `Dog` component using `MockedProvider`:

```js
// dog.test.js

import { MockedProvider } from 'react-apollo/test-utils';

// The component AND the query need to be exported
import { GET_DOG_QUERY, Dog } from './dog';

const mocks = [
  {
    request: {
      query: GET_DOG_QUERY,
      variables: {
        name: 'Buck',
      },
    },
    result: {
      data: {
        dog: { id: '1', name: 'Buck', breed: 'bulldog' },
      },
    },
  },
];

it('renders without error', () => {
  renderer.create(
    <MockedProvider mocks={mocks}>
      <Dog name="Buck" />
    </MockedProvider>,
  );
});
```

This example shows how to define the mocked response for a query. The `mocks` array takes objects with specific `request`s and their associated `result`s. In this example, when the provider receives a `GET_DOG_QUERY` witht the specified variables, it returns the object under the `result` key.

In this example, the `Dog` component will render, but it will render in a loading state, not the final response state. This is because `MockedProvider` doesn't just return the data. It returns a promise that will resolve to that data. This allows testing of loading states as well as the final state.

```js
it('should render loading state initially', () => {
  const component = renderer.create(
    <MockedProvider mocks={[]}>
      <Currency />
    </MockedProvider>,
  );

  const tree = component.toJSON();
  expect(tree.children).toContain('Loading...');
});
```

This example shows how to (very basically) test loading state of a component. Here, all we're checking is that the children of the component contain the text `Loading...`. In real apps, this test would probably be more complicated, but the testing logic would be the same.

## Testing final state

Loading state, while important, isn't the only thing to test. To test the final state of the component after receiving data, we can just wait for it to update and test the final state.

```js
it('should render currency conversions', async () => {
  const currencyMock = {
    request: { query: GET_EXCHANGE_RATES_QUERY },
    result: { data: { rates: [{ currency: 'LOL', rate: 999 }] } },
  };

  const component = renderer.create(
    <MockedProvider mocks={[currencyMock]} addTypename={false}>
      <Currency />
    </MockedProvider>,
  );

  await wait(0); // wait for response

  const p = component.root.findByType('p');
  expect(p.children).toContain('LOL: 999');
});
```

Here, you can see the `await wait(0)` line. This artificially adds a delay, and allows time for that promise returned from `MockedProvider` to resolve. After that promise resolves, we can check the component to make sure it displays the correct information (in this case, `LOL: 999`).

<!-- talk about addTypename -->

## Testing error states

Error states are one of the most important states to test, since they can make or break the experience a user has when interacting with the app.

Error states are also tested less in development. Since most developers would follow the "happy path" and not encounter these states as often, it's almost _more_ important to test these states to prevent accidental regressions.

To simulate a GraphQL error, all you have to do is pass an `error` to your mock.

```js
it('should show error UI', async () => {
  const currencyMock = {
    request: { query: GET_EXCHANGE_RATES_QUERY },
    error: new Error('aw shucks'),
  };

  const component = renderer.create(
    <MockedProvider mocks={[currencyMock]} addTypename={false}>
      <Currency />
    </MockedProvider>,
  );

  await wait(0); // wait for response

  const tree = component.toJSON();
  expect(tree.children).toContain('Error :(');
});
```

Here, whenever your `MockProvider` receives a `GET_EXCHANGE_RATES_QUERY`, it will return a GraphQL error. This forces the component into the error state, and we can verify that it's handling the error gracefully.

## Testing mutation components

`Mutation` components are tested very similarly to `Query` components. The only key difference is how the mutation is fired. With `Query` components, the query is fired when the component mounts. With `Mutation` components, the mutation is fired manually, usually after some user interaction like pressing a button.

Consider this component that calls a mutation:

```js
export const DELETE_CURRENCY_MUTATION = gql`
  mutation deleteCurrency($name: String!) {
    deleteCurrency(name: $name) {
      currency
      rate
    }
  }
`;

export default () => (
  <Mutation mutation={DELETE_CURRENCY_MUTATION}>
    {(mutate, { loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;
      if (data) return <p>Deleted!</p>;

      return (
        <button onClick={() => mutate({ variables: { name: 'USD' } })}>
          Click me to Delete the USD!
        </button>
      );
    }}
  </Mutation>
);
```

Testing an initial render for this component looks identical to testing our query component.

```js
import DeleteButton, { DELETE_CURRENCY_MUTATION } from './delete-currency';

it('should render without error', () => {
  renderer.create(
    <MockedProvider mocks={[]}>
      <DeleteButton />
    </MockedProvider>,
  );
});
```

Calling the mutation is where things get interesting:

```js
it('should render loading state initially', () => {
  const deleteCurrency = { currency: 'USD', rate: 1.0 };
  const mocks = [
    {
      request: {
        query: DELETE_CURRENCY_MUTATION,
        variables: { name: 'USD' },
      },
      result: { data: { deleteCurrency } },
    },
  ];

  const component = renderer.create(
    <MockedProvider mocks={mocks} addTypename={false}>
      <DeleteButton />
    </MockedProvider>,
  );

  // find the button and simulate a click
  const button = component.root.findByType('button');
  button.props.onClick(); // fires the mutation

  const tree = component.toJSON();
  expect(tree.children).toContain('Loading...');
});
```

This example looks very similar to the `Query` component. The difference comes after the render. Since this component relies on a button to be clicked to fire a mutation, we first use the renderer's API to find that button.

After we find the button, we can manually call the `onClick` prop to that button, simulating a user clicking the button. This click fires off the mutation, and then the rest is tested identically to the `Query` component.

For example, to test for a successful mutation, you'd just wait for the promise to resolve from `MockedProvider` and check for any confirmation message in your UI, just like the `Query` component:

```js
it('should delete and give visual feedback', async () => {
  const deleteCurrency = { currency: 'USD', rate: 1.0 };
  const mocks = [
    {
      request: {
        query: DELETE_CURRENCY_MUTATION,
        variables: { name: 'USD' },
      },
      result: { data: { deleteCurrency } },
    },
  ];

  const component = renderer.create(
    <MockedProvider mocks={mocks} addTypename={false}>
      <DeleteButton />
    </MockedProvider>,
  );

  // find the button and simulate a click
  const button = component.root.findByType('button');
  button.props.onClick(); // fires the mutation

  await wait(0);

  const tree = component.toJSON();
  expect(tree.children).toContain('Deleted!');
});
```

---

## Conclusion

Refer to the [docs](../api/react-apollo.html#MockedProvider) for more information on the API for `<MockedProvider />`.
