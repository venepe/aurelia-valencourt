import configureStore from './configureStore';

let store;

export function initStore() {
	store =  configureStore();
  return store;
}

export function getStore() {
  return store;
}

export default {};
