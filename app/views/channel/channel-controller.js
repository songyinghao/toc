export default function ChannelController($q, $stateParams, state, contacts,
  network, notification) {
  this.channelId = $stateParams.channelId;

  let channelCursor = network.NETWORK_CURSORS.synchronized
    .select('channels');

  let contactCursor = contacts.CONTACTS_CURSORS.synchronized;

  this.contact = contactCursor.get(
    channelCursor.get([this.channelId, 'channelInfo', 'contactIds'])[0]
  );

  this.title = this.contact.userInfo.displayName;

  this.message = '';
  this.send = () => {
    let recursivelySendMessage = () => {
      return network.sendMessage(
          channelCursor.get([this.channelId, 'channelInfo']),
          this.message
        )
        .catch((error) => {
          if (error !== 'timeout') {
            return $q.reject(error);
          }

          return recursivelySendMessage();
        });
    };
    this.sending = recursivelySendMessage()
      .then(() => {
        this.message = '';
        return $q.when();
      })
      .catch((error) => notification.error(error, 'Message Delivery Error'));

    return this.sending;
  };

  contactCursor.on('change', () => {
    this.contact = contactCursor.get(
      channelCursor.get([this.channelId, 'channelInfo', 'contactIds'])[0]
    );
  });
}
