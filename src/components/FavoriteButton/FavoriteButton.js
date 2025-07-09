import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import { gql, useQuery, useMutation } from '@apollo/client';
import FavoriteBorderIcon from '@mui/icons-material/PushPinOutlined';
import FavoriteIcon from '@mui/icons-material/PushPin';
import { useSignupModal } from '../SignupModal';
import { getUserIdFromToken } from '../../utilities';

const USER_LIKES_COCKTAIL_BY_USER_ID_AND_COCKTAIL_ID = gql`
  query UserLikesCocktailByUserIdAndCocktailId($userId: UUID!, $cocktailId: UUID!) {
    userLikesCocktailByUserIdAndCocktailId(userId: $userId, cocktailId: $cocktailId) {
      nodeId
    }
  }
`;

const CREATE_USER_LIKES_COCKTAIL = gql`
  mutation CreateUserLikesCocktail($input: CreateUserLikesCocktailInput!) {
    createUserLikesCocktail(input: $input) {
      clientMutationId
      userLikesCocktail {
        nodeId
        userId
        cocktailId
        cocktailByCocktailId {
          cocktailId
          nodeId
          title
        }
      }
    }
  }
`;

const DELETE_USER_LIKES_COCKTAIL = gql`
  mutation DeleteUserLikesCocktail($input: DeleteUserLikesCocktailInput!) {
    deleteUserLikesCocktail(input: $input) {
      clientMutationId
      deletedUserLikesCocktailId
    }
  }
`;

const ALL_USER_LIKES_COCKTAILS = gql`
  query allUserLikesCocktails($userId: UUID!, $orderBy: [UserLikesCocktailsOrderBy!] = [LIKED_AT_DESC], $first: Int, $after: Cursor) {
    userByUserId(userId: $userId) {
      userLikesCocktailsByUserId(orderBy: $orderBy, first: $first, after: $after) {
        edges {
          node {
            nodeId
            cocktailByCocktailId {
              cocktailId
              nodeId
              title
            }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

const FavoriteButton = ({ cocktailId, color }) => {
  const userId = getUserIdFromToken();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openSignupModal } = useSignupModal();
  const [isSelected, setIsSelected] = useState(false);
  const [nodeId, setNodeId] = useState(null);

  const { data } = useQuery(USER_LIKES_COCKTAIL_BY_USER_ID_AND_COCKTAIL_ID, {
    variables: { userId, cocktailId },
    skip: !isAuthenticated, // Skip the query if the user is not authenticated
    onCompleted: (data) => {
      if (data?.userLikesCocktailByUserIdAndCocktailId?.nodeId) {
        setIsSelected(true);
        setNodeId(data.userLikesCocktailByUserIdAndCocktailId.nodeId);
      }
    },
  });

  const [createUserLikesCocktail] = useMutation(CREATE_USER_LIKES_COCKTAIL, {
    update: (cache, { data: { createUserLikesCocktail } }) => {
      const existingLikes = cache.readQuery({
        query: ALL_USER_LIKES_COCKTAILS,
        variables: {
          userId,
          orderBy: ['LIKED_AT_DESC'],
          first: 10,
        },
      }) || { userByUserId: { userLikesCocktailsByUserId: { edges: [] } } };

      const newLikeEdge = {
        __typename: 'UserLikesCocktailEdge',
        node: createUserLikesCocktail.userLikesCocktail,
      };

      if (existingLikes.userByUserId?.userLikesCocktailsByUserId) {
        cache.writeQuery({
          query: ALL_USER_LIKES_COCKTAILS,
          variables: {
            userId,
            orderBy: ['LIKED_AT_DESC'],
            first: 10,
          },
          data: {
            userByUserId: {
              ...existingLikes.userByUserId,
              userLikesCocktailsByUserId: {
                ...existingLikes.userByUserId.userLikesCocktailsByUserId,
                edges: [
                  newLikeEdge,
                  ...existingLikes.userByUserId.userLikesCocktailsByUserId.edges,
                ],
              },
            },
          },
        });
      }

      cache.writeQuery({
        query: USER_LIKES_COCKTAIL_BY_USER_ID_AND_COCKTAIL_ID,
        data: {
          userLikesCocktailByUserIdAndCocktailId: {
            __typename: 'UserLikesCocktail',
            nodeId: createUserLikesCocktail.userLikesCocktail.nodeId,
          },
        },
        variables: { userId, cocktailId },
      });

      setIsSelected(true);
      setNodeId(createUserLikesCocktail.userLikesCocktail.nodeId); // Set nodeId correctly after creating a like
    },
  });

  const [deleteUserLikesCocktail] = useMutation(DELETE_USER_LIKES_COCKTAIL, {
    update: (cache) => {
      cache.writeQuery({
        query: USER_LIKES_COCKTAIL_BY_USER_ID_AND_COCKTAIL_ID,
        data: {
          userLikesCocktailByUserIdAndCocktailId: null,
        },
        variables: { userId, cocktailId },
      });

      setIsSelected(false);
      setNodeId(null); // Reset nodeId after deleting a like
    },
    onError: (error) => {
      console.error("Error deleting the like:", error);
    },
  });

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isAuthenticated) {
      if (isSelected) {
        if (nodeId) {
          deleteUserLikesCocktail({
            variables: { input: { nodeId } }, // Ensure nodeId is passed
          });
        } else {
          console.error("NodeId is null or undefined");
        }
      } else {
        createUserLikesCocktail({
          variables: {
            input: {
              userLikesCocktail: {
                userId,
                cocktailId,
              },
            },
          },
        });
      }
    } else {
      openSignupModal();
    }
  };

  return (
    <IconButton
      sx={{ color }}
      onClick={handleClick}
      aria-label={isSelected ? 'Remove from favorites' : 'Add to favorite'}
      aria-pressed={isSelected}
    >
      {isSelected ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
};

export default FavoriteButton;
