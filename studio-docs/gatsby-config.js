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
        algoliaFilters: ['docset:studio', 'docset:rover', 'docset:federation'],
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
          'Working with Graphs': [
            'org/graphs',
            'explorer',
            'embed-explorer',
            'dev-graphs',
            'federated-graphs'
          ],
          'Registering Schemas': [
            'schema/schema-reporting',
            'schema/cli-registration',
            'schema/schema-reporting-protocol'
          ],
          'Metrics Reporting': [
            'setup-analytics',
            'client-awareness',
            'datadog-integration'
            // field usage
            // operation usage
          ],
          'Schema Delivery': [
            'schema-checks',
            'check-configurations',
            'launches',
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
