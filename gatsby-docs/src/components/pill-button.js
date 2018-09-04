import React from 'react'
import styled from 'react-emotion'

const PillButtonWrapper = styled('a')({
  backgroundColor: '#dedede',
  color: '#333',
  padding: '4px 20px',
  borderRadius: '3em',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
})

const PillButtonText = styled('span')({})

export default ({ text, url = 'https://google.com', icon }) => {
  return (
    <PillButtonWrapper href={url}>
      <PillButtonText>{text}</PillButtonText>
    </PillButtonWrapper>
  )
}
