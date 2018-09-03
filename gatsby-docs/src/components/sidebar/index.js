import React from 'react'
import styled from 'react-emotion'

const Container = styled('div')({
  width: '260px',
  backgroundColor: '#cccccc',
})

const SubSection = styled('a')({
  marginLeft: '15px',
  display: 'block',
})

const Section = ({ title, items }) => (
  <div>
    <h3>{title}</h3>
    {items.map(item => (
      <div>
        <a href={`/${item.href}`}>{item.title}</a>
        {item.headings &&
          item.headings.map(heading => (
            <SubSection href={`#${heading.anchor}`}>{heading.text}</SubSection>
          ))}
      </div>
    ))}
  </div>
)

const Sidebar = ({ items }) => {
  console.log(items)
  return (
    <Container>
      {items.map(section => (
        <Section title={section.title} items={section.items} />
      ))}
    </Container>
  )
}

export default Sidebar
