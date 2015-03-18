export default function network($q, $log, state, telehash) {
  const NETWORK_PATH = ['network'];
  const NETWORK_CURSORS = {
    synchronized: state.synchronized.tree.select(NETWORK_PATH)
  };

  let activeSession;

  let checkSession = function checkSession(session) {
    if (session) {
      return;
    }

    throw 'network: no active session';
  };

  let initialize = function initializeNetwork(keypair) {
    let deferredSession = $q.defer();

    let telehashKeypair = {};
    if (keypair) {
      telehashKeypair.id = keypair;
    }

    telehash.init(telehashKeypair,
      function initializeTelehash(error, telehashSession) {
        if (error) {
          return deferredSession.reject(error);
        }

        return deferredSession.resolve(telehashSession);
      }
    );

    return deferredSession.promise.then((telehashSession) => {
      let sessionInfo = {
        id: telehashSession.hashname,
        keypair: telehashSession.id
      };

      activeSession = telehashSession;
      //DEBUG
      window.tocSession = activeSession;

      return sessionInfo;
    });
  };

  let handleMessage =
    function handleMessage(error, packet, channel, callback) {
      if (error) {
        return $log.error(error);
      }

      callback(true);
      channel.send();

      //FIXME: get date from packet instead
      let message = {
        id: Date.now().toString(),
        content: packet.js
      };

      let messageCursor = state.synchronized.tree
        .select(['messages']);

      //TODO: implement toast on new message arrival
      state.save(messageCursor, [message.id], message)
        .then($log.info)
        .catch($log.error);
    };
  //TODO: implement channel creation as follows:
  // direct message channel id = sorted(sender, receiver)
  // group message channel id = channelname-creatorhashname
  let listen =
    function listen(channel, handlePacket = handleMessage,
      session = activeSession) {
      try {
        checkSession(session);
        session.listen(channel.id, handlePacket);
      } catch(error) {
        return $q.reject(error);
      }

      return $q.when();
    };

  let handleAcknowledgement =
    function handleAcknowledgement(error, packet, channel, callback) {
      if (error) {
        return $log.error(error);
      }

      callback(true);

      let message = {
        id: Date.now().toString(),
        content: packet.js
      };

      let messageCursor = state.synchronized.tree
        .select(['messages']);

      state.save(messageCursor, [message.id], message)
        .then($log.info)
        .catch($log.error);
    };
  //TODO: refactor to include contact argument
  let send =
    function send(channel, payload, handlePacket = handleAcknowledgement,
      session = activeSession) {
      try {
        checkSession(session);
        session.start(
          channel.contactIds[0],
          channel.id,
          payload,
          handlePacket
        );
      } catch(error) {
        return $q.reject(error);
      }

      return $q.when();
    };

  return {
    NETWORK_CURSORS,
    listen,
    send,
    initialize
  };
}
