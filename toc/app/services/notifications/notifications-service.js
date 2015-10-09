export let serviceName = 'notifications';
export default /*@ngInject*/ function notifications(
  $cordovaBadge,
  $cordovaLocalNotification,
  $rootScope,
  $window,
  $log,
  $timeout,
  $q,
  devices,
  cryptography,
  identity,
  navigation,
  state,
  R
) {
  let contacts;
  let activeWebNotifications = {};
  // cordovaLocalNotification uses number IDs
  // notificationId is just channelId, and has the form toc-{32hex-chars}
  let getCordovaNotificationId = (notificationId) => {
    let lastEightHex = notificationId.substr(notificationId.length - 8);
    return parseInt(lastEightHex, 16);
  };

  let getNotificationMessage = function getNotificationMessage(notificationId) {
    let channelId = notificationId;
    let channelCursor = state.cloud.channels.select([channelId]);

    let notificationMessage;
    if (channelCursor.get(['inviteStatus']) === 'received') {
      return 'New invite received!';
    }

    let messageIdCursor = channelCursor.select(['latestMessageId']);
    let messageId = messageIdCursor.get();
    if (!messageId) {
      return '';
    }

    return state.cloud.messages.get([
      channelId, messageId, 'messageInfo', 'content'
    ]);
  };

  let notifyCordova = function notifyCordova(notificationInfo) {
    let channelId = notificationInfo.id;
    let channelCursor = state.cloud.channels.select([channelId]);
    let contactId = channelCursor.get(['channelInfo', 'contactIds'])[0];
    let contactCursor = state.cloud.contacts.select(contactId);
    let contactInfo = contactCursor.get('userInfo');

    let icon = identity.getAvatar(contactInfo);
    let title = contactInfo.displayName || 'Anonymous';
    let text = getNotificationMessage(notificationInfo.id);

    let cordovaNotificationInfo = {
      id: notificationInfo.cordovaNotificationId,
      title,
      text,
      icon,
      sound: 'res://platform_default',
      smallIcon: 'res://icon.png',
      data: notificationInfo
    };

    return $cordovaLocalNotification.schedule(cordovaNotificationInfo);
  };

  let notifyWeb = function notifyWeb(notificationInfo) {
    if (!$window.Notification) {
      return $q.when();
    }
    let channelId = notificationInfo.id;
    let channelCursor = state.cloud.channels.select([channelId]);
    let contactId = channelCursor.get(['channelInfo', 'contactIds'])[0];
    let contactCursor = state.cloud.contacts.select(contactId);
    let contactInfo = contactCursor.get('userInfo');

    let webNotificationOptions = {
      body: getNotificationMessage(notificationInfo.id),
      icon: identity.getAvatar(contactInfo),
      tag: notificationInfo.id
    };

    let notificationTitle = contactInfo.displayName || 'Anonymous';

    activeWebNotifications[notificationInfo.id] =
      new Notification(notificationTitle, webNotificationOptions);

    let notificationInstance = activeWebNotifications[notificationInfo.id];
    notificationInstance.addEventListener('click',
      () => handleNotificationClick(notificationInfo.id));

    // $timeout(() => {
    //   notificationInstance.close();
    // }, 5000, false);

    return $q.when();
  };

  let notify = function notify(notificationId) {
    let cordovaNotificationId = getCordovaNotificationId(notificationId);

    let notifyNative = (notificationInfo) => {
      if (devices.isInForeground()) {
        return $q.when();
      }
      // apparently, web notificaions api works in cordova for android.
      // TODO: check with iOS
      // return devices.isCordovaApp() ?
      //   notifyCordova(notificationInfo) :
      //   notifyWeb(notificationInfo);
      return notifyWeb(notificationInfo);
    };

    let notificationCursor = state.cloud.notifications.select([notificationId]);

    let notificationInfo = {
      id: notificationId,
      cordovaNotificationId
    };

    return notifyNative(notificationInfo)
      .then(() => state.save(
        notificationCursor, ['notificationInfo'], notificationInfo
      ))
      .then(() => state.save(notificationCursor, ['dismissed'], false));
  };

  let notifySystem = function notifySystem(message) {
    let systemMessageCursor = state.memory.notifications.select(['system']);

    return cryptography.getRandomBase64(2)
      .then((systemMessageId) => state.save(
        systemMessageCursor,
        ['notificationInfo'],
        { id: systemMessageId, message }
      ));
  };

  let notifyGenericError = function notifyGenericError(error) {
    $log.error(error);

    return notifySystem(
      'Something went wrong. ' +
      'Please contact the developer for further troubleshooting.'
    );
  };

  let dismissCordova = function dismissCordova(notificationInfo) {
    return $cordovaLocalNotification
      .clear(notificationInfo.cordovaNotificationId)
      // needed to avoid notifications poping up on next device startup
      .then(() => $cordovaLocalNotification
        .cancel(notificationInfo.cordovaNotificationId));
  };

  let dismissWeb = function dismissWeb(notificationInfo) {
    if (!$window.Notification) {
      return $q.when();
    }
    if (activeWebNotifications[notificationInfo.id] === undefined) {
      return $q.when();
    }

    activeWebNotifications[notificationInfo.id].close();
    return $q.when();
  };

  let dismiss = function dismiss(notificationId) {
    let cordovaNotificationId = getCordovaNotificationId(notificationId);

    if (isDismissed(notificationId)) {
      return $q.when();
    }

    let dismissNative = (notificationInfo) => {
      // return devices.isCordovaApp() ?
      //   dismissCordova(notificationInfo) :
      //   dismissWeb(notificationInfo);
      return dismissWeb(notificationInfo);
    };

    let notificationCursor = state.cloud.notifications.select([notificationId]);

    let notificationInfo = {
      id: notificationId,
      cordovaNotificationId
    };

    return dismissNative(notificationInfo)
      .then(() => state.save(notificationCursor, ['dismissed'], true));
  };

  let isDismissed = function isDismissed(notificationId) {
    return state.cloud.notifications.get([notificationId, 'dismissed']);
  };

  let handleNotificationClick = function handleNotificationClick(channelId) {
    let channelCursor = state.cloud.channels.select([channelId]);

    if (channelCursor.get(['inviteStatus'])  === 'received') {
      return contacts.showAcceptInviteDialog(channelId);
    }

    return dismiss(channelId)
      .then(() => navigation.navigate(channelId))
      .then(() => state.save(channelCursor, ['viewingLatest'], true));
  };

  $rootScope.$on('$cordovaLocalNotification:click', (event, notification) => {
    let viewId = JSON.parse(notification.data).id;

    if (viewId === 'home') {
      return navigation.navigate(viewId);
    }

    let channelId = viewId;
    return handleNotificationClick(channelId);
  });

  let initialize = function initialize(contactsService) {
    contacts = contactsService;

    if ($window.Notification) {
      $window.Notification.requestPermission();
    }

    if (devices.isCordovaApp() && $window.cordova.plugins.backgroundMode) {
      // enables background operation
      // de.appplant.cordova.plugin.background-mode required
      // $window.cordova.plugins.backgroundMode.setDefaults({ silent: true });
      $window.cordova.plugins.backgroundMode.setDefaults({
        title: 'Toc Messenger',
        ticker: 'Toc Messenger is running in background',
        text: 'Online'
      });

      $window.cordova.plugins.backgroundMode.enable();
    }

    // excluding android because it shows up as a notification instead of badge
    if (devices.isCordovaApp() && !devices.isAndroidApp() &&
      $window.cordova.plugins.notification) {
      let notificationsCursor = state.cloud.notifications;
      let updateNotificationBadge = () => {
        let notificationCount = R.pipe(
          R.values,
          R.reject(R.prop('dismissed'))
        )(notificationsCursor.get()).length;

        $cordovaBadge.get()
          .then((badgeCount) => {
            if (badgeCount === notificationCount) {
              return;
            }

            return $cordovaBadge.set(notificationCount);
          })
          .catch($log.error);
      };

      state.addListener(notificationsCursor, updateNotificationBadge, null);
    }

    return $q.when();
  };

  return {
    isDismissed,
    notify,
    notifySystem,
    notifyGenericError,
    dismiss,
    initialize
  };
}