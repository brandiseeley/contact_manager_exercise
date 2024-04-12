import { ContactManager } from './contact_manager.js';

const Templater = (function() {
  let contactTemplate;

  function contact(object) {
    if (contactTemplate) return contactTemplate(object);

    let html = document.querySelector('#contactTemplate').innerHTML;
    contactTemplate = Handlebars.compile(html);
    return contactTemplate(object);
  }

  return {
    contact,
  };
})();

// Orchestrates between Contact Manager and Templater
const DOM = (function() {
  // TODO: Badly named. renderContacts fetches and renders
  //       renderContact takes existing data.
  //       Fetch data in main and send it to renderContacts.
  //       DOM shouldn't be async
  async function renderContacts() {
    let contacts = await ContactManager.allContacts();

    // TODO: Use handlebars partial instead of looping through contacts.
    let contactDiv = document.querySelector('#contacts');
    contactDiv.innerHTML = '';
    contacts.forEach(contact => {
      let html = Templater.contact(contact);
      contactDiv.insertAdjacentHTML('beforeend', html);
    });
  }

  function parseForm(form) {
    let object = {};

    for (let element of form.elements) {
      if (element.type !== 'submit' && element.type !== 'reset') {
        object[element.name] = element.value;
      }
    }
    return object;
  }

  return {
    renderContacts,
    parseForm,
  };
})();

const Handlers = (function() {
  // Private
  function contactId(contactDiv) {
    return contactDiv.dataset.id;
  }

  function showEditContactForm() {
    document.querySelector('h2.contactForm').textContent = 'Edit Contact';
    document.querySelector('#contactFormWrapper').style.display = 'block';

  }

  function displayEditContact(contactDiv) {
    let editForm = document.querySelector('#contactForm');
    let name = contactDiv.querySelector('.full_name').textContent;
    let phone = contactDiv.querySelector('span.phone_number').textContent;
    let email = contactDiv.querySelector('span.email').textContent;
    let id = contactDiv.dataset.id;
    editForm.querySelector('.full_name').value = name;
    editForm.querySelector('.phone_number').value = phone;
    editForm.querySelector('.email').value = email;
    editForm.querySelector('#editId').setAttribute('value', id);
    showEditContactForm();
  }

  // Public
  async function addOrEditContact(event) {
    event.preventDefault();
    let form = document.querySelector('#contactForm');
    let contactData = DOM.parseForm(form);

    // TODO: Do we need to capture the response anymore?
    let newContactData = await ContactManager.addOrEditContact(contactData);

    // TODO: Rerender all contacts any time we update or delete
    //       Too complicated to add and update dynamically

    DOM.renderContacts();
    form.reset();
    hideContactForm();
  }

  function editOrDelete(event) {
    if (event.target.tagName !== 'BUTTON') return;
    let contactDiv = event.target.closest('div');
    let id = contactId(contactDiv);
    if (event.target.className === 'delete') {
      ContactManager.deleteContact(id);
      contactDiv.remove();
    } else {
      displayEditContact(contactDiv);
    }
  }

  function showAddContactForm() {
    document.querySelector('#contactForm').reset();
    document.querySelector('#editId').setAttribute('value', '');
    document.querySelector('h2.contactForm').textContent = 'Create Contact';
    document.querySelector('#contactFormWrapper').style.display = 'block';
  }

  function hideContactForm() {
    document.querySelector('#contactFormWrapper').style.display = 'none';
    document.querySelector('h2.contactForm').textContent = '';
  }

  return {
    addOrEditContact,
    editOrDelete,
    showAddContactForm,
    hideContactForm,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  let newContactForm = document.querySelector('#contactForm');
  let contacts = document.querySelector('#contacts');
  let addContactButton = document.querySelector('#add');
  let cancelButton = document.querySelector('#cancel');

  DOM.renderContacts();

  newContactForm.addEventListener('submit', Handlers.addOrEditContact);
  contacts.addEventListener('click', Handlers.editOrDelete);
  addContactButton.addEventListener('click', Handlers.showAddContactForm);
  cancelButton.addEventListener('click', Handlers.hideContactForm);
});
