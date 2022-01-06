const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        pathPrefix: '/docs/studio',
        algoliaIndexName: 'studio',
        algoliaFilters: ['docset:studio', ['docset:rover', 'docset:federation']],
        baseDir: 'studio-docs',
        subtitle: 'Studio',
        description: 'How to use Apollo Studio',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/apollo-platform',
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            '[Managed federation](https://apollographql.com/docs/federation/managed-federation/overview/)'
          ],
          'Registering Schemas': [
            'schema/schema-reporting',
            'schema/cli-registration',
            '[Using Sandbox](https://apollographql.com/docs/studio/explorer/sandbox/#publishing-schemas-from-sandbox)',
            'schema/schema-reporting-protocol'
          ],
          'Working with Graphs': [
            'org/graphs',
            'dev-graphs',
            'federated-graphs',
          ],
          'The Explorer': [
            'explorer/explorer',
            'explorer/sandbox',
            'explorer/connecting-authenticating',
            'explorer/embed-explorer',
            'explorer/additional-features',
          ],
          'Metrics Reporting': [
            'metrics/usage-reporting',
            'metrics/field-usage',
            'metrics/client-awareness',
            'metrics/datadog-integration',
            'metrics/operation-signatures',
          ],
          'Schema Delivery': [
            'schema-checks',
            'check-configurations',
            'launches',
            'contracts',
            'validating-client-operations',
            'github-integration'
          ],
          Notifications: [
            'notification-setup',
            'daily-reports',
            'schema-change-integration',
            'performance-alerts',
            'build-status-notification'
          ],
          Security: [
            'api-keys',
            'operation-registry',
            'audit-log',
            'data-privacy',
            'sub-processors'
          ],
          'Managing Accounts': [
            'org/account',
            'org/organizations',
            'org/members'
          ]
        }
      }
    }
  ]
};
