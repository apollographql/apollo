---
title: Operation registry
description: How to secure your graph with operation safelisting
---

## Overview

Any API requires security and confidence prior to going to production.  During development, GraphQL offers front-end engineers the ability to explore all the data available to them and fetch exactly what they need for the components they're building.  However, in production, it can be unnecessary and undesirable to provide this flexibility.

The Apollo Operation Registry allows organizations to:

* Provide demand control for their production GraphQL APIs.
* Permit the exact operations necessary for their client applications.
* Eliminate the risk of unexpected, and possibly costly, operations being executed against their graph.

Operations defined within client applications are automatically extracted and uploaded to Apollo Engine using the Apollo CLI.  Apollo Server fetches a manifest of these operations from Apollo Engine and forbids execution of operations which were not registered from the client bundle.

## Getting started

### Prerequisites

* Apollo Server 2.2.x (or newer).
  * To get started with Apollo Server, visit [its documentation](/docs/apollo-server/).
* A client application which utilizes `gql` tagged template literals for its operations or, alternatively, stores operations in `.graphql` files.
* An Apollo Engine API key.
  * To grab a key, visit [Apollo Engine](https://engine.apollographql.com) and create a service.

### Installation steps

> Make sure you've met the requirements for _Prerequisites_ above.

1. Install the `apollo` command line tool as a development dependency of your client applicationt:

        npm install apollo --save-dev

    > Yarn users can run `yarn add apollo --dev`.
