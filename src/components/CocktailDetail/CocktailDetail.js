import React, { useState, useCallback, useEffect, useRef } from 'react';
import Fraction from 'fraction.js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import { Box, Typography, Button, Grid, Paper, CircularProgress, Snackbar,
  IconButton, Chip, Rating, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { isMobile } from 'react-device-detect';
import debounce from 'lodash.debounce';
import CocktailDetailImage from './CocktailDetailImage';
import SkeletonLoader from './SkeletonLoader';
import FavoriteButton from '../FavoriteButton';
import RatingInput from '../RatingInput';
import RatingsModal from '../RatingsModal';
import CocktailQuestions, { CocktailQuestionsFragment, COCKTAIL_QUESTIONS_FIRST } from '../CocktailQuestions';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useCallToActionModal } from '../CallToActionModal';
import { toggleUnit } from '../../store/reducers/unitsOfMeasureSlice';
import { convertToBaseUnit, formatTime, generateCocktailUrl, generateProfileUrl,
  generateEquipmentUrl, getOptimizedImageUrl, decimalToFraction } from '../../utilities';
const FIRST = 1;
// Conversion factors to mL
const CONVERSIONS_TO_ML = {
  oz: 30,
  tbsp: 15,
  tsp: 5,
  cup: 240,
  pint: 473,
};

const COCKTAIL_BY_COCKTAIL_ID = gql`
query CocktailByCocktailId($cocktailId: UUID!, $firstCocktailQuestion: Int!, $afterCocktailQuestion: Cursor) {
  cocktailByCocktailId(cocktailId: $cocktailId) {
    nodeId
    cocktailId
    title
    description
    history
    origin
    glassType
    garnish
    rating
    ratingCount
    isNew
    prepTime {
      seconds
      minutes
      hours
    }
    cocktailImagesByCocktailId(orderBy: [IMAGE_ORDER_ASC]) {
      nodes {
        nodeId
        imageId
        imageUrl
      }
    }
    cocktailAnecdotesByCocktailId(orderBy: [ANECDOTE_ORDER_ASC]) {
      nodes {
        nodeId
        anecdoteId
        anecdoteText
      }
    }
    cocktailIngredientsByCocktailId {
      nodes {
        ingredientByIngredientId {
          nodeId
          ingredientId
          ingredientName
        }
        quantity
        specialQuantity
        unitByUnitId {
          unitAbbreviation
          unitName
        }
      }
    }
    instructionsByCocktailId {
      nodes {
        nodeId
        instructionId
        instructionText
        hint
        stepNumber
      }
    }
    cocktailTagsByCocktailId(orderBy: [TAG_BY_TAG_ID__TAG_ORDER_ASC]) {
      nodes {
        tagByTagId {
          tagId
          tagName
        }
      }
    }
    cocktailEquipmentsByCocktailId {
      nodes {
        equipmentByEquipmentId {
          equipmentId
          name
          imageUrl
        }
      }
    }
    ...CocktailQuestionsFragment
  }
}
 ${CocktailQuestionsFragment}
`;

const COCKTAIL_BY_COCKTAIL_ID_RECOMMENDED = gql`
query CocktailByCocktailIdRecommended($cocktailId: UUID!, $firstCocktailQuestion: Int!, $afterCocktailQuestion: Cursor) {
  cocktailByCocktailId(cocktailId: $cocktailId) {
    nodeId
    cocktailId
    title
    description
    history
    origin
    glassType
    garnish
    rating
    ratingCount
    isNew
    prepTime {
      seconds
      minutes
      hours
    }
    cocktailImagesByCocktailId(orderBy: [IMAGE_ORDER_ASC]) {
      nodes {
        nodeId
        imageId
        imageUrl
      }
    }
    cocktailAnecdotesByCocktailId(orderBy: [ANECDOTE_ORDER_ASC]) {
      nodes {
        nodeId
        anecdoteId
        anecdoteText
      }
    }
    cocktailIngredientsByCocktailId {
      nodes {
        ingredientByIngredientId {
          nodeId
          ingredientId
          ingredientName
        }
        quantity
        specialQuantity
        unitByUnitId {
          unitAbbreviation
          unitName
        }
      }
    }
    instructionsByCocktailId {
      nodes {
        nodeId
        instructionId
        instructionText
        hint
        stepNumber
      }
    }
    cocktailTagsByCocktailId(orderBy: [TAG_BY_TAG_ID__TAG_ORDER_ASC]) {
      nodes {
        tagByTagId {
          tagId
          tagName
        }
      }
    }
    cocktailEquipmentsByCocktailId {
      nodes {
        equipmentByEquipmentId {
          equipmentId
          name
          imageUrl
        }
      }
    }
    ...CocktailQuestionsFragment
  }
}
 ${CocktailQuestionsFragment}
`;

const RECOMMENDED_COCKTAILS = gql`
query RecommendedCocktails($pCocktailId: UUID!, $first: Int!, $after: Cursor) {
  recommendedCocktails(pCocktailId: $pCocktailId, first: $first, after: $after) {
    edges {
      node {
        cocktailId
        nodeId
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
  }
}
`;

const CocktailDetailPage = ({ id, isMainTitle }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isWebPSupported = useSelector((state) => state.webp.isSupported);
  const unitsOfMeasure = useSelector((state) => state.unitsOfMeasure.unit);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [toastOpen, setToastOpen] = useState(false); // New state for toast
  const [toastMessage, setToastMessage] = useState('');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const { data, loading, fetchMore, error } = useQuery(isMainTitle ? COCKTAIL_BY_COCKTAIL_ID : COCKTAIL_BY_COCKTAIL_ID_RECOMMENDED, {
    variables: { cocktailId: id, firstCocktailQuestion: COCKTAIL_QUESTIONS_FIRST },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    setCompletedSteps([]);
  }, [id]);

  useEffect(() => {
    const totalSteps = data?.cocktailByCocktailId?.instructionsByCocktailId?.nodes?.length || 0;
    if (completedSteps.length === totalSteps && totalSteps > 0) {
      setRatingModalOpen(true);
    }
  }, [completedSteps]);

  if (loading)
    return (
      <SkeletonLoader />
    );

  if (error) return <Typography color="error">Error loading cocktail details</Typography>;

  const cocktail = data?.cocktailByCocktailId;
  const ingredients = cocktail?.cocktailIngredientsByCocktailId.nodes || [];
  const instructions = cocktail?.instructionsByCocktailId.nodes || [];
  const images = cocktail?.cocktailImagesByCocktailId.nodes || [];
  const tags = cocktail?.cocktailTagsByCocktailId.nodes || [];
  const equipments = cocktail?.cocktailEquipmentsByCocktailId.nodes || [];
  const cocktailQuestions = cocktail?.cocktailQuestionsByCocktailId.nodes || [];
  const cocktailQuestionsTotalCount = cocktail?.cocktailQuestionsByCocktailId.totalCount || [];
  const cocktailQuestionsPageInfo = cocktail?.cocktailQuestionsByCocktailId.pageInfo;
  const anecdotes = cocktail?.cocktailAnecdotesByCocktailId.nodes || [];
  const sortedInstructions = instructions.slice().sort((a, b) => a.stepNumber - b.stepNumber);
  const sortedIngredients = ingredients.slice().sort((a, b) => convertToBaseUnit(b) - convertToBaseUnit(a));

  // Combine images with corresponding anecdotes (if any)
  const imagesWithAnecdotes = images.map((image, index) => ({
    ...image,
    anecdoteText: anecdotes[index]?.anecdoteText || 'No anecdote available.',
  }));

  const toggleInstruction = (stepNumber) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((step) => step !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const isStepCompleted = (stepNumber) => completedSteps.includes(stepNumber);

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleShareClick = () => {
    const { cocktailId, title } = cocktail;
    const cocktailUrl = generateCocktailUrl(cocktailId, title);
    const shareUrl = `${window.location.origin}${cocktailUrl}`;

    if (isMobile && navigator.share) {
      navigator.share({
        title: title,
        url: shareUrl,
      })
      .then(() => {
        setToastMessage(`Cheers 🥂`);
        setToastOpen(true);
      })
      .catch((error) => {
        // If sharing fails, fall back to copying the link
        console.error('Error sharing, falling back to copy:', error);
        if (!error.name === 'AbortError') {
          navigator.clipboard.writeText(shareUrl)
            .then(() => {
              setToastMessage('Link copied 🥂');
              setToastOpen(true);
            })
            .catch(() => {
              setToastMessage('Failed to copy link.');
              setToastOpen(true); // Open the Snackbar even on error
            });
        }
      });
    } else {
      // Fallback to copy-to-clipboard if it's mobile or Web Share API is not supported
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setToastMessage('Link copied 🥂');
          setToastOpen(true);
        })
        .catch(() => {
          setToastMessage('Failed to copy link.');
          setToastOpen(true);
        });
    }
  };

  const handleToggle = () => dispatch(toggleUnit());

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { sm: '100%', md: '1200px' },  // Full width on mobile
        mx: { sm: 0, md: 'auto' },  // No margin on mobile, centered on larger screens
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        mb: 6,
      }}
    >
      {/* Snackbar for toast messages */}
      <Snackbar
        open={toastOpen}  // Render the Snackbar based on toastOpen state
        autoHideDuration={6000}
        onClose={handleToastClose}
        message={toastMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleToastClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Use the RatingsModal Component */}
      <RatingsModal
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        cocktailId={cocktail?.cocktailId}
        cocktailTitle={cocktail?.title}
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 2, mt: { sm: 0, md: 1, lg: 2 } }}>
        <Box
          sx={{
            flex: { xs: '1', md: '0 0 45%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: { xs: 1, md: 0 },
            ml: { xs: 0, md: 2 },
            paddingRight: { xs: 0, md: 1 },
            overflow: 'hidden',
          }}
        >
        <Carousel
          selectedItem={currentImageIndex}
          ariaLabel={`${cocktail.title}`}
          onChange={(index) => setCurrentImageIndex(index)}
          swipeScrollTolerance={50}
          preventMovementUntilSwipeScrollTolerance={true}
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={5000}
          renderIndicator={() => null}
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '15px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                &#8249;
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                &#8250;
              </button>
            )
          }
        >
          {imagesWithAnecdotes.map((item) => (
              <Box
                key={item.imageId}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                  padding: 2,
                  background: '#fff',
                }}
              >
                <CocktailDetailImage imageUrl={item.imageUrl} anecdoteText={cocktail.title} />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.anecdoteText}
                </Typography>
              </Box>
            )
          )}
        </Carousel>
        </Box>

        <Box sx={{ flex: 1, p: 2, ml: { md: 5 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link href={generateCocktailUrl(cocktail.cocktailId, cocktail.title)} style={{ textDecoration: 'none' }}>
                <Typography
                  component={isMainTitle ? 'h1' : 'span'}
                  sx={{
                    marginRight: 2,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    color: 'text.primary',
                    letterSpacing: '0.5px',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {cocktail.title || 'Untitled Cocktail'}
                </Typography>
              </Link>
              {cocktail.isNew && (
                <Box
                  sx={{
                    ml: 2,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: 'secondary.main',
                    color: 'primary.contrastText',
                    borderRadius: 1,
                    typography: 'caption',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                  }}
                >
                  New
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FavoriteButton cocktailId={cocktail.cocktailId} />
              <IconButton
                aria-label="share"
                onClick={handleShareClick}
                sx={{ ml: 1 }}
              >
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mt={0} mb={1}>
            <Rating value={cocktail.rating} readOnly precision={0.5} />
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              {parseFloat(cocktail.rating)?.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              {cocktail.ratingCount || 0} {cocktail.ratingCount === 1 ? 'rating' : 'ratings'}
            </Typography>
          </Box>

          <Box
            sx={{
              overflowX: 'auto',
              whiteSpace: 'nowrap', // Ensures tags stay on one line
              gap: 1,
              mb: 2,
              maxWidth: 360,
              scrollbarWidth: 'none', // Hide scrollbar for Firefox
              '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome, Safari, and Edge
            }}
          >
            {tags.map((tag) => (
              <Link
                key={tag.tagByTagId.tagId}
                href={generateProfileUrl(tag.tagByTagId.tagId, tag.tagByTagId.tagName)}
                passHref
              >
                <Chip
                  label={tag.tagByTagId.tagName}
                  component="a" // Ensures that Chip renders as an <a> tag for SEO
                  clickable // Enables clickable behavior on the Chip
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontSize: '14px',
                    padding: '0 4px',
                    margin: '0 4px 0px 0',
                  }}
                />
              </Link>
            ))}
          </Box>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {cocktail.description || 'No description provided.'}
          </Typography>

          {/* New Fields: History, Origin, Glass Type, Garnish, Prep Time */}
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            <strong>History:</strong> {cocktail.history || 'No history available.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            <strong>Origin:</strong> {cocktail.origin || 'No origin available.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            <strong>Glass Type:</strong> {cocktail.glassType || 'No glass type provided.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            <strong>Garnish:</strong> {cocktail.garnish || 'No garnish provided.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
            <strong>Prep Time:</strong> {formatTime(cocktail.prepTime) || 'No prep time provided.'}
          </Typography>
        </Box>
      </Box>

      {/* Ingredients Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2, pl: 2, pr: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mr: 2 }}>
          Ingredients
        </Typography>
        {/* Unit Toggle (ml/oz) */}
        <ToggleButtonGroup
          value={unitsOfMeasure}
          exclusive
          onChange={handleToggle}
          aria-label="unit toggle"
          sx={{
          borderRadius: '12px',
          backgroundColor: 'background.default',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          '& .MuiToggleButton-root': {
            padding: '4px 7px',
            fontSize: '.6rem',
            fontWeight: 600,
            borderRadius: '6px',
            color: 'text.primary',
            transition: '0.3s ease',
          },
        }}
        >
          <ToggleButton value="ml">mL</ToggleButton>
          <ToggleButton value="oz">oz</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Grid container spacing={1} sx={{ pl: 2, pr: 2 }}>
        {sortedIngredients.map((ingredient, index) => {
          const { specialQuantity, quantity, unitByUnitId, ingredientByIngredientId } = ingredient;

          const calculateSpecialQuantity = (specialQuantity, ingredientName) => {
            if (!specialQuantity) return null;

            // Regex to handle fractions (e.g., 1/2) or whole numbers with optional text
            const fractionRegex = /^(\d+\/\d+|\d+)(.*)$/;
            const match = specialQuantity.match(fractionRegex);
            if (match) {
              let [_, number, text] = match; // Extract number and remaining text

              let scaledQuantity;
              if (number.includes('/')) {
                // Properly instantiate a Fraction for fractional numbers
                const fraction = new Fraction(number);
                scaledQuantity = fraction; // Use the correct method for multiplication
              } else {
                // For whole numbers, create a Fraction instance
                const fraction = new Fraction(parseFloat(number));
                scaledQuantity = fraction;
              }

              // Format scaledQuantity back into a fraction
              const formattedQuantity = scaledQuantity.toFraction(true);

              // Use unitName as fallback when unitAbbreviation is empty
              const unit = unitByUnitId.unitAbbreviation || unitByUnitId.unitName || '';

              return `${formattedQuantity}${text} ${unit.toLowerCase()} ${ingredientName}`.toLowerCase();
            }

            // If no numeric portion, return as is with ingredientName
            const unit = unitByUnitId.unitAbbreviation || unitByUnitId.unitName || '';
            return `${specialQuantity} ${unit.toLowerCase()} ${ingredientName}`.toLowerCase();
          };

          let iQuantity = quantity;
          let iUnit = iQuantity ? (unitByUnitId.unitAbbreviation || unitByUnitId.unitName || "").toLowerCase() : "";

          // Convert to mL if applicable
          if (unitsOfMeasure === 'ml' && CONVERSIONS_TO_ML[iUnit]) {
            iQuantity = iQuantity * CONVERSIONS_TO_ML[iUnit];
            iUnit = 'ml';
          } else {
            iQuantity = decimalToFraction(quantity);
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Typography
                variant="body2"
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.primary' }}
              >
                <span>
                  {specialQuantity
                    ? calculateSpecialQuantity(
                        specialQuantity,
                        ingredientByIngredientId.ingredientName.toLowerCase(),
                      ) // Use regex-scaled specialQuantity with ingredientName
                    : `${(iQuantity || 0)} ${iUnit} ${ingredientByIngredientId.ingredientName.toLowerCase()}`}
                </span>
              </Typography>
            </Grid>
          );
        })}
      </Grid>

      {/* Equipment Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4, pl: 2, pr: 2}}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mr: 2 }}>
          Equipment
        </Typography>
      </Box>
      <Grid container spacing={1} sx={{ pl: 2, pr: 2 }}>
        {equipments.length > 0 ? (
          equipments.map((equipment, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
            {equipment.equipmentByEquipmentId?.imageUrl ? (
              <Link
                href={generateEquipmentUrl(equipment.equipmentByEquipmentId?.equipmentId, equipment.equipmentByEquipmentId?.name)}
                underline="hover"
              >
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.primary' }}
                >
                  <span>{equipment.equipmentByEquipmentId?.name || 'Unnamed Equipment'}</span>
                </Typography>
              </Link>
              ) : (
              <Typography
                variant="body2"
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.primary' }}
              >
                <span>{equipment.equipmentByEquipmentId?.name || 'Unnamed Equipment'}</span>
              </Typography>
              )}
            </Grid>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            No equipment provided for this cocktail.
          </Typography>
        )}
      </Grid>

      {/* Instructions Section */}
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mt: 4, mb: 2, pl: 2, pr: 2 }}>
        Instructions
      </Typography>
      {sortedInstructions.map((instruction) => (
        <Paper
          key={instruction.stepNumber}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#fff',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
            textDecoration: isStepCompleted(instruction.stepNumber) ? 'line-through' : 'none',
            cursor: 'pointer',
          }}
          onClick={() => toggleInstruction(instruction.stepNumber)}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1, color: isStepCompleted(instruction.stepNumber) ? 'text.disabled' : 'text.primary' }}
          >
            Step {instruction.stepNumber}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isStepCompleted(instruction.stepNumber) ? 'text.disabled' : 'text.secondary',
            }}
          >
            {instruction.instructionText}
          </Typography>
          {instruction.hint && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
              {instruction.hint}
            </Typography>
          )}
        </Paper>
      ))}
      <Box sx={{ mb: 2, pl: 2, pr: 2 }}>
        <CocktailQuestions cocktailQuestions={cocktailQuestions} totalCount={cocktailQuestionsTotalCount} fetchMore={fetchMore} pageInfo={cocktailQuestionsPageInfo} />
        <RatingInput cocktailId={cocktail.cocktailId} />
      </Box>
    </Box>
  );
};

const MainCocktailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openCallToActionModal } = useCallToActionModal();
  const didClickCtaLink = useSelector((state) => state.callToAction.didClickCtaLink);

  const { data, fetchMore, loading } = useQuery(RECOMMENDED_COCKTAILS, {
    variables: { pCocktailId: id, first: FIRST }, // Fetch a batch of 3 cocktails
    fetchPolicy: 'cache-and-network',
  });

  const handleScroll = useCallback(
    debounce(() => {
      if (!isAuthenticated && !didClickCtaLink && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        openCallToActionModal();
      }

      if (!data?.recommendedCocktails.pageInfo.hasNextPage) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        fetchMore({
          variables: { first: FIRST, after: data.recommendedCocktails.pageInfo.endCursor }, // No cursor in state, use data directly
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previousResult;

            return {
              recommendedCocktails: {
                ...fetchMoreResult.recommendedCocktails,
                edges: [
                  ...previousResult.recommendedCocktails.edges,
                  ...fetchMoreResult.recommendedCocktails.edges,
                ],
              },
            };
          },
        });
      }
    }, 300),
    [data, fetchMore, isAuthenticated, openCallToActionModal]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Box>
      <CocktailDetailPage id={id} isMainTitle />

      <Box sx={{ mt: 10 }}>
        {data?.recommendedCocktails.edges.map((recommended) => (
          <CocktailDetailPage key={recommended.node.cocktailId} id={recommended.node.cocktailId} isMainTitle={false} />
        ))}
        {loading && <CircularProgress />}
      </Box>

    </Box>
  );
};

export default MainCocktailPage;
