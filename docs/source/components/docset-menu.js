import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { ReactComponent as AppleLogo } from '../assets/apple-logo.svg';
import { IconLink } from '@apollo/space-kit/icons/IconLink';
import { IconSatellite3 } from '@apollo/space-kit/icons/IconSatellite3';
import { IconSchema } from '@apollo/space-kit/icons/IconSchema';
import { IconTelescope1 } from '@apollo/space-kit/icons/IconTelescope1';
import { ReactComponent as ReactLogo } from '../assets/react-logo.svg';
import {
  NavItemsContext,
  NavItemTitle,
  NavItemDescription
} from 'gatsby-theme-apollo-docs';
import { breakpoints, colors } from 'gatsby-theme-apollo-core';
import { colors as spaceKitColors } from '@apollo/space-kit/colors';
import { size } from 'polished';

const spacing = 12;
const Wrapper = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  margin: -spacing,
  paddingTop: 8
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

const TextWrapper = styled.div({
  color: colors.text1
});

const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

const icons = [
  <IconTelescope1 weight="thin" />,
  <IconSatellite3 weight="thin" />,
  <ReactLogo />,
  <IconSchema weight="thin" />,
  <AppleLogo style={{
    padding: 1,
    paddingTop: 0,
    paddingBottom: 2
  }} />,
  <IconLink weight="thin" />
];

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <Wrapper>
      {navItems.map((navItem, index) => (
        <MenuItem key={navItem.url}>
          <IconWrapper>
            {icons[index]}
          </IconWrapper>
          <TextWrapper>
            <NavItemTitle>
              <StyledLink href={navItem.url}>
                {navItem.title}
              </StyledLink>
            </NavItemTitle>
            <NavItemDescription>{navItem.description}</NavItemDescription>
          </TextWrapper>
        </MenuItem>
      ))}
    </Wrapper>
  );
}
