---
title: Overview
description: Learn about Graph Manager features and create your account
---

Apollo Graph Manager (formerly Apollo Engine) is a cloud service that helps you manage,
validate, and secure your organization's data graph.

In addition to serving as a GraphQL schema registry, Graph Manager ingests operation metadata and execution trace data from your GraphQL server to help you understand
your schema and query usage.

## Feature summary

**Graph Manager provides the following features to all Apollo users for free:**

* A [GraphQL schema registry](/schema-registry/) that tracks changes
and enables you to [create variants of your schema](/schema-registry/#managing-environments) for different environments
(such as staging and production)

* A schema explorer that makes it easy to inspect your schema's queries,
mutations, and other object definitions

* Team collaboration via [organizations](#managing-organizations)

**Advanced features are available with a subscription to an Apollo Team or Enterprise plan:**

* [Operation safelisting](/operation-registry/)
* [Schema change validation](/schema-validation/)
* [Resolver-level query tracing](/performance/)
* [Third-party integrations](/integrations/)
* [Management of a federated data graph](/federation/)
* Longer data retention

[Learn more about pricing and billing](https://www.apollographql.com/plans/)

![The Apollo Graph Manager Architecture](./img/graph-manager-architecture.png)

## Creating an account

You create your Graph Manager account by authenticating with your GitHub account at [engine.apollographql.com](https://engine.apollographql.com). Your Graph Manager username is the same as your GitHub username.

>Single sign-on (SSO) account management via SAML or OIDC is available for [Enterprise customers](https://www.apollographql.com/plans/).

## Managing organizations

All data in Graph Manager belongs to a particular **organization**. Currently,
every Graph Manager organization corresponds to either an individual GitHub user or a GitHub organization.

### Single-member organizations

When you create your Graph Manager account via GitHub, an organization is created for you 
with the same name as your GitHub username. Other users cannot join this organization.
Feel free to use this organization to try out the features of Graph Manager.

### Collaborating in an organization

Graph Manager automatically creates an organization for every _GitHub_ organization
 it's granted access to. When you first log in to Graph Manager, it requests permission to view your GitHub organizations, along with the members and teams in those organizations (but **not** the code).

Every member of a GitHub organization is automatically also a member of the corresponding Graph Manager organization (assuming they create a Graph Manager account).

> **WARNING: Currently, all members of a Graph Manager organization have full permissions
> for the organization, including the ability to delete graphs or transfer them
> out of the organization.**

#### Adding and removing organization members

To add or remove members from a Graph Manager organization, add or remove those
same members from the corresponding GitHub organization. Note that only the owner
of a GitHub organization can remove members.

### Viewing your organizations

The [Graph Manager homepage](https://engine.apollographql.com) lists the organizations you belong to in the left-hand column.
Click on an organization to view its associated data.

If you’re a member of a GitHub organization and you don't see a corresponding organization in Graph Manager, it's probably because Graph Manager hasn't been granted access
to that organization.

### Creating and removing organizations

You can view and modify Graph Manager's current access to your GitHub
organizations on [this GitHub page](https://github.com/settings/connections/applications/4c69c4c9eafb16eab1b5). Note that only owners of a GitHub organization can modify access.

* To create a Graph Manager organization for a particular GitHub organization, simply
grant Graph Manager access to the GitHub organization.

* To remove a Graph Manager organization, simply revoke Graph Manager's access to
the corresponding GitHub organization.

>Removing a Graph Manager organization does _not_ delete its associated data. It
>_does_, however, remove all users from the organization. This prevents anyone from accessing
>the organization's data and settings until the organization is recreated.

### GitHub permissions and privacy

Graph Manager uses GitHub’s OAuth service to obtain read-only information about organizations and users. Graph Manager does not request access rights to your source code or to any other sensitive data.

## Managing graphs

A **graph** in Graph Manager represents the data graph for a single project or application. Every graph has its own associated GraphQL schema. 

### Creating a graph

To create a graph in the Graph Manager interface, first select the Graph Manager organization
that the graph will belong to. Then click **New Graph** in the upper right and
proceed through the creation flow.

Note that every graph in Graph Manager has a globally unique **graph ID**. We recommend that you prefix your graph IDs with the name of your company or organization to avoid naming collisions.

### Viewing graph information

After selecting an organization in Graph Manager, click on a particular graph
to view its data and settings. All of a Graph Manager organization's members have
access to the data and settings for every graph that belongs to that organization. 

### Transferring graph ownership

You can transfer a graph to a different Graph Manager organization you belong to
by visiting the graph's Settings page and changing the **graph owner**.

### Deleting a graph

>**Deleting a graph cannot be undone!**

You can delete a graph from Graph Manager by visiting its Settings page and clicking
**Delete**.

### Distinguishing between application environments

Every graph in Graph Manager should correspond to a single application. However, a single
application might run in multiple _environments_ (such as test, staging, and production).

To distinguish between graph activity for different application environments, you can define [**variants**](/schema-registry/#managing-environments) for a graph. Each variant has its own schema
that can (but doesn't have to) differ from the default variant.

When your server sends metrics to Graph Manager, it can associate an operation with
a particular variant. Variants appear as separate items in your organization's graph list, allowing you to view analytics for 
each application environment in isolation.

## Ingesting and fetching data

Graph Manager ingests and stores performance metrics data sent from your GraphQL server.
Use one of the following methods to send data to Graph Manager:

* Use [Apollo Server](https://www.apollographql.com/docs/apollo-server/) as your application's GraphQL server and [include a Graph Manager API key](https://www.apollographql.com/docs/tutorial/production/#get-a-graph-manager-api-key) in your server configuration.

* If you aren't using Apollo Server, you can send trace metrics to the [Graph Manager reporting endpoint](https://www.apollographql.com/docs/references/setup-analytics/#graph-manager-reporting-endpoint) (again,
providing an API key with every request).

### API keys

Any system that communicates with Graph Manager (whether to send metrics or fetch them)
must use an **API key** to do so. You can add and remove API keys from your graph
from its Settings page in the Graph Manager UI.

You should use a different API key for each system that communicates
with Graph Manager. This provides you with more granular control over how Graph
Manager data is sent and accessed.
