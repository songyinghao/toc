import template from './options-menu.html!text';

export let directiveName = 'tocOptionsMenu';
export default /*@ngInject*/ function tocOptionsMenu() {
  return {
    restrict: 'E',
    template: template,
    controllerAs: 'optionsMenu',
    controller: /*@ngInject*/ function OptionsMenuController(
      $ionicPopup,
      $scope,
      navigation,
      session,
      storage,
      state
    ) {
      this.openWindow = navigation.openWindow;
      this.isStorageConnected = storage.isConnected;

      session.preparePrivate().then(() => {
        this.userInfo = state.cloud.identity.get().userInfo;
        this.userId = this.userInfo.id;
      });

      this.showAboutModal = () => {
        let modalTemplate = `
          <toc-about-toc-modal class="toc-modal-container"
            remove-modal="optionsMenu.aboutTocModal.remove()">
          </toc-about-toc-modal>
        `;

        let modalName = 'aboutTocModal';

        return navigation.showModal(modalName, modalTemplate, this, $scope);
      };

      this.showIdPopup = () => {
        $ionicPopup.show({
          title: 'Your ID',
          cssClass: 'toc-id-popup',
          scope: $scope,
          buttons: [{
            text: 'Done',
            type: 'button-positive button-block'
          }],
          template: `<toc-id-display></toc-id-display>`
        });
      };

      this.showBeginConversationModal = function showBeginConversationModal() {
        let modalTemplate = `
          <toc-begin-conversation-modal class="toc-modal-container"
            remove-modal="optionsMenu.beginConversationModal.remove()">
          </toc-begin-conversation-modal>
        `;

        let modalName = 'beginConversationModal';

        return navigation.showModal(modalName, modalTemplate, this, $scope);
      };

      this.showCloudConnectModal = function showCloudConnectModal() {
        let modalTemplate = `
          <toc-cloud-connect-modal class="toc-modal-container"
            remove-modal="optionsMenu.cloudConnectModal.remove()">
          </toc-cloud-connect-modal>
        `;

        let modalName = 'cloudConnectModal';

        return navigation.showModal(modalName, modalTemplate, this, $scope);
      };

      this.showCloudDisconnectConfirm = function showCloudDisconnectConfirm() {
        let disconnectProfilePopup = $ionicPopup.confirm({
          title: 'Disconnect Profile',
          template: `
            <p>Your profile will be removed from this device.</p>
            <p>Are you sure?</p>
          `,
          okText: 'Disconnect',
          okType: 'button-assertive button-block',
          cancelType: 'button-positive button-block button-outline'
        });

        disconnectProfilePopup.then((response) => {
          if (!response) {
            return;
          }

          return state.destroy();
        });
      };

      this.showDeleteDataConfirm = function showDeleteDataConfirm() {
        let deleteDataPopup = $ionicPopup.confirm({
          title: 'Clear Data',
          template: `
            <p>All local data will be gone.</p>
            <p>Are you absolutely sure?</p>
          `,
          okText: 'Clear',
          okType: 'button-assertive button-block',
          cancelType: 'button-positive button-block button-outline'
        });

        deleteDataPopup.then((response) => {
          if (!response) {
            return;
          }

          return state.destroy();
        });
      };

      this.showSignoutConfirm = function showSignoutConfirm() {
        let signoutPopup = $ionicPopup.confirm({
          title: 'Sign Out',
          template: `
            <p>You'll have to sign in again.</p>
            <p>Are you sure?</p>
          `,
          okText: 'Sign out',
          okType: 'button-assertive button-block',
          cancelType: 'button-positive button-block button-outline'
        });

        signoutPopup.then((response) => {
          if (!response) {
            return;
          }

          return session.destroy();
        });
      };
    }
  };
}
