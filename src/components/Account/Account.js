import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import { gql, useQuery, useMutation } from '@apollo/client';
import { getUserIdFromToken } from '../../utilities';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { logout } from '../../store/reducers/authSlice';
import axios from 'axios';
import { API_URL } from '../../config';

const USER_BY_USER_ID = gql`
  query UserByUserId($userId: UUID!) {
    userByUserId(userId: $userId) {
      firstName
      lastName
    }
  }
`;

const UPDATE_USER_BY_USER_ID = gql`
  mutation UpdateUserByUserId($input: UpdateUserByUserIdInput!) {
    updateUserByUserId(input: $input) {
      user {
        firstName
        lastName
      }
    }
  }
`;

const ALL_TAGS = gql`
query AllTags($orderBy: [TagsOrderBy!] = [TAG_NAME_ASC], $first: Int, $after: Cursor) {
  allTags(orderBy: $orderBy, first: $first, after: $after) {
    edges {
      node {
        nodeId
        tagId
        tagName
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

const ALL_USER_LIKES_TAGS = gql`
query AllUserLikedTags($userId: UUID!, $first: Int, $after: Cursor) {
  allUserLikesTags(condition: { userId: $userId }, first: $first, after: $after) {
    edges {
      node {
        nodeId
        tagByTagId {
          nodeId
          tagId
          tagName
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
`;

const CREATE_USER_LIKES_TAG = gql`
  mutation CreateUserLikesTag($input: CreateUserLikesTagInput!) {
    createUserLikesTag(input: $input) {
      clientMutationId
      userLikesTag {
        nodeId
        userId
        tagId
      }
    }
  }
`;

const DELETE_USER_LIKES_TAG = gql`
  mutation DeleteUserLikesTag($input: DeleteUserLikesTagInput!) {
    deleteUserLikesTag(input: $input) {
      clientMutationId
      deletedUserLikesTagId
      tagByTagId {
        tagId
      }
    }
  }
`;

const AccountPage = () => {
  const userId = getUserIdFromToken();
  const [selectedSection, setSelectedSection] = useState('flavorProfile'); // Start with flavorProfile
  const [selectedTags, setSelectedTags] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${API_URL}/auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        dispatch(logout());
        sessionStorage.setItem('/', JSON.stringify({ x: 0, y: 0 }));
        router.push('/');
      } else {
        console.error('Error deleting account:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const { loading, error, data } = useQuery(USER_BY_USER_ID, {
    variables: { userId },
    onCompleted: (data) => {
      const user = data.userByUserId;
      setFormValues({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setInitialValues({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    },
  });

  const { loading: tagsLoading, data: tagsData } = useQuery(ALL_TAGS);
  const { loading: userLikesLoading, data: userLikesData } = useQuery(ALL_USER_LIKES_TAGS, {
    variables: { userId },
    onCompleted: (data) => {
      const likedTags = data.allUserLikesTags.edges.map(edge => edge.node.tagByTagId.tagId);
      setSelectedTags(likedTags);
    },
  });

  const [updateUserByUserId, { loading: updateLoading }] = useMutation(UPDATE_USER_BY_USER_ID, {
    update(cache, { data: { updateUserByUserId } }) {
      cache.writeQuery({
        query: USER_BY_USER_ID,
        variables: { userId },
        data: {
          userByUserId: updateUserByUserId.user,
        },
      });
    },
    onCompleted: () => {
      setInitialValues(formValues);
      setEditing(false);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });

  const [createUserLikesTag] = useMutation(CREATE_USER_LIKES_TAG, {
    update(cache, { data: { createUserLikesTag } }) {
      const { userId, tagId } = createUserLikesTag.userLikesTag;

      const existingLikes = cache.readQuery({
        query: ALL_USER_LIKES_TAGS,
        variables: { userId },
      });

      cache.writeQuery({
        query: ALL_USER_LIKES_TAGS,
        variables: { userId },
        data: {
          allUserLikesTags: {
            edges: [
              ...existingLikes.allUserLikesTags.edges,
              {
                node: {
                  nodeId: createUserLikesTag.nodeId,
                  tagByTagId: { tagId },
                },
              },
            ],
          },
        },
      });

      setSelectedTags((prev) => [...prev, tagId]);
    },
    onError: (error) => {
      console.error('Error creating user likes tag:', error);
    },
  });

  const [deleteUserLikesTag] = useMutation(DELETE_USER_LIKES_TAG, {
    update(cache, { data: { deleteUserLikesTag } }) {
      const deletedTagId = deleteUserLikesTag.tagByTagId.tagId;

      const existingLikes = cache.readQuery({
        query: ALL_USER_LIKES_TAGS,
        variables: { userId },
      });

      cache.writeQuery({
        query: ALL_USER_LIKES_TAGS,
        variables: { userId },
        data: {
          allUserLikesTags: {
            edges: existingLikes.allUserLikesTags.edges.filter(edge => edge.node.nodeId !== deletedTagId),
          },
        },
      });

      setSelectedTags((prev) => prev.filter(tagId => tagId !== deletedTagId));
    },
    onError: (error) => {
      console.error('Error deleting user likes tag:', error);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setEditing(true);
  };

  const handleSaveChanges = () => {
    updateUserByUserId({
      variables: {
        input: {
          userId,
          userPatch: formValues,
        },
      },
    });
  };

  const handleCancelChanges = () => {
    setFormValues(initialValues);
    setEditing(false);
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      const userLikeToDelete = userLikesData.allUserLikesTags.edges.find(edge => edge.node.tagByTagId.tagId === tagId);
      if (userLikeToDelete) {
        deleteUserLikesTag({
          variables: { input: { nodeId: userLikeToDelete.node.nodeId } },
        });
      }
    } else {
      createUserLikesTag({
        variables: {
          input: {
            userLikesTag: {
              userId,
              tagId,
            },
          },
        },
      });
    }
  };

  const renderDetailSection = () => {
  if (loading || updateLoading) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formValues.firstName || ''}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formValues.lastName || ''}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
      </Grid>
      {editing && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancelChanges}>
            Cancel
          </Button>
        </Box>
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="error" onClick={() => setOpenDialog(true)}>
          Delete Account
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const renderFlavorProfileSection = () => {
  if (tagsLoading) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6">Flavor Profile</Typography>
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tagsData && tagsData.allTags.edges.length > 0 ? (
          tagsData.allTags.edges.map(({ node }) => (
            <Chip
              key={node.tagId}
              label={node.tagName}
              variant={selectedTags.includes(node.tagId) ? 'filled' : 'outlined'}
              color={selectedTags.includes(node.tagId) ? 'primary' : 'default'}
              onClick={() => handleTagToggle(node.tagId)}
            />
          ))
        ) : (
          <Typography>Profiles unavailable.</Typography>
        )}
      </Box>
    </Paper>
  );
};

  return (
    <Box sx={{ p: 4, bgcolor: '#f7f7f7', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: '400' }}>
          {data?.userByUserId.firstName} {data?.userByUserId.lastName}
        </Typography>
        <Button variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Button
              fullWidth
              variant={selectedSection === 'flavorProfile' ? 'contained' : 'text'}
              onClick={() => setSelectedSection('flavorProfile')}
              sx={{ mb: 2 }}
            >
              Flavor Profile
            </Button>
            <Button
              fullWidth
              variant={selectedSection === 'personalInfo' ? 'contained' : 'text'}
              onClick={() => setSelectedSection('personalInfo')}
              sx={{ mb: 2 }}
            >
              Personal Information
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedSection === 'flavorProfile' ? renderFlavorProfileSection() : renderDetailSection()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountPage;
