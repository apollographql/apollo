import React from 'react';
import styled from '@emotion/styled';
import { size } from 'polished';
import { colors } from '@apollo/space-kit/colors';

export const MenuWrapper = styled.div({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(270px, 1fr))`,
  gridGap: 24,
  paddingTop: 8
});

const MenuItemTitle = styled.h4({
  marginBottom: 8,
  fontWeight: 600,
  color: 'inherit'
});

const MenuItemWrapper = styled.div({
  display: 'flex'
});

const IconWrapper = styled.div({
  ...size(28),
  flexShrink: 0,
  marginRight: 16,
});

const TextWrapper = styled.div({
  color: colors.text1
});

export function MenuItem({icon, title, children, ...props}) {
  return (
    <MenuItemWrapper {...props}>
      <IconWrapper>{icon}</IconWrapper>
      <TextWrapper>
        <MenuItemTitle>
          {title}
        </MenuItemTitle>
        {children}
      </TextWrapper>
    </MenuItemWrapper>
  )
}
