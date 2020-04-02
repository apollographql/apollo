import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { ReactComponent as AppleLogo } from '../assets/apple-logo.svg';
import { IconSatellite3 } from '@apollo/space-kit/icons/IconSatellite3';
import { IconSchema } from '@apollo/space-kit/icons/IconSchema';
import { ReactComponent as ReactLogo } from '../assets/react-logo.svg';
import {
  NavItemsContext,
  NavItemDescription
} from 'gatsby-theme-apollo-docs';
import { colors } from '@apollo/space-kit/colors';
import { size } from 'polished';
import { MenuWrapper, MenuItem } from './menu';

function getBoxShadow(opacity, y, blur) {
  return `rgba(18, 21, 26, ${opacity}) 0 ${y}px ${blur}px`
}

const {indigo} = colors;
const AppIcon = styled.div({
  ...size('100%'),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

const icons = [
  <IconSatellite3 weight="thin" />,
  <ReactLogo />,
  <IconSchema weight="thin" />,
  <AppleLogo style={{
    padding: 1,
    paddingTop: 0,
    paddingBottom: 2
  }} />,
];

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <MenuWrapper>
      {navItems.filter((navItem) => {
        return !(navItem.omitLandingPage);
      }).map((navItem, index) => (
        <MenuItem
          key={navItem.url}
          icon={(
            <AppIcon>
              {icons[index]}
            </AppIcon>
          )}
          title={(
            <StyledLink href={navItem.url}>
              {navItem.title}
            </StyledLink>
          )}
        >
          <NavItemDescription>{navItem.description}</NavItemDescription>
        </MenuItem>
      ))}
    </MenuWrapper>
  );
}
