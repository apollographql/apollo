import React from 'react';
import styled from '@emotion/styled';
import {Button} from '@apollo/space-kit/Button';
import {colors} from 'gatsby-theme-apollo-core';

const Wrapper = styled.div({
  border: `1px solid ${colors.divider}`,
  borderRadius: 8,
  padding: 24,
  marginTop: 40,
  fontSize: 15,
  [['h4','p']]: {
    fontSize: '1em',
    marginBottom: '1em'
  }
});

export default function CalloutCard(props) {
  return (
    <Wrapper {...props}>
      <h4>
        <strong>Large team or Enterprise?</strong>
      </h4>
      <p>
        Apollo Studio provides core GraphQL schema management features to all
        users for free, along with advanced security, validation, and
        integration features to organizations with an{' '}
        <a
          href="https://www.apollographql.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apollo Team or Enterprise plan
        </a>
        .
      </p>
      <Button
        color={colors.primary}
        as={
          <a
            href="https://studio.apollographql.com/signup?utm_source=apollo-docs"
            target="_blank"
            rel="noopener noreferrer"
          />
        }
      >
        Start a free trial
      </Button>
    </Wrapper>
  );
}
