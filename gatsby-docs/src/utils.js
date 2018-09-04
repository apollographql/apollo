import visit from 'unist-util-visit'

export const buildSidebarStructure = ({ config, mdNodes }) => {
  return config.sections.map(section => {
    // for each _item_, find the corresponding md node
    // if the md node has subheadings, add to the section
    const itemsWithHeadingAnchors = section.items.map(item => {
      // either relative (guides/versioning) or absolute (https://...)
      const pathToItem = item.href

      const matchingMdNode = mdNodes.find(({ node }) =>
        node.fileAbsolutePath.includes(pathToItem)
      )

      if (!matchingMdNode) return item

      let headings = []
      visit(
        matchingMdNode.node.htmlAst,
        'element',
        pushHeadingInfoFromNode(headings)
      )

      return { ...item, headings }
    })

    return { ...section, items: itemsWithHeadingAnchors }
  })
}

const pushHeadingInfoFromNode = headings => node => {
  if (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3') {
    const textNode = node.children.find(c => c.type === 'text')
    headings.push({
      level: node.tagName,
      anchor: node.properties.id,
      text: textNode ? textNode.value : null,
    })
  }
}

// given the current page's slug and the list of MD nodes, return the previous
// and next post's slug and url
export const getPreviousAndNextPost = ({ slug, nodes }) => {
  const currentIndex = nodes.findIndex(n => n.node.fields.slug === slug)
  const previous =
    currentIndex && currentIndex > 0 ? nodes[currentIndex - 1] : null
  const next =
    currentIndex && currentIndex < nodes.length - 1
      ? nodes[currentIndex + 1]
      : null

  return {
    previous: {
      title: previous ? previous.node.frontmatter.title : null,
      relativeUrl: previous ? previous.node.fields.slug : null,
    },
    next: {
      title: next ? next.node.frontmatter.title : null,
      relativeUrl: next ? next.node.fields.slug : null,
    },
  }
}
