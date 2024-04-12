let ContactManager = (function() {
  const DOMAIN = 'http://localhost:3000'
  // Private

  // Public
  // Returns promises?
  return {
    async allContacts() {
      let response = await fetch('http://localhost:3000/api/contacts');
      let json = await response.json();
      return json;
    },

    async addContact(data) {
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