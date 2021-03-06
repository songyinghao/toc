export let serviceName = 'storage';
export default /*@ngInject*/ function storage(
  $q,
  $log,
  $window,
  $timeout,
  cryptography,
  R,
  remoteStorage
) {
  //FIXME: storage overhead is rather high due to really long keys + storing
  // crypto params with each item/key
  const DEFAULT_ACCESS_LEVEL = 'rw';
  const STORAGE_MODULE_PREFIX = 'toc-state-';
  const KEY_SEPARATOR = '.';
  const SERVICES = {
    remotestorage: {
      id: 'remotestorage',
      name: 'remoteStorage',
      description: 'An open protocol for web storage',
      image: 'assets/images/remotestorage.svg'
    },
    dropbox: {
      id: 'dropbox',
      name: 'Dropbox',
      description: '(Coming soon)',
      image: 'assets/images/dropbox.svg'
    },
    googledrive: {
      id: 'googledrive',
      name: 'Google Drive',
      description: '(Coming soon)',
      image: 'assets/images/googledrive.svg'
    }
  };

  let getStorageKey = R.join(KEY_SEPARATOR);

  let connect = function connect(options) {
    switch (options.serviceId) {
      case SERVICES.remotestorage.id:
        remoteStorage.setCordovaRedirectUri('http://toc.im');
        return $q.when(remoteStorage.connect(options.email));
        break;
      case SERVICES.dropbox.id:
        return $q.when(remoteStorage.dropbox.connect());
        break;
      case SERVICES.googledrive.id:
        return $q.when(remoteStorage.googledrive.connect());
        break;
    }
  };

  let isConnected = function isConnected() {
    return remoteStorage.connected;
  };

  let prepare = function prepareStorage() {
    let remoteStorageReady =
      remoteStorage.connected === true ||
      remoteStorage.connected === false;

    if (remoteStorageReady) {
      return $q.when();
    }

    let preparingStorage = $q.defer();

    remoteStorage.on('ready',
      () => preparingStorage.resolve()
    );

    return preparingStorage.promise;
  };

  let reset = function resetStorage() {
    $window.localStorage.clear();

    let openingDb = $q.defer();

    let openDbRequest = $window.indexedDB.open('remotestorage');

    openDbRequest.onerror = (dbEvent) => {
      openingDb.reject(dbEvent.target.errorCode);
    };

    openDbRequest.onsuccess = (dbEvent) => {
      openingDb.resolve(dbEvent.target.result);
    };

    return openingDb.promise
      .then((db) => {
        let clearingDb = $q.defer();
        let clearDbRequest = db.transaction(["nodes"], 'readwrite')
          .objectStore("nodes").clear();

        clearDbRequest.onerror = (dbEvent) => {
          clearingDb.reject(dbEvent.target.errorCode);
        };

        clearDbRequest.onsuccess = (dbEvent) => {
          clearingDb.resolve(dbEvent.target.result);
        };

        return clearingDb.promise;
      })
      // add timeout 0 to let queued operations complete
      .then(() => $timeout(() => {
          $window.location.reload();
        }, 0, false
      ));
  };

  let enableLogging = remoteStorage.enableLog;

  let enableCaching = function enableCaching(moduleName) {
    remoteStorage.caching
      .enable(`/${STORAGE_MODULE_PREFIX + moduleName}/`);
  };

  let claimAccess =
    function claimAccess(moduleName, accessLevel = DEFAULT_ACCESS_LEVEL) {
      remoteStorage.access
        .claim(`${STORAGE_MODULE_PREFIX + moduleName}`, accessLevel);
    };

  let buildModule = function buildModule(privateClient) {
    privateClient.declareType(
      cryptography.ENCRYPTED_OBJECT.name,
      cryptography.ENCRYPTED_OBJECT.schema
    );

    let storeObject = function storeObject(key, object) {
      $log.debug(`Cloud: Saving object ${JSON.stringify(object)} at ${key}`);

      let encryptedObject = cryptography.encrypt(object);
      let encryptedKey = cryptography.escapeBase64(
        JSON.stringify(cryptography.encryptDeterministic(key))
      );

      return $q.when(privateClient.storeObject(
        cryptography.ENCRYPTED_OBJECT.name,
        encryptedKey,
        encryptedObject
      )).then(() => object);
    };

    let getObject = function getObject(key) {
      let encryptedKey = cryptography.escapeBase64(
        JSON.stringify(cryptography.encryptDeterministic(key))
      );

      return $q.when(privateClient.getObject(encryptedKey, false))
        .then(cryptography.decrypt);
    };

    let removeObject = function removeObject(key) {
      $log.debug(`Cloud: Removing object at ${key}`);
      let encryptedKey = cryptography.escapeBase64(
        JSON.stringify(cryptography.encryptDeterministic(key))
      );

      return $q.when(privateClient.remove(encryptedKey))
        .then(() => key);
    };

    let getAllObjects = function getAllObjects() {
      //all encrypted paths are under root
      let key = '';

      return $q.when(privateClient.getAll(key, false))
        .then((encryptedKeyObjectMap) => {
          let decryptedKeyObjectPairs = R.pipe(
            R.toPairs,
            R.reject((encryptedKeyObjectPair) =>
              encryptedKeyObjectPair[1] === true
            ),
            R.map(encryptedKeyObjectPair => {
              let decryptedKeyObjectPair;

              try {
                decryptedKeyObjectPair = [
                  cryptography.decrypt(
                    JSON.parse(cryptography.unescapeBase64(encryptedKeyObjectPair[0]))
                  ),
                  cryptography.decrypt(encryptedKeyObjectPair[1])
                ];
              }
              catch (error) {
                // Assuming failed decryption indicates data belonging to
                // a different account and filter out
                if (error.message === 'cryptography: decryption failed') {
                  return;
                }

                throw new Error(error);
                return;
              }

              return decryptedKeyObjectPair;
            }),
            R.filter((keyObjectPair) => keyObjectPair !== undefined)
          )(encryptedKeyObjectMap);

          return decryptedKeyObjectPairs;
        });
    };

    let removeAllObjects = function removeAllObjects() {
      let key = '';

      return $q.when(privateClient.getAll(key, false))
        .then((encryptedKeyObjectMap) => {
          let removingObjects = R.pipe(
            R.keys,
            R.map((encryptedKey) => $q.when(privateClient.remove(encryptedKey)))
          )(encryptedKeyObjectMap);

          return removingObjects;
        });
    };

    let onChange = function onChange(handleChange) {
      privateClient.on('change', function handleStorageChange(event) {
        // no need to handle local change events fired on startup
        // we're already loading data manually in state service initialization
        if (!cryptography.isInitialized() || event.origin === 'local') {
          return;
        }

        try {
          event.relativePath = event.relativePath ?
            cryptography.decrypt(
              JSON.parse(cryptography.unescapeBase64(event.relativePath))
            ) :
            event.relativePath;

          event.newValue = event.newValue ?
            cryptography.decrypt(event.newValue) :
            event.newValue;

          event.oldValue = event.oldValue ?
            cryptography.decrypt(event.oldValue) :
            event.oldValue;

          $log.debug(`Cloud: Received object ${JSON.stringify(event.newValue)} at ${event.relativePath}`);

          handleChange(event);
        }
        catch (error) {
          throw new Error(error);
          return;
        }
      });
    };

    let initialize = function initialize() {
      privateClient.cache('');
      remoteStorage.setApiKeys('dropbox', { appKey: 'j95l4gw6vc02csa' });
      remoteStorage.setApiKeys('googledrive', {
        clientId: ' 993124685715-l90kf80r8dgu5a1h89jul1efe25lsm2k.apps.googleusercontent.com '
      });
    };

    return {
      exports: {
        storeObject,
        getObject,
        removeObject,
        getAllObjects,
        removeAllObjects,
        onChange,
        initialize
      }
    };
  };

  let buildModuleUnencrypted = function buildModuleUnencrypted(privateClient) {
    privateClient.declareType(
      cryptography.UNENCRYPTED_OBJECT.name,
      cryptography.UNENCRYPTED_OBJECT.schema
    );

    let storeObject = function storeObject(key, object) {
      $log.debug(`CloudUnencrypted: Saving object ${JSON.stringify(object)} at ${key}`);

      let unencryptedObject = {
        pt: JSON.stringify(object)
      };

      return $q.when(privateClient.storeObject(
          cryptography.UNENCRYPTED_OBJECT.name,
          key,
          unencryptedObject
        ))
        .then(() => object);
    };

    let getObject = function getObject(key) {
      return $q.when(privateClient.getObject(key, false))
        .then(unencryptedObject => JSON.parse(unencryptedObject.pt));
    };

    let removeObject = function removeObject(key) {
      $log.debug(`CloudUnencrypted: Removing object at ${key}`);

      return $q.when(privateClient.remove(key))
        .then(() => key);
    };

    let getAllObjects = function getAllObjects() {
      //all encrypted paths are under root
      let key = '';

      return $q.when(privateClient.getAll(key, false))
        .then((keyObjectMap) => {
          let keyObjectPairs = R.pipe(
            R.toPairs,
            R.map(keyObjectPair => [
              keyObjectPair[0],
              JSON.parse(keyObjectPair[1].pt)
            ])
          )(keyObjectMap);

          return keyObjectPairs;
        });
    };

    let removeAllObjects = function removeAllObjects() {
      let key = '';

      return $q.when(privateClient.getAll(key, false))
        .then((keyObjectMap) => {
          let removingObjects = R.pipe(
            R.keys,
            R.map((key) => $q.when(privateClient.remove(key)))
          )(keyObjectMap);

          return removingObjects;
        });
    };

    let onChange = function onChange(handleChange) {
      privateClient.on('change', function handleStorageChange(event) {
        // no need to handle local change events fired on startup
        // we're already loading data manually in state service initialization
        if (event.origin === 'local') {
          return;
        }

        event.newValue = event.newValue ?
          JSON.parse(event.newValue.pt) :
          event.newValue;

        event.oldValue = event.oldValue ?
          JSON.parse(event.oldValue.pt) :
          event.oldValue;

        $log.debug(`CloudUnencrypted: Received object ${JSON.stringify(event.newValue)} at ${event.relativePath}`);

        handleChange(event);
      });
    };

    let initialize = function initialize() {
      privateClient.cache('');
    };

    return {
      exports: {
        storeObject,
        getObject,
        removeObject,
        getAllObjects,
        removeAllObjects,
        onChange,
        initialize
      }
    };
  };

  let createLocal = function createLocal(moduleName = 'local') {
    const KEY_PREFIX = STORAGE_MODULE_PREFIX + moduleName + KEY_SEPARATOR;

    let getObject = function getObjectLocal(key) {
      let object = JSON.parse($window.localStorage.getItem(KEY_PREFIX + key));
      return $q.when(object);
    };

    let getObjectSync = function getObjectSyncLocal(key) {
      return JSON.parse($window.localStorage.getItem(KEY_PREFIX + key));
    };

    let removeObject = function removeObjectLocal(key) {
      $log.debug(`Local: Removing object at ${key}`);
      $window.localStorage.removeItem(KEY_PREFIX + key);
      return $q.when(key);
    };

    let getAllObjects = function getAllObjectsLocal() {
      let objects = R.pipe(
        R.keys,
        R.filter(key => key.indexOf(KEY_PREFIX) === 0),
        R.map(key => [
          key.substr(KEY_PREFIX.length),
          getObjectSync(key.substr(KEY_PREFIX.length))
        ])
      )($window.localStorage);

      return $q.when(objects);
    };

    let removeAllObjects = function removeAllObjectsLocal() {
      let objects = R.pipe(
        R.keys,
        R.filter(key => key.indexOf(KEY_PREFIX) === 0),
        R.map((key) => $window.localStorage.removeItem(key))
      )($window.localStorage);

      return $q.when(objects);
    };

    let storeObject = function storeObjectLocal(key, object) {
      $log.debug(`Local: Saving object ${JSON.stringify(object)} at ${key}`);
      $window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(object));
      return $q.when(object);
    };

    let storeObjectSync = function storeObjectLocalSync(key, object) {
      $log.debug(`Local: Saving object ${JSON.stringify(object)} at ${key}`);
      $window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(object));
      return object;
    };

    return {
      getObject,
      getObjectSync,
      removeObject,
      getAllObjects,
      removeAllObjects,
      storeObject,
      storeObjectSync
    };
  };

  let createCloud = function createCloud(moduleName = 'cloud') {
    remoteStorage
      .defineModule(STORAGE_MODULE_PREFIX + moduleName, buildModule);

    return remoteStorage[STORAGE_MODULE_PREFIX + moduleName];
  };

  let createCloudUnencrypted =
    function createCloudUnencrypted(moduleName = 'cloud-unencrypted') {
      remoteStorage.defineModule(
        STORAGE_MODULE_PREFIX + moduleName,
        buildModuleUnencrypted
      );

      return remoteStorage[STORAGE_MODULE_PREFIX + moduleName];
    };

  let storageService = {
    KEY_SEPARATOR,
    SERVICES,
    enableLogging,
    prepare,
    getStorageKey,
    connect,
    isConnected,
    claimAccess,
    createLocal,
    createCloud,
    createCloudUnencrypted
  };

  let initialize = function initialize() {
    enableLogging();

    storageService.local = createLocal();
    storageService.cloud = createCloud();
    storageService.cloud.initialize();
    storageService.cloudUnencrypted = createCloudUnencrypted();
    storageService.cloudUnencrypted.initialize();

    claimAccess('cloud');
    enableCaching('cloud');
    claimAccess('cloud-unencrypted');
    enableCaching('cloud-unencrypted');
  };

  storageService.initialize = initialize;

  let destroy = function destroy() {
    return reset();
  };

  storageService.destroy = destroy;

  return storageService;
}
