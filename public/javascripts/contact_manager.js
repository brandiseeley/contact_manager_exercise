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
    let response = await fetch(DOMAIN + '/api/contacts/', requestObject);
    let json = await response.json();
    return json;
  }

  async function editContact(data) {
    let requestObject = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    let response = await fetch(DOMAIN + '/api/contacts/' + data.id, requestObject);
    // TODO: Error handling and response
  }

  // Public
  // Returns promises?
  return {
    async allContacts() {
      let response = await fetch('http://localhost:3000/api/contacts');
      let json = await response.json();
      return json;
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

      fetch(DOMAIN + '/api/contacts/' + id, requestObject);
    }
  };
})();

export { ContactManager };