import {BorderBox, Position, TextInput} from '@primer/components'
import Downshift from 'downshift'
import Fuse from 'fuse.js'
import {navigate, useStaticQuery} from 'gatsby'
import path from 'path'
import React from 'react'
import SearchResults from './search-results'

function Search() {
  const [query, setQuery] = React.useState('')
  const results = useSearch(query)

  return (
    <Downshift
      inputValue={query}
      onInputValueChange={inputValue => setQuery(inputValue)}
      onSelect={item => {
        if (item) {
          setQuery('')
          navigate(item.path)
        }
      }}
      itemToString={item => (item ? item.title : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        getRootProps,
        isOpen,
        inputValue,
        highlightedIndex,
        clearSelection,
      }) => (
        <Position position="relative" {...getRootProps()}>
          <TextInput
            {...getInputProps({
              type: 'search',
              placeholder: 'Search',
              onChange: () => clearSelection(),
            })}
          />
          {isOpen && inputValue ? (
            <Position position="absolute" {...getMenuProps()}>
              <BorderBox minWidth={300} boxShadow="medium" bg="white">
                <SearchResults
                  results={results}
                  getItemProps={getItemProps}
                  highlightedIndex={highlightedIndex}
                />
              </BorderBox>
            </Position>
          ) : null}
        </Position>
      )}
    </Downshift>
  )
}

function useSearch(query) {
  const data = useStaticQuery(graphql`
    {
      allMdx {
        nodes {
          fileAbsolutePath
          frontmatter {
            title
          }
          rawBody
          parent {
            ... on File {
              relativeDirectory
              name
            }
          }
        }
      }
    }
  `)

  const list = React.useMemo(
    () =>
      data.allMdx.nodes.map(node => ({
        path: path.join(
          node.parent.relativeDirectory,
          node.parent.name === 'index' ? '/' : node.parent.name,
        ),
        title: node.frontmatter.title,
        rawBody: node.rawBody,
      })),
    [data],
  )

  const fuse = new Fuse(list, {
    threshold: 0.2,
    keys: ['title', 'rawBody'],
    tokenize: true,
  })

  const [results, setResults] = React.useState([])

  React.useEffect(() => {
    setResults(fuse.search(query))
  }, [query])

  return results
}

export default Search
