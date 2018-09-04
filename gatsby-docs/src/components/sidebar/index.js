import React from 'react'
import styled from 'react-emotion'

const Container = styled('div')({
  width: '260px',
  backgroundColor: '#cccccc',
})

const Heading = styled('a')(props => ({
  marginLeft: '15px',
  display: 'block',
  backgroundColor: props.active ? '#ff0' : 'transparent',
}))

const PageLink = styled('a')({})
const SectionTitle = styled('h3')({})

const SubSection = ({ items, activePageSlug, activeHeadingAnchor }) =>
  items &&
  items.map(item => (
    <Heading
      key={`${item.title}#${item.anchor}`}
      active={item.anchor === activeHeadingAnchor}
      href={`#${item.anchor}`}
    >
      {item.text}
    </Heading>
  ))

const Section = ({ title, items, activePageSlug, activeHeadingAnchor }) => (
  <div>
    <SectionTitle>{title}</SectionTitle>
    {items.map(item => (
      <div key={item.href}>
        <PageLink href={`${item.href}`}>{item.title}</PageLink>
        {/* note: need trailing slash in check, because the page slug has one */}
        {activePageSlug === `${item.href}/` && (
          <SubSection
            items={item.headings}
            activeHeadingAnchor={activeHeadingAnchor}
            activePageSlug={activePageSlug}
          />
        )}
      </div>
    ))}
  </div>
)

const Sidebar = ({ items, activePageSlug, activeHeadingAnchor }) => {
  return (
    <Container>
      {items.map(section => (
        <Section
          key={section.title}
          title={section.title}
          items={section.items}
          activePageSlug={activePageSlug}
          activeHeadingAnchor={activeHeadingAnchor}
        />
      ))}
    </Container>
  )
}

export default Sidebar
