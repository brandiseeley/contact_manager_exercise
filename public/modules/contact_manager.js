import { Utility } from './utilities.js';

let ContactManager = (function() {
  const DOMAIN = 'http://localhost:3000';

  async function addContact(data) {
    let requestObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    try {
      let response = await fetch(DOMAIN + '/api/contacts/', requestObject);
      if (response.status === 201) {
        return {success: true, message: 'Successfully added contact.'};
      } else {
        return {success: false, message: 'Unable to add contact.'};
      }
    } catch (error) {
      alert(error);
      return {success: false, message: 'Something went wrong.'};
    }
  }

  async function editContact(data) {
    let requestObject = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    try {
      let response = await fetch(DOMAIN + '/api/contacts/' + data.id, requestObject);
      if (response.status === 201) {
        return {success: true, message: 'Contact successfully updated'};
      } else {
        return {success: false, message: "Couldn't update contact"};
      }
    } catch (error) {
      alert(error);
      return {success: false, message: "Something went wrong"};
    }
  }

  // Public
  return {
    contacts(activeTags) {
      if (activeTags.length === 0) {
        return this.allContacts();
      }

      return this.allContactsWithTags(activeTags);
    },

    async allContacts() {
      try {
        let response = await fetch('http://localhost:3000/api/contacts');
        let json = await response.json();
        json.forEach(contact => {
          if (contact.tags) {
            contact.tags = contact.tags.split(',').map(str => str.trim());
          }
        });
        return json;
      } catch (error) {
        alert(error);
      }
    },

    addOrEditContact(contactData) {
      if (contactData.id === '') {
        delete contactData.id;
        return addContact(contactData);
      } else {
        return editContact(contactData);
      }
    },

    async deleteContact(id) {
      let requestObject = {
        method: 'DELETE',
      };

      try {
        let response = await fetch(DOMAIN + '/api/contacts/' + id, requestObject);
        if (response.status === 204) {
          return {success: true, message: 'Successfully deleted contact'};
        } else {
          return {success: false, message: "Couldn't delete contact"};
        }
      } catch (error) {
        alert(error);
        return {sucess: false, message: "Something went wrong"};
      }
    },

    async allContactsWithTags(tags) {
      let contacts = await this.allContacts();
      for (let tag of tags) {
        if (contacts.length === 0) return contacts;
        contacts = contacts.filter(contact => {
          if (!contact.tags) return false;
          return Utility.caseFreeIncludes(contact.tags, tag);
        });
      }
      return contacts;
    },

    async allContactsMatchingSearch(text) {
      let contacts = await this.allContacts();
      let filteredContacts = contacts.filter(contact => {
        return contact.full_name.slice(0, text.length).toLowerCase()
               === text.toLowerCase();
      });
      return filteredContacts;
    }
  };
})();

export { ContactManager };