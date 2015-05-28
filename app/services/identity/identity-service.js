export default function identity($q, state, R, cryptography) {
  let create = function createIdentity(sessionInfo, userInfo, options) {
    let userCredentials = {
      id: sessionInfo.id,
      password: userInfo.password
    };

    let newUserInfo = {
      id: sessionInfo.id,
      displayName: userInfo.displayName,
      email: userInfo.email
    };

    let savedCredentials;

    try {
      savedCredentials = cryptography.initialize(userCredentials);
      newUserInfo.challenge = cryptography.encrypt(userCredentials.id);
      cryptography.decrypt(newUserInfo.challenge);
    } catch(error) {
      cryptography.destroy();
      return $q.reject(error);
    }

    if (options.staySignedIn) {
      state.save(
        state.local.cursors.identity,
        ['savedCredentials'],
        savedCredentials
      );
    }

    return $q.when(newUserInfo);
  };

  let authenticate = function authenticateIdentity(userCredentials, options) {
    let challenge = state.local.cursors.identity
      .get(['userInfo']).challenge;

    let savedCredentials;

    try {
      savedCredentials = cryptography.initialize(userCredentials);
      cryptography.decrypt(challenge);
    }
    catch(error) {
      cryptography.destroy();
      return $q.reject('identity: wrong password');
    }

    if (options.staySignedIn) {
      state.save(
        state.local.cursors.identity,
        ['savedCredentials'],
        savedCredentials
      );
    }

    return $q.when(userCredentials);
  };

  let restore = function restoreIdentity(rememberedUser) {
    try {
      cryptography.restore(rememberedUser.savedCredentials);
      cryptography.decrypt(rememberedUser.userInfo.challenge);
    }
    catch(error) {
      cryptography.destroy();
      return $q.reject('identity: wrong saved credentials');
    }

    return $q.when(rememberedUser.userInfo);
  };

  let initialize = function initializeIdentity(userId) {
    state.initializeCursors(userId);

    return state.save(
      state.memory.cursors.identity,
      ['currentUser'],
      userId
    );
  };

  let destroy = function destroyIdentity() {
    state.destroyCursors();

    return state.remove(
      state.memory.cursors.identity,
      ['currentUser']
    );
  };

  return {
    create,
    authenticate,
    restore,
    initialize,
    destroy
  };
}
