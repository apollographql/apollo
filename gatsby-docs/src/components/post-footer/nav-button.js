import React from 'react'
import styled from 'react-emotion'

const Container = styled('a')(props => ({
  padding: '20px 50px',
  border: '1px solid #e6ecf1',
  borderRadius: '3px',
  textAlign: props.type === 'next' ? 'right' : 'left',
  display: 'flex',
  flexDirection: 'column',
  textDecoration: 'none',
}))

const NavTypeText = styled('span')({
  color: '#ccc',
  letterSpacing: '.25rm',
  textTransform: 'uppercase',
  fontSize: '12px',
})

const NavTitleText = styled('span')({
  color: '#444',
  letterSpacing: '.25rm',
  textTransform: 'uppercase',
  fontSize: '12px',
})

const NavButton = ({ type, title, url }) => {
  return (
    <Container href={url} type={type}>
      <NavTypeText>{type === 'next' ? 'Next' : 'Previous'}</NavTypeText>
      <NavTitleText>{title}</NavTitleText>
    </Container>
  )
}

export default NavButton
