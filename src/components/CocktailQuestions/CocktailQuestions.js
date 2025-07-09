import React, { useRef, useCallback, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { Box, Typography, Paper, useMediaQuery, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useVoiceModal } from '../VoiceModal';
import debounce from 'lodash.debounce';

export const COCKTAIL_QUESTIONS_FIRST = 5;

export const CocktailQuestionsFragment = gql`
  fragment CocktailQuestionsFragment on Cocktail {
    cocktailQuestionsByCocktailId(orderBy: [QUESTION_ORDER_ASC], first: $firstCocktailQuestion, after: $afterCocktailQuestion) {
      totalCount
      nodes {
        nodeId
        questionId
        questionText
        category
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const CocktailQuestionsFirstFragment = gql`
  fragment CocktailQuestionsFragment on Cocktail {
    cocktailQuestionsByCocktailId(orderBy: [QUESTION_ORDER_ASC], first: ${COCKTAIL_QUESTIONS_FIRST}, after: null) {
      totalCount
      nodes {
        nodeId
        questionId
        questionText
        category
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const CocktailQuestionList = ({ cocktailQuestions, totalCount, fetchMore, pageInfo }) => {
  const { openVoiceModal } = useVoiceModal();
  const scrollContainerRef = useRef(null);
  const [scrolling, setScrolling] = useState(false); // To prevent multiple scrolls at once
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm')); // Check screen size
  const [completedQuestions, setCompletedQuestions] = useState([]);

  const toggleQuestion = (questionId) => {
    setCompletedQuestions((prev) =>
      prev.includes(questionId) ? prev : [...prev, questionId]
    );
  };

  const isQuestionCompleted = (questionId) => completedQuestions.includes(questionId);

  const handleSearch = (question) => {
    openVoiceModal(question.questionText, (success) => {
      if (success) {
        toggleQuestion(question.questionId);
      }
    });
  }

  const handleScroll = useCallback(
    debounce(() => {
      const container = scrollContainerRef.current;
      if (
        container &&
        container.scrollLeft + container.clientWidth >= container.scrollWidth - 100 &&
        pageInfo?.hasNextPage
      ) {
        fetchMore({
          variables: { afterCocktailQuestion: pageInfo.endCursor, firstCocktailQuestion: COCKTAIL_QUESTIONS_FIRST },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              ...fetchMoreResult,
              cocktailByCocktailId: {
                ...fetchMoreResult.cocktailByCocktailId,
                cocktailQuestionsByCocktailId: {
                  ...fetchMoreResult.cocktailByCocktailId.cocktailQuestionsByCocktailId,
                  nodes: [
                    ...prev.cocktailByCocktailId.cocktailQuestionsByCocktailId.nodes,
                    ...fetchMoreResult.cocktailByCocktailId.cocktailQuestionsByCocktailId.nodes,
                  ],
                },
              },
            };
          },
        });
      }
    }, 300),
    [fetchMore, pageInfo]
  );

  const scrollTo = (direction) => {
    if (scrolling) return; // Prevent multiple scrolls at the same time
    setScrolling(true);
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'right' ? 400 : -400;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(() => setScrolling(false), 300); // Reset scrolling state after smooth scroll
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          FAQs
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', ml: 1, alignSelf: 'center' }}>
          {totalCount}
        </Typography>
      </Box>

      {/* Navigation Buttons (For Large Screens) */}
      {!isSmallScreen && cocktailQuestions.length > 0 && (
        <>
          <Box sx={{ position: 'absolute', top: '105%', left: 0, transform: 'translateY(-50%)', zIndex: 2 }}>
            <IconButton
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                pointerEvents: 'auto', // Make button clickable
              }}
              aria-label={'Previous'}
              onClick={() => scrollTo('left')}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ position: 'absolute', top: '105%', right: 0, transform: 'translateY(-50%)', zIndex: 2 }}>
            <IconButton
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                pointerEvents: 'auto', // Make button clickable
              }}
              aria-label={'Next'}
              onClick={() => scrollTo('right')}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
          </Box>
        </>
      )}

      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          pb: 2,
        }}
      >
        {cocktailQuestions.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            No questions available yet.
          </Typography>
        ) : (
          cocktailQuestions.map((question) => (
            <Paper
              key={question.questionId}
              sx={{
                minWidth: { xs: 'calc(100vw - 80px)', sm: 300 },
                maxWidth: { xs: 'calc(100vw - 80px)', sm: 500 },
                p: 2,
                backgroundColor: '#fff',
                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
                flexShrink: 0,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                cursor: 'pointer',
                textDecoration: isQuestionCompleted(question.questionId) ? 'line-through' : 'none',
              }}
              onClick={() => handleSearch(question)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: isQuestionCompleted(question.questionId) ? 'text.disabled' : 'text.secondary', whiteSpace: 'nowrap' }}>
                  {question.category.toUpperCase()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                <i>{question.questionText}</i>
              </Typography>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default CocktailQuestionList;
