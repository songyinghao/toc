import angular from 'angular';

// import contacts from './contacts/contacts';
import contacts from './contacts/contacts';
import channels from './channels/channels';
import identity from './identity/identity';
import network from './network/network';
import storage from './storage/storage';
import cryptography from './cryptography/cryptography';
import state from './state/state';
import time from './time/time';

export default angular.module('toc.services', [
  // contacts.name,
  contacts.name,
  channels.name,
  identity.name,
  network.name,
  storage.name,
  cryptography.name,
  state.name,
  time.name
]);
