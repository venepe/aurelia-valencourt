import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import callToActionReducer from './reducers/callToActionSlice';
import conversationHistoryReducer from './reducers/conversationHistorySlice';
import searchReducer from './reducers/searchSlice';
import textChatReducer from './reducers/textChatSlice';
import unitsOfMeasureSliceReducer from './reducers/unitsOfMeasureSlice';
import webpReducer from './reducers/webpSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  callToAction: callToActionReducer,
  conversationHistory: conversationHistoryReducer,
  search: searchReducer,
  unitsOfMeasure: unitsOfMeasureSliceReducer,
  textChat: textChatReducer,
  webp: webpReducer,
});

export default rootReducer;
