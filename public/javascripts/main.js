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
    contacts.forEach(contact => {
      let html = Templater.contact(contact);
      contactDiv.insertAdjacentHTML('beforeend', html);
    });
  }

  // TODO: Should we add to the end, or rerender
  //       to properly sort contacts?
  function renderContact(contact) {
    let html = Templater.contact(contact);
    let contactDiv = document.querySelector('#contacts');
    contactDiv.insertAdjacentHTML('beforeend', html);
  }

  function parseForm(form) {
    let object = {};

    for (let element of form.elements) {
      console.log(element);
      if (element.type !== 'submit' && element.type !== 'reset') {
        object[element.name] = element.value;
      }
    }
    return object;
  }

  return {
    renderContacts,
    renderContact,
    parseForm,
  };
})();

const Handlers = (function() {
  // Private
  function contactId(contactDiv) {
    return contactDiv.dataset.id;
  }

  function hideContactForm() {
    document.querySelector('#contactFormWrapper').style.display = 'none';
    document.querySelector('#h2.contactForm').textContent = '';
  }

  // Public
  async function newContact(event) {
    event.preventDefault();
    let form = document.querySelector('#contactForm');
    let newContactData = DOM.parseForm(form);
    console.log(newContactData);
    let addedContactData = await ContactManager.addContact(newContactData);
    DOM.renderContact(addedContactData);
    form.reset();
    hideContactForm();
  }

  function editOrDelete(event) {
    if (event.target.tagName !== 'BUTTON') return;
    let contactDiv = event.target.closest('div');
    let id = contactId(contactDiv);
    if (event.target.className === 'delete') {
      console.log('deleting');
      ContactManager.deleteContact(id);
      contactDiv.remove();
    }
  }

  function showAddContactForm(event) {
    document.querySelector('h2.contactForm').textContent = 'Create Contact';
    document.querySelector('#contactFormWrapper').style.display = 'block';
  }

  return {
    newContact,
    editOrDelete,
    showAddContactForm,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  let newContactForm = document.querySelector('#contactForm');
  let contacts = document.querySelector('#contacts');
  let addContactButton = document.querySelector('#add');

  DOM.renderContacts();

  newContactForm.addEventListener('submit', Handlers.newContact);
  contacts.addEventListener('click', Handlers.editOrDelete);
  addContactButton.addEventListener('click', Handlers.showAddContactForm);

});
