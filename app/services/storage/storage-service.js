export default function storage($window, $q, remoteStorage, cryptography, R) {
  const DEFAULT_ACCESS_LEVEL = 'rw';
  const KEY_SEPARATOR = '.';

  let getStorageKey = R.join(KEY_SEPARATOR);

  let local = {

  };

  // let connect = remoteStorage.remoteStorage.connect;

  let enableLog = remoteStorage.remoteStorage.enableLog;

  let claimAccess =
    function claimAccess(moduleName, accessLevel = DEFAULT_ACCESS_LEVEL) {
      remoteStorage.remoteStorage.access.claim(moduleName, accessLevel);
    };

  let buildModule = function buildModule(privateClient) {
    privateClient.declareType(
      cryptography.ENCRYPTED_OBJECT.name,
      cryptography.ENCRYPTED_OBJECT.schema
    );

    let storeObject = function storeObject(key, object) {
      let encryptedObject = cryptography.encrypt(object);
      let encryptedKey = cryptography.encryptDeterministic(key).ct;

      return $q.when(privateClient.storeObject(
        cryptography.ENCRYPTED_OBJECT.name,
        encryptedKey,
        encryptedObject
      )).then(() => object);
    };

    let getObject = function getObject(key) {
      let encryptedKey = cryptography.encryptDeterministic(key).ct;

      return $q.when(privateClient.getObject(encryptedKey))
        .then(cryptography.decrypt);
    };

    let getAllObjects = function getAllObjects() {
      //all encrypted paths are under root
      let key = '';

      return privateClient.getAll(key)
        .then(encryptedObjects => R.pipe(
          R.toPairs,
          R.map(encryptedKeyObjectPair => [
            cryptography.decrypt(encryptedKeyObjectPair[0]),
            cryptography.decrypt(encryptedKeyObjectPair[1])
          ])
        )(encryptedObjects));
    };

    let onChange = function onChange(handleChange) {
      privateClient.on('change', function handleStorageChange(event) {
        let decryptedEvent = Object.assign({}, event);

        decryptedEvent.relativePath = event.relativePath ?
          cryptography.decrypt(event.relativePath) :
          event.relativePath;

        decryptedEvent.newValue = event.newValue ?
          cryptography.decrypt(event.newValue) :
          event.newValue;

        decryptedEvent.oldValue = event.oldValue ?
          cryptography.decrypt(event.oldValue) :
          event.oldValue;

        handleChange(decryptedEvent);
      });
    };

    return {
      exports: {
        storeObject,
        getObject,
        getAllObjects,
        onChange
      }
    };
  };

  let createLocal = function createLocal(moduleName = '') {
    const KEY_PREFIX = moduleName ? moduleName + KEY_SEPARATOR : moduleName;

    let getObject = function getObjectLocal(key) {
      let object = JSON.parse($window.localStorage.getItem(KEY_PREFIX + key));
      return $q.when(object);
    };

    let getObjectSync = function getObjectSyncLocal(key) {
      return JSON.parse($window.localStorage.getItem(KEY_PREFIX + key));
    };

    let storeObject = function storeObjectLocal(key, object) {
      $window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(object));
      return $q.when(object);
    };

    let storeObjectSync = function storeObjectLocalSync(key, object) {
      $window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(object));
      return object;
    };

    let getAllObjects = function getAllObjects() {
      R.map(key =>
        [key, getObjectSync(key)]
      )(Object.keys($window.localStorage));
    };

    return remoteStorage.remoteStorage[moduleName];
  };

  let createRemote = function createRemote(moduleName) {
    remoteStorage.RemoteStorage.defineModule(moduleName, buildModule);

    return remoteStorage.remoteStorage[moduleName];
  };

  let initialize = function initialize() {
    // enableLog();
  };

  return {
    KEY_SEPARATOR,
    getStorageKey,
    claimAccess,
    createLocal,
    createRemote,
    initialize
  };
}
