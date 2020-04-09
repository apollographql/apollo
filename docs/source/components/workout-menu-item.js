import { MenuItem } from './menu';
import React from 'react';
import styled from '@emotion/styled';
import { colors } from 'gatsby-theme-apollo-core';
import { MDXProvider } from '@mdx-js/react';

const InnerWrapper = styled.div({
  marginTop: '1rem',
  ul: {
    marginLeft: 0,
    color: colors.text2
  },
  li: {
    fontSize: '1rem',
    lineHeight: 1.5,
    listStyle: 'none',
    ':not(:last-child)': {
      marginBottom: '1rem'
    }
  }
});

const TextWrapper = styled.span({
  fontWeight: 'normal'
});

const components = {
  a(props) {
    function handleClick(event) {
      // track workout click event in GA
      if (typeof window.analytics !== 'undefined') {
        window.analytics.track('Click workout', {
          category: 'Recommended workouts',
          label: event.target.innerText,
          value: event.target.href
        });
      }
    }
    return <a {...props} onClick={handleClick} />;
  }
}

export default function WorkoutMenuItem(props) {
  return (
    <MenuItem
      style={{color: colors.text1}}
      icon={(
        React.createElement(props.icon, {
          style: {
            width: '100%',
            height: '100%',
            fill: 'currentColor'
          }
        })
      )}
      title={(
        <TextWrapper>
          <strong>{props.keyWord}</strong> {props.otherWords}
        </TextWrapper>
      )}
    >
      <InnerWrapper>
        <MDXProvider components={components}>
          {props.children}
        </MDXProvider>
      </InnerWrapper>
    </MenuItem>
  )
}
