import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/PushPin';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { alpha, styled } from '@mui/material/styles';
import { useVoiceModal } from '../VoiceModal';
import { clearConversationHistory } from '../../store/reducers/conversationHistorySlice';
import { setSearchQuery } from '../../store/reducers/searchSlice';
import theme from '../../theme.js';
import { API_URL } from '../../config';
import R from '../../resources';
const MOBILE_SCREEN_SIZE = 600;

const Logo = '/assets/logo.png';

const SUGGESTED_COCKTAILS = gql`
  query SuggestedCocktails($first: Int) {
    suggestedCocktails: trendingCocktails(first: $first) {
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

// Moved styled components outside the main component
const ClearIconWrapper = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1), // Position it on the right
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer', // Make it clickable
  zIndex: 2, // Ensure it stays on top of other elements
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  display: 'flex',
  flexGrow: 1,
  marginLeft: theme.spacing(1),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    flexGrow: 0,
    width: '40ch',
  },
  transition: theme.transitions.create(['width', 'background-color'], {
    duration: theme.transitions.duration.short,
  }),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(3),
  transition: theme.transitions.create('width', {
    duration: theme.transitions.duration.shorter,
  }),
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const VAppBar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { openVoiceModal } = useVoiceModal();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const storedQuery = useSelector((state) => state.search.query);
  const [searchValue, setSearchValue] = useState(storedQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAppBarSearch, setShowAppBarSearch] = useState(false);
  const logoLongPressTimeout = useRef(null);
  const logoImageRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const hiddenSearchRoutes = ['/login', '/signup', '/account', '/collection', '/privacy', '/forgot-password', '/reset-password', '/terms-of-service'];
  const alwaysShowSearchRoutes = ['/cocktails/[id]', '/cocktail-profiles/[id]', '/equipment/[id]', '/'];

  // Fetch suggested cocktails
  const { data: suggestedData, loading: suggestedLoading, error: suggestedError } = useQuery(SUGGESTED_COCKTAILS, {
    variables: { first: COCKTAIL_FIRST },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
      const handleRouteChange = (url) => {
        // Hide on certain routes
        if (hiddenSearchRoutes.includes(url)) {
          setShowAppBarSearch(false);
          return;
        }

        // Always show on specific routes
        if (alwaysShowSearchRoutes.some(route => url.startsWith(route))) {
          setShowAppBarSearch(true);
          return;
        }

      };

      // Initial setup
      handleRouteChange(router.pathname);
      router.events.on('routeChangeComplete', (pathname) => { handleRouteChange(pathname) });

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]); // Dismiss suggestions if clicked outside

        // Dismiss the keyboard on mobile by blurring the input
        if (document.activeElement && document.activeElement.tagName === "INPUT") {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchValue(storedQuery);
  }, [storedQuery]);

  useEffect(() => {
    const handleContextMenu = (event) => event.preventDefault(); // Prevents right-click context menu
    const handleCopy = (event) => event.clipboardData.clearData(); // Clears clipboard data if copied

    if (logoImageRef.current) {
      logoImageRef.current.addEventListener('contextmenu', handleContextMenu);
      logoImageRef.current.addEventListener('copy', handleCopy); // Prevents copying
    }

    return () => {
      if (logoImageRef.current) {
        logoImageRef.current.removeEventListener('contextmenu', handleContextMenu);
        logoImageRef.current.removeEventListener('copy', handleCopy);
      }
    };
  }, []);

  const handleLogoClick = () => {
    if (router.pathname === '/') {
      if (window.scrollY === 0) {
        router.replace({ pathname: '/' }, undefined, { shallow: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (window.scrollY === 0) {
        dispatch(clearConversationHistory());
        sessionStorage.clear();
        sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
        dispatch(setSearchQuery(''));
        router.push({ pathname: '/' }, undefined, { shallow: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLogoPressStart = () => {
    logoLongPressTimeout.current = setTimeout(() => {
      openVoiceModal();
    }, 500); // Adjust time as necessary
  };

  const handleLogoPressEnd = () => {
    clearTimeout(logoLongPressTimeout.current);
  };

  const handleLogin = () => {
    sessionStorage.setItem('/login', JSON.stringify({ x: 0, y: 0 }));
    router.push('/login');
  };

  const handleAccount = () => {
    sessionStorage.setItem('/account', JSON.stringify({ x: 0, y: 0 }));
    router.push('/account');
  };

  const handleLikes = () => {
    sessionStorage.setItem('/collection', JSON.stringify({ x: 0, y: 0 }));
    router.push('/collection');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
      const searchQuery = event.target.value;
      setSuggestions([]);
      sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
      window.scrollTo({
        top: 0,
      });
      router.push({ pathname: '/', query: { query: searchQuery } }, undefined, { shallow: true });
    }
  };

  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchValue(value);
    if (value && value.trim().length > 0) {
      try {
        const response = await fetch(`${API_URL}/search-suggestions?query=${value}`);
        const result = await response.json();
        setSuggestions(result);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else if (!value || value.trim().length === 0) {
      handleClearSearch();
    } else {
      setSuggestions([]);
    }
  };

  const handleClearSearch = async () => {
    setSearchValue('');
    setSuggestions(suggestedData?.suggestedCocktails?.edges.map(edge => edge.node.title.toLowerCase()) || []); // Show trending cocktails if the field is empty
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (router.pathname === '/') {
      router.push({ pathname: router.pathname }, undefined, { shallow: true });
    }
  };

  const handleTagSelect = (tag) => {
    // Dismiss the keyboard by blurring the input field
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    setSearchValue(tag);
    setSuggestions([]); // Clear suggestions
    sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
    window.scrollTo({
      top: 0,
    });
    router.push({ pathname: '/', query: { query: tag } }, undefined, { shallow: true });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Focus event listener to show suggestions on focus
 useEffect(() => {
   const handleFocus = () => {
     if (suggestedLoading) {
      return; // Prevent showing suggestions until data is ready
     }
     // Show trending suggestions when input is focused and query is empty
     if (!searchValue || searchValue.length === 0) {
       if (suggestedData && suggestedData.suggestedCocktails) {
         setSuggestions(suggestedData.suggestedCocktails.edges.map(edge => edge.node.title.toLowerCase()));
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
 }, [searchValue, suggestedData, suggestedLoading]);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: (theme) => theme.palette.primary.main,
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)',
          borderBottom: (theme) => `1px solid ${theme.palette.primary.dark}`
        }}
        >
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 10px', userSelect: 'none', }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              height: 64,
            }}
            onClick={handleLogoClick}
            onMouseDown={handleLogoPressStart}
            onMouseUp={handleLogoPressEnd}
            onTouchStart={handleLogoPressStart}
            onTouchEnd={handleLogoPressEnd}
          >
            <Box
              component="img"
              ref={logoImageRef}
              sx={{
                height: 44,
                touchAction: 'none',
                userSelect: 'none',
                pointerEvents: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserDrag: 'none',
              }}
              alt={R.strings.APP_NAME}
              src={Logo}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginLeft: '8px',
              }}
            >
              <Typography
                sx={{
                  color: '#FAFAFA',
                  fontWeight: 500,
                  fontSize: '1.25rem',
                  display: { xs: 'none', sm: 'block' },
                  lineHeight: 1.2, // Adjust line height for tighter spacing
                }}
                variant="h6"
              >
                {R.strings.APP_NAME}
              </Typography>
            </div>
          </div>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {showAppBarSearch && (
              <Search ref={searchContainerRef} sx={{ marginRight: 2, maxWidth: '600px' }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder={R.strings.SEARCH_PLACEHOLDER}
                  inputProps={{ 'aria-label': 'search', enterKeyHint: 'search' }}
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                  inputRef={searchInputRef}
                />
                {/* Show the clear icon only if there's text in the input */}
                {searchValue && (
                  <ClearIconWrapper onClick={handleClearSearch}>
                    <ClearIcon />
                  </ClearIconWrapper>
                )}
                {suggestions.length > 0 && (
                  <Paper sx={{ position: 'absolute', top: '100%', left: 0, width: '100%', mt: 1, zIndex: 1 }}>
                    <List>
                      {suggestions.map((tag, index) => (
                        <ListItem key={index} button sx={{ cursor: 'pointer' }} onClick={() => handleTagSelect(tag)}>
                          {tag}
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Search>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} aria-label="menu" onClick={handleMenuOpen}>
              <MenuIcon sx={{ color: '#FAFAFA' }} />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              {!isAuthenticated ? (
                [
                  <MenuItem key="login" onClick={() => { handleLogin(); handleMenuClose(); }}>Login</MenuItem>
                ]
              ) : (
                [
                  <MenuItem key="likes" onClick={() => { handleLikes(); handleMenuClose(); }}>Collection</MenuItem>,
                  <MenuItem key="account" onClick={() => { handleAccount(); handleMenuClose(); }}>Account</MenuItem>
                ]
              )}
            </Menu>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" aria-label="collection" onClick={handleLikes}>
                    <Badge color="secondary">
                      <FavoriteIcon sx={{ color: '#FAFAFA' }} />
                    </Badge>
                  </IconButton>
                  <IconButton color="inherit" aria-label="account" onClick={handleAccount}>
                    <AccountCircle sx={{ color: '#FAFAFA' }} />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography
                    onClick={handleLogin}
                    sx={{
                      marginLeft: 2,
                      cursor: "pointer",
                      color: theme.palette.primary.contrastText,
                      fontWeight: 500,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Login
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ paddingTop: '64px' }} />
    </>
  );
};

export default VAppBar;
