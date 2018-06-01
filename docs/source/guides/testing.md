---
title: "Testing"
description: "Testing your apps for peace of mind"
---

Testing a GraphQL Server is something that many people think of as essential for production use. Luckily, the execution model of GraphQL Servers makes testing every aspect of the server possible. The natural separation of concerns that GraphQL encourages makes unit and integration testing a much more enjoyable process.

The following sections intend to walk through everything you need to start testing your Apollo Server.

> (James) Add API for ApolloServer to make it easy to run integration tests against? Dependency injection anyone?

## Unit testing resolvers

The structure of our resolvers help to make them testable. If models, fetchers, and database connections live on the context, resolvers can be tested through mocking those dependencies alone. For example, suppose we have a resolver that we use to look up a user by their id (an argument):

```js
const resolvers = {
 user: (root, args, context) => {
   if (!context.user) throw new Error('You must be logged in to do this');
   return context.models.User.getById(args.id);
 },
};
module.exports = resolvers;
```

But what exactly should be tested in a resolver? A few things that are good to verify in tests are:

The field can’t be accessed with improper user roles or a logged out user (unless the field is public)
The resolver calls any data fetching models/connections with the proper arguments
The resolver returns data from the data fetching models/connections properly

**Getting started with resolver tests**

For these examples, we'll be using the [Jest]() testing framework, but the concepts should be similar with other tools. An initial test for this resolver would look something like this:

```js
const resolvers = require('./user');

it('should return a user object', () => {
 // a fake context that has everything our resolver needs
 const mockContext = {
   user: { token: '12345' },
   models: {
     User: {
       getById: jest.fn(() => ({ name: 'foo', age: 100 })),
     },
   },
 };

 const mockArgs = { id: 123 };

 // run the resolver and expect it to give us a user object back
 expect(resolvers.user(null, mockArgs, mockContext)).toEqual({
   name: 'foo',
   age: 100,
 });
});
```

So what exactly are we doing here? The `it` function is just a wrapper for a test. It tells Jest that this function contains a test and gives it a name. At the bottom, the `expect` function is our actual test. Expect functions can be read aloud to make more sense. Their shape normally reads something like an English sentence, `expect(result).toEqual(ourExpectedResult)`.

At the top of the test, we create a fake context object, `mockContext`, that has everything our resolver needs on the context (the third argument). If we look at the resolver code, we see that it expects someone to be logged in (`context.user`) and a user model (`context.models.User`) so we create those both in our `mockContext`

* dependency injection for context/fetchers
* expect models to be called with correct args
* expect transforms of data from models to be accurate

## Integration testing operations

* https://gist.github.com/JakeDawkins/84d810d96cc1b36ed270bc09ba148816

## Using your schema to mock data for client testing

* gather info on this