const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs/studio',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        baseDir: 'studio-docs',
        subtitle: 'Studio',
        description: 'How to use Apollo Studio',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/apollo-platform',
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            '[Managed federation](https://apollographql.com/docs/federation/managed-federation/overview/)',
          ],
          'Working with Graphs': [
            'org/graphs',
            'explorer',
            'dev-graphs',
            'federated-graphs',
          ],
          'Registering Schemas': [
            'schema/schema-reporting',
            'schema/cli-registration',
            'schema/schema-reporting-protocol',
          ],
          'Metrics Reporting': [
            'setup-analytics',
            'client-awareness',
            'datadog-integration',
            // field usage
            // operation usage
          ],
          'CI/CD': [
            'schema-checks',
            'check-configurations',
            'validating-client-operations',
            'github-integration',
          ],
          'Notifications': [
            'notification-setup',
            'daily-reports',
            'schema-change-integration',
            'performance-alerts',
            'build-status-notification',
          ],
          'Security': [
            'api-keys',
            'operation-registry',
            'data-privacy',
            'sub-processors'
          ],
          'Managing Accounts': [
            'org/account',
            'org/organizations',
            'org/members',
          ]
        },
      },
    },
  ],
};
