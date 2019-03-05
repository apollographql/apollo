module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        subtitle: 'Platform',
        description: 'How to use the Apollo GraphQL platform',
        contentDir: 'source',
        basePath: '/docs/platform',
        githubRepo: 'apollographql/apollo',
        sidebarCategories: {
          null: [
            'index',
            'intro/platform',
            'intro/benefits'
          ],
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
            // 'tutorial/whats-next'
          ],
          Platform: [
            'platform/schema-registry',
            'platform/client-awareness',
            'platform/schema-validation',
            'platform/operation-registry',
            'platform/editor-plugins',
            'platform/tracing',
            'platform/setup-analytics',
            'platform/errors',
            'platform/integrations'
          ],
          Resources: [
            {
              title: 'Principled GraphQL',
              href: 'https://www.principledgraphql.com'
            },
            'resources/graphql-glossary',
            'resources/faq'
          ],
          References: [
            'references/apollo-config',
            'references/apollo-engine',
            'references/engine-proxy'
          ]
        }
      }
    }
  ]
};
