export let serviceName = 'session';
export default /*@ngInject*/ function session(
  $q,
  $log,
  $timeout,
  $window,
  channels,
  contacts,
  devices,
  identity,
  navigation,
  network,
  R,
  state,
  status,
  storage,
  time
) {
  let start = function startSession(credentials, staySignedIn) {
    return identity.initialize(credentials, staySignedIn)
      .then(() => state.cloud.initialize())
      .then(() => network.initialize())
      .then(() => devices.initialize(destroy))
      .then(() => channels.initialize(network.listen))
      .then(() => status.initialize())
      .then(() => time.initialize())
      .then(() => navigation.initialize())
      .catch($log.error);
  };

  let initialize = function initializeSession() {
    let startSession = () => {
      let derivedCredentials =
        state.local.cryptography.get(['derivedCredentials']);

      if (!derivedCredentials) {
        return navigation.initializePublic();
      }

      return start(derivedCredentials);
    };

    return navigation.setupRedirect()
      .then(() => storage.prepare())
      .then(() => state.initialize())
      .then(() => devices.create())
      .then(() => startSession())
      .catch($log.error);
  };

  let destroy = function destroySession() {
    return state.remove(
        state.local.cryptography,
        ['derivedCredentials']
      )
      .then(() => $q.when($window.location.reload()));
  };

  return {
    start,
    initialize,
    destroy
  };
};
