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
            '[Explorer](https://studio.apollographql.com/explorer)',
            '[Managed federation](https://apollographql.com/docs/federation/managed-federation/overview/)',
          ],
          'Registering your Schema': [
            'schema/schema-reporting',
            'schema/cli-registration',
            'schema/registry',
            'schema/schema-reporting-protocol',
          ],
          'Metrics Reporting': [
            'setup-analytics',
            'slack-integration',
            'client-awareness',
            'performance',
            'datadog-integration',
            // field usage
            // operation usage
          ],
          'Continuous Integration': [
            'schema-checks',
            'check-configurations',
            'validating-client-operations',
            'github-integration',
          ],
          'Security': [
            'api-keys',
            'data-privacy',
            'operation-registry',
          ],
          'Managing your Org': [
            'org/account',
            'org/organizations',
            'org/members',
            'org/graphs',
          ]
        },
      },
    },
  ],
};
