import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { DocsetIcon } from 'apollo-algolia-autocomplete';
import { MenuItem, MenuWrapper } from './menu';
import { NavItemDescription, NavItemsContext } from 'gatsby-theme-apollo-docs';
import './styles.css'
const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <MenuWrapper className="menu-wrapper">
      {navItems
        .filter(navItem => !navItem.omitLandingPage)
        .map((navItem, index) => (
          <MenuItem
            key={navItem.url}
            icon={<DocsetIcon docset={navItem.docset} />}
            title={<StyledLink href={navItem.url}>{navItem.title}</StyledLink>}
          >
            <NavItemDescription>{navItem.description}</NavItemDescription>
          </MenuItem>
        ))}
    </MenuWrapper>
  );
}
