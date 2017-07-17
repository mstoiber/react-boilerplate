/**
 * Gets the repositories of the user from Github
 */

import { take, call, put, select, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { LOAD_BOUNTY } from '../../../bounty/containers/App/constants';
import { bountyLoaded, bountyLoadError } from '../../../bounty/containers/App/actions';

import request from '../../../bounty/utils/request';
import { makeSelectUserEmail } from '../../../bounty/containers/HomePage/selectors';

/**
 * Github repos request/response handler
 */
export function* getBounty() {
  // Select username from store
  const useremail = yield select(makeSelectUserEmail());
  console.log('getBounty.useremail:', useremail);
  const requestURL = `http://bounty.brickblock.dmx/check/${useremail}`;
  console.log('getBounty.requestURL:', requestURL);

  try {
    const data = yield call(request, requestURL);
    yield put(bountyLoaded(data));
  } catch (err) {
    yield put(bountyLoadError(err));
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export function* bountyData() {
  // Watches for LOAD_BOUNTY actions and calls getBounty when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  const watcher = yield takeLatest(LOAD_BOUNTY, getBounty);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

// Bootstrap sagas
export default [
  bountyData,
];
