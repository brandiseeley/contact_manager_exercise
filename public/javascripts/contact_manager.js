let ContactManager = (function() {
  const DOMAIN = 'http://localhost:3000'
  // Private
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
      let json = await response.json();
      console.log('Add Contact Response: ', json);
      return json;
    } catch (error) {
      alert(error);
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
      let json = await response.json();
      console.log('Edit Contact Response: ', json);
    } catch (error) {
      alert(error);
    }
  }

  // Public
  return {
    async allContacts() {
      try {
        let response = await fetch('http://localhost:3000/api/contacts');
        let json = await response.json();
        console.log(json);
        json.forEach(contact => {
          contact.tags = contact.tags.split(',').map(str => str.trim());
        });
        return json;
      } catch (error) {
        alert(error);
      }
    },

    addOrEditContact(contactData) {
      if (contactData.id === '') {
        delete contactData.id;
        addContact(contactData);
      } else {
        editContact(contactData);
      }
    },

    deleteContact(id) {
      let requestObject = {
        method: 'DELETE',
      };

      try {
        fetch(DOMAIN + '/api/contacts/' + id, requestObject);
      } catch (error) {
        alert(error);
      }
    },

    async allContactsWithTag(tag) {
      let contacts = await this.allContacts();
      let filteredContacts = contacts.filter(contact => {
        let tags = contact.tags.split(',').map(str => str.trim());
        return tags.includes(tag);
      });
      return filteredContacts;
    },
  };
})();

export { ContactManager };