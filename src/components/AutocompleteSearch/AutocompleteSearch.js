import { useState, useRef, useEffect } from 'react';
import { Box, TextField, List, ListItem, Paper, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useQuery, gql } from '@apollo/client';
import { API_URL } from '../../config';
import R from '../../resources';

// Define the GraphQL query for fetching trending cocktails
const TRENDING_COCKTAILS = gql`
  query SuggestedCocktails($first: Int) {
    trendingCocktails(first: $first) {
      edges {
        node {
          nodeId
          cocktailId
          title
        }
      }
    }
  }
`;

const COCKTAIL_FIRST = 5; // The number of cocktails you want to fetch at once

const AutocompleteSearch = ({ searchQuery, onSelect, onClearSearch }) => {
  const [internalQuery, setInternalQuery] = useState(searchQuery); // Internal state to store the search query
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  // Query to fetch the trending cocktails
  const { data, loading, error, fetchMore } = useQuery(TRENDING_COCKTAILS, {
    variables: { first: COCKTAIL_FIRST },
    fetchPolicy: 'cache-first',
  });

  // Sync internal query with the parent searchQuery prop
  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  // Handle input change and fetch suggestions based on entered text
  const handleSearchChange = async (e) => {
    const searchText = e.target.value;
    setInternalQuery(searchText); // Update internal query as user types

    if (searchText && searchText.trim().length > 0) {
      try {
        const response = await fetch(`${API_URL}/search-suggestions?query=${searchText}`);
        const result = await response.json();
        setSuggestions(result || []); // Update suggestions with fetched result
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else if (!searchText || searchText.trim().length === 0) {
      setSuggestions(data?.trendingCocktails?.edges.map(edge => edge.node.title.toLowerCase()) || []); // Show trending cocktails if the field is empty
    } else {
      setSuggestions([]); // Clear suggestions if the query is too short
    }
  };

  // Handle selection of a suggestion
  const handleSelect = (tagName) => {
    onSelect(tagName); // Notifies the parent about the selected tag
    setInternalQuery(tagName); // Update the internal query to selected tag
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle key press events (Enter key)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSelect(internalQuery); // Perform the search with the current query
      setSuggestions([]); // Clear suggestions
    }
  };

  // Clear input field
  const handleClear = () => {
    setInternalQuery('');
    setSuggestions(data?.trendingCocktails?.edges.map(edge => edge.node.title.toLowerCase()) || []); // Show trending cocktails if the field is empty
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    onClearSearch()
  };

  // Dismiss suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current.contains(event.target)) {
        setSuggestions([]); // Clear suggestions if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

    // Focus event listener to show suggestions on focus
   useEffect(() => {
     const handleFocus = () => {
       // Show trending suggestions when input is focused and query is empty
       if (!internalQuery || internalQuery.length === 0) {
         if (data && data.trendingCocktails) {
           setSuggestions(data.trendingCocktails.edges.map(edge => edge.node.title.toLowerCase()));
         }
       }
     };

     const inputElement = searchInputRef.current;
     if (inputElement) {
       inputElement.addEventListener('focus', handleFocus);
     }

     // Clean up event listener
     return () => {
       if (inputElement) {
         inputElement.removeEventListener('focus', handleFocus);
       }
     };
   }, [internalQuery, data]);

  return (
    <Box ref={containerRef} display="flex" justifyContent="center" sx={{ position: 'relative', width: '100%' }}>
      <TextField
        label={R.strings.SEARCH_PLACEHOLDER}
        variant="outlined"
        value={internalQuery} // Use internal state for value
        onChange={handleSearchChange}
        inputRef={searchInputRef}
        onKeyPress={handleKeyPress}
        sx={{ width: '100%', maxWidth: '600px', bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {internalQuery && (
                <IconButton onClick={handleClear} size="small">
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', top: '100%', width: '100%', mt: 1, zIndex: 10, maxWidth: '600px' }}>
          <List>
            {suggestions.map((tagName, index) => (
              <ListItem key={index} button sx={{ cursor: 'pointer' }} onClick={() => handleSelect(tagName)}>
                {tagName}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default AutocompleteSearch;
