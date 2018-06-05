---
title: Testing React Apollo
description: Have peace of mind when using React-Apollo in production
---

TODO: Intoduction

Running tests against code meant for production has long been a best practice. It provides additional security for the code that's already written, as well as prevents accidental regressions in the future. Components utilizing React Apollo are no exception.

Although React Apollo has a lot going on under the hood, the library provides multiple tools for testing that simplify those abstractions, and allows complete focus on the component logic. These testing utilities have long been used to test the React Apollo library itself, so developers can trust in their stability and long-term support.

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

If we were to try and write a test for the `<Dog />` component then you will get an error that the `client` is missing in the context.

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

To test the component in true isolation, mock all calls to the GraphQL endpoint. This makes the UI consistent every time tests are run.

React Apollo provides the `MockedProvider` component in the `react-apollo/test-utils` library to do just that! `MockedProvider` allows specifying the exact results that should be returned for a certain query using the `mocks` prop.

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

This file shows how to define the mocked response for a query. The `mocks` array takes objects with specific `request`s and their associated `result`s. In this example, when the provider receives a `GET_DOG_QUERY` it returns the object under the `result` key.

<!-- PICK UP HERE WITH TALKING ABOUT LOADING STATE -->

Despite having mocked the request the above test will still fail. React Apollo will first show a loading state before it successfully retrieves the data and renders the dog name.

In order to overcome this issue you can separate the React Apollo components from presentational components and test these independently.

Let's see how we can refactor the code to improve testability.

```js
export const GET_DOG = gql`
query getDog($name: String) {
  dog(name: $name) {
    id
    name
    breed
  }
}
`;

// The React Apollo component
export const DogQuery = ({ children, name }) => (
  <Query query={GET_DOG} variables={{name}}>
    {({ loading, error, data }) =>
      children({
        loading,
        error,
        dog: data && data.dog
      })
    }
  </Query>
);

// The presentational component
export const DogInterface = props => {
  const { loading, error, dog } = props;
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return <div>{dog.name} has breed {dog.breed}</div>;
};

// Connecting the components together.
export const Dog = props => (
  <DogQuery name={props.name}>{result => <DogInterface {...result} />}</DogInterface>
);
```

Let's go back to our test file and see how we can test the `<DogQuery />` component.

```js
import { GET_DOG, DogQuery } from "./dog";

const expectedRequest = {
  query: GET_DOG,
  name: "Buck"
}

const mocks = [
  {
    request: expectedRequest,
    result: {
      data: {
        dog: {
          id: "1",
          name: "Buck",
          breed: "bulldog"
        }
      }
    }
  }
];

describe("dog with query", () => {
  it("renders a loading and then dog", done => {
    let renderCount = 0;

    render(
      <MockedProvider mocks={mocks}>
        <DogQuery name="Buck">
          {result => {
            if (renderCount === 0) {
              // The first render has the loading state
              expect(result.loading).toBe(true);
              expect(result.dog).toBe(undefined);
            }
            else if (renderCount === 1) {
              // The second render has the data.
              expect(result.loading).toBe(false);
              expect(result.dog).toEqual({
                  id: "1",
                  name: "Buck",
                  breed: "bulldog"
              });
              done()
            }

            renderCount++;

            return null;
          }}
        </DogWithQuery>
      </MockedProvider>
    );
  });

  it("renders an error", done => {
    //<MockedProvider /> can also be used to test error states.
    const mocksWithError = [
      {
        request: expectedRequest,
        error: new Error('Something went wrong'),
      },
    ];

    let renderCount = 0;

    render(
        <MockedProvider mocks={mocksWithError}>
          <DogQuery name="Buck">
            {result => {
              // Second render has the error state
              if (renderCount === 1) {
                expect(result).toEqual({
                  error: new Error('Network error: Something went wrong'),
                  loading: false,
                });
                done();
              }

              renderCount++;
              return null;
            }}
          </HeroQuery>
        </MockedProvider>
    );
  })
});
```

Next, let's test the `<DogInterface />` component:

```js
describe("<DogInterface />", () => {
  it("renders the dog", () => {
    const dog = {
      id: "1"
      name: "Buck",
      breed: "bulldog"
    };

    render(<DogInterface dog={dog} />);
    expect(dogToBeShown);
  });

  it("renders a loading state", () => {
    render(<DogInterface loading={true} />);
    expect(loadingToBeShown);
  });

  it("renders an error state", () => {
    render(<DogInterface error={new Error("Something went wrong")} />);
    expect(errorToBeShown);
  });
});
```

Finally, we need to test that the `<Dog />` component has correctly connected the `<DogQuery />` and `<DogInterface />` together.

```js
it('renders <Dog />', () => {
  render(
    <MockedProvider mocks={mocks}>
      <Dog name="Buck" />
    </MockedProvider>,
  );

  expect(loadingToBeShown);
});
```

We have now successfully tested the code!

In case you want some more information, we have created an [example repo](https://github.com/apollographql/react-apollo/tree/master/examples/components) that illustrates how you can use the techniques outlined in this guide to test your components.

Refer to the [docs](../api/react-apollo.html#MockedProvider) for more information on the API for `<MockedProvider />`.
