import STORAGE_CONSTANTS from 'services/storage/storage-constants';

import declareContactType from './storage-types/contact-type';
import declareEndpointType from './storage-types/endpoint-type';

let contactsModel = {
  name: 'contacts',
  accessLevel: STORAGE_CONSTANTS.ACCESS_LEVELS.FULL,
  builder: function buildContactsModel(privateClient) {
    declareContactType(privateClient);
    declareEndpointType(privateClient);

    privateClient.declareType('contactStatusId', {
      'description': 'contact status',
      'type': 'number'
    });

    privateClient.declareType('contactActiveEndpointId', {
      'description': 'the currently active telehash hashname',
      'type': 'string'
    });

    let defineContactsFunctions =
      function defineContactsFunctions(privateClient) {
        let contactsFunctions = {};

        contactsFunctions.putContactInfo =
          function putContactInfo(contact) {
            return privateClient
              .storeObject('contact', contact.id + '/' + 'info', contact);
          };

        contactsFunctions.getContactInfo =
          function getContactInfo(contactId) {
            return privateClient.getObject(contactId + '/' + 'info');
          };

        contactsFunctions.getAllContacts = function getAllContacts() {
          return privateClient.getAll('');
        };

        return contactsFunctions;
      };

    return {
      exports: defineContactsFunctions(privateClient)
    };
  }
};

export default contactsModel;
