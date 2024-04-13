/* eslint-disable indent */
import { ContactManager } from './contact_manager.js';

const Templater = (function() {
  let contactTemplate;
  let contactSectionTemplate;

  function contact(object) {
    if (contactTemplate) return contactTemplate(object);

    let html = document.querySelector('#contactTemplate').innerHTML;
    contactTemplate = Handlebars.compile(html);
    Handlebars.registerPartial('contactTemplate', html);
    return contactTemplate(object);
  }

  function contactSection(object) {
    if (contactSectionTemplate) return contactSectionTemplate(object);

    contact(); // To register partial
    let html = document.querySelector('#contactSectionTemplate').innerHTML;
    contactSectionTemplate = Handlebars.compile(html);
    return contactSectionTemplate(object);
  }

  return {
    contact,
    contactSection,
  };
})();

// Orchestrates between Contact Manager and Templater
const DOM = (function() {
  // TODO: Badly named. renderContacts fetches and renders
  //       renderContact takes existing data.
  //       Fetch data in main and send it to renderContacts.
  //       DOM shouldn't be async
  async function renderContacts(contacts) {
    if (contacts === undefined) {
      contacts = await ContactManager.allContacts();
    }

    let contactDiv = document.querySelector('#contacts');
    contactDiv.innerHTML = '';
    let html = Templater.contactSection({ contacts });
    contactDiv.innerHTML = html;
  }

  function parseForm(form) {
    let object = {};

    for (let element of form.elements) {
      if (element.type !== 'submit' && element.type !== 'reset') {
        object[element.name] = element.value;
      }
    }
    object.tags = object.tags.split(',')
                             .map(str => str.trim())
                             .filter(str => str)
                             .join(',');
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

  function showEditContactForm(contactDiv) {
    let formWrapper = document.querySelector('#contactFormWrapper');
    if (!formWrapper.classList.contains('hidden')) {
      hideContactForm();
      setTimeout(() => {
        document.querySelector('h2.contactForm').textContent = 'Edit Contact';
        displayEditContact(contactDiv);
        document.querySelector('#contactFormWrapper').classList.remove('hidden');
      }, 1000);
    } else {
      displayEditContact(contactDiv);
      document.querySelector('h2.contactForm').textContent = 'Edit Contact';
      document.querySelector('#contactFormWrapper').classList.remove('hidden');
    }
  }

  function displayEditContact(contactDiv) {
    let editForm = document.querySelector('#contactForm');
    let name = contactDiv.querySelector('.full_name').textContent;
    let phone = contactDiv.querySelector('span.phone_number').textContent;
    let email = contactDiv.querySelector('span.email').textContent;
    let tagElements = Array.from(contactDiv.querySelectorAll('div.tags .tag'));
    let tags = tagElements.map(tag => tag.textContent).join(', ');
    let id = contactDiv.dataset.id;
    editForm.querySelector('.full_name').value = name;
    editForm.querySelector('.phone_number').value = phone;
    editForm.querySelector('.email').value = email;
    editForm.querySelector('.tags').value = tags;
    editForm.querySelector('#editId').setAttribute('value', id);
  }

  // Public
  async function addOrEditContact(event) {
    event.preventDefault();
    let form = document.querySelector('#contactForm');
    let contactData = DOM.parseForm(form);

    // TODO: Do we need to capture the response anymore?
    let newContactData = await ContactManager.addOrEditContact(contactData);

    DOM.renderContacts();
    hideContactForm();
  }

  function editOrDelete(event) {
    if (event.target.tagName !== 'BUTTON' ||
        !(event.target.classList.contains('edit') ||
        event.target.classList.contains('delete'))) return;
    let contactDiv = event.target.closest('div');
    let id = contactId(contactDiv);
    if (event.target.className === 'delete') {
      ContactManager.deleteContact(id);
      contactDiv.remove();
    } else {
      showEditContactForm(contactDiv);
    }
  }

  function showAddContactForm() {
    let formWrapper = document.querySelector('#contactFormWrapper');
    if (!formWrapper.classList.contains('hidden')) {
      hideContactForm();
      setTimeout(() => {
        document.querySelector('h2.contactForm').textContent = 'Create Contact';
        document.querySelector('#contactFormWrapper').classList.remove('hidden');
      }, 1000);
    } else {
      document.querySelector('h2.contactForm').textContent = 'Create Contact';
      document.querySelector('#contactFormWrapper').classList.remove('hidden');
    }
  }

  function hideContactForm(event) {
    if (event) event.preventDefault();
    document.querySelector('#editId').setAttribute('value', '');
    let formWrapper = document.querySelector('#contactFormWrapper');
    formWrapper.classList.add('hidden');
    setTimeout(() => {
      document.querySelector('h2.contactForm').textContent = '';
      formWrapper.querySelector('form').reset();
    }, 1000);
  }

  async function filterByTag(event) {
    if (event.target.tagName === 'BUTTON' && event.target.className === 'tag') {
      let tag = event.target.textContent.trim();
      let contactsWithTag = await ContactManager.allContactsWithTag(tag);
      DOM.renderContacts(contactsWithTag);
    }
  }

  return {
    addOrEditContact,
    editOrDelete,
    showAddContactForm,
    hideContactForm,
    filterByTag,
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
  contacts.addEventListener('click', Handlers.filterByTag);
});
