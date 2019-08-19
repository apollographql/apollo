module.exports = {
  pathPrefix: '/docs',
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        subtitle: 'Platform',
        description: 'How to use the Apollo GraphQL platform',
        githubRepo: 'apollographql/apollo',
        spectrumPath: 'apollo-platform',
        sidebarCategories: {
          null: ['index', 'intro/platform', 'intro/benefits'],
          Tutorial: [
            'tutorial/introduction',
            'tutorial/schema',
            'tutorial/data-source',
            'tutorial/resolvers',
            'tutorial/production',
            'tutorial/client',
            'tutorial/queries',
            'tutorial/mutations',
            'tutorial/local-state',
          ],
          'Apollo Graph Manager': [
            'platform/graph-manager-overview',
            'platform/schema-registry',
            'platform/schema-validation',
            'platform/client-awareness',
            'platform/operation-registry',
            'platform/editor-plugins',
            'platform/performance',
            'platform/integrations',
            'platform/federation',
          ],
          Resources: [
            '[Principled GraphQL](https://principledgraphql.com)',
            'resources/graphql-glossary',
            'resources/faq',
          ],
          References: [
            'references/apollo-config',
            'references/setup-analytics',
            'references/graph-manager-data-privacy',
            'references/engine-proxy',
            'references/engine-proxy-release-notes',
          ],
        },
      },
    },
  ],
};
