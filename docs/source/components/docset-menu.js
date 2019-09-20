import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { IconClients } from '@apollo/space-kit/icons/IconClients';
import { colors, breakpoints } from 'gatsby-theme-apollo-core';
import { colors as spaceKitColors } from '@apollo/space-kit/colors';
import { size } from 'polished';
import { NavItemsContext } from 'gatsby-theme-apollo-docs/src/components/page-layout';

const spacing = 8;
const Wrapper = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  margin: -spacing
});

const MenuItem = styled.div({
  display: 'flex',
  width: '50%',
  padding: spacing,
  [breakpoints.md]: {
    width: '100%'
  }
});

function getBoxShadow(opacity, y, blur) {
  return `rgba(18, 21, 26, ${opacity}) 0 ${y}px ${blur}px`
}

const {indigo} = spaceKitColors;
const IconWrapper = styled.div({
  ...size(28),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
  boxShadow: [
    getBoxShadow(0.12, 1, 2),
    getBoxShadow(0.1, 2, 4),
    getBoxShadow(0.08, 5, 10),
    `inset rgba(45, 31, 102, 0.4) 0 -1px 2px`
  ].toString(),
  borderRadius: 8,
  color: indigo.lighter,
  backgroundImage: `linear-gradient(${[indigo.base, indigo.dark]})`,
  svg: {
    ...size(16),
    fill: 'currentColor'
  }
});

const Title = styled.h4({
  fontWeight: 600,
  lineHeight: 1.3,
  marginBottom: 8
});

const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

const Description = styled.h6({
  color: colors.text3
});

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <Wrapper>
      {navItems.map(navItem => (
        <MenuItem key={navItem.url}>
          <IconWrapper>
            <IconClients />
          </IconWrapper>
          <div>
            <Title>
              <StyledLink href={navItem.url}>
                {navItem.title}
              </StyledLink>
            </Title>
            <Description>{navItem.description}</Description>
          </div>
        </MenuItem>
      ))}
    </Wrapper>
  );
}
