/* eslint-disable indent */
import { ContactManager } from './contact_manager.js';
import { Templater } from './template_manager.js';

const FormManager = (function() {
  let form;
  let formWrapper;
  let formHeader;

  function hideContactForm() {
    document.querySelector('#editId').setAttribute('value', '');
    formWrapper.classList.add('hidden');
    setTimeout(() => {
      formHeader.textContent = '';
      formWrapper.querySelector('form').reset();
    }, 750);
  }

  function showEditContactForm(contactDiv) {
    scrollTo({top: 0, left: 0, behavior: "smooth"});
    if (!formWrapper.classList.contains('hidden')) {
      hideContactForm();
      setTimeout(() => {
        formHeader.textContent = 'Edit Contact';
        populateInputs(contactDiv);
        formWrapper.classList.remove('hidden');
      }, 750);
    } else {
      populateInputs(contactDiv);
      formHeader.textContent = 'Edit Contact';
      formWrapper.classList.remove('hidden');
    }
  }

  function populateInputs(contactDiv) {
    let name = contactDiv.querySelector('.full_name').textContent;
    let phone = contactDiv.querySelector('span.phone_number').textContent;
    let email = contactDiv.querySelector('span.email').textContent;
    let tagElements = Array.from(contactDiv.querySelectorAll('div.tags .tag'));
    let tags = tagElements.map(tag => tag.textContent).join(', ');
    let id = contactDiv.dataset.id;
    form.querySelector('.full_name').value = name;
    form.querySelector('.phone_number').value = phone;
    form.querySelector('.email').value = email;
    form.querySelector('.tags').value = tags;
    form.querySelector('#editId').setAttribute('value', id);
  }

  function showAddContactForm() {
    if (!formWrapper.classList.contains('hidden')) {
      FormManager.hideContactForm();
      setTimeout(() => {
        formHeader.textContent = 'Create Contact';
        formWrapper.classList.remove('hidden');
      }, 750);
    } else {
      formHeader.textContent = 'Create Contact';
      formWrapper.classList.remove('hidden');
    }
  }

  function parseForm() {
    let contactData = {};

    for (let element of form.elements) {
      if (element.type !== 'submit' && element.type !== 'reset') {
        contactData[element.name] = element.value;
      }
    }
    contactData.tags = contactData.tags.split(',')
                                       .map(str => str.trim())
                                       .filter(str => str)
                                       .join(',');
    return contactData;
  }

  function init() {
    form = document.querySelector('#contactForm');
    formWrapper = document.querySelector('#contactFormWrapper');
    formHeader = document.querySelector('h2.contactForm');
  }

  return {
    showEditContactForm,
    showAddContactForm,
    hideContactForm,
    parseForm,
    init,
  };
})();

const Manager = (function() {
  function contactId(contactDiv) {
    return contactDiv.dataset.id;
  }

  async function renderContacts(contacts, query) {
    if (contacts === undefined) {
      contacts = await ContactManager.allContacts();
    }

    contacts = { contacts };
    if (query) {
      contacts.query = query;
    }

    let contactDiv = document.querySelector('#contacts');
    contactDiv.innerHTML = '';
    let html = Templater.contactSection(contacts);
    contactDiv.innerHTML = html;
  }

  async function addOrEdit(event) {
    event.preventDefault();
    let form = document.querySelector('#contactForm');
    let contactData = FormManager.parseForm(form);

    // TODO: Do we need to capture the response anymore?
    let newContactData = await ContactManager.addOrEditContact(contactData);

    renderContacts();
    FormManager.hideContactForm();
  }

  function editOrDelete(event) {
    if (event.target.tagName !== 'BUTTON' ||
        !(event.target.classList.contains('edit') ||
        event.target.classList.contains('delete'))) return;
    let contactDiv = event.target.closest('div');
    let id = contactId(contactDiv);
    if (event.target.className === 'delete') {
      ContactManager.deleteContact(id);
      renderContacts();
    } else {
      FormManager.showEditContactForm(contactDiv);
    }
  }

  function cancelAddOrEdit(event) {
    if (event) event.preventDefault();
    FormManager.hideContactForm();
  }

  async function filterByTag(event) {
    if (event.target.tagName === 'BUTTON' && event.target.className === 'tag') {
      let tag = event.target.textContent.trim();
      let contactsWithTag = await ContactManager.allContactsWithTag(tag);
      renderContacts(contactsWithTag);
    }
  }

  async function filterByName(event) {
    let query = event.target.value;
    let contacts = await ContactManager.allContactsMatchingSearch(query);
    renderContacts(contacts, query);
  }

  return {
    renderContacts,
    addOrEdit,
    editOrDelete,
    cancelAddOrEdit,
    filterByTag,
    filterByName,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  FormManager.init();

  let newContactForm = document.querySelector('#contactForm');
  let contacts = document.querySelector('#contacts');
  let addContactButton = document.querySelector('#add');
  let cancelButton = document.querySelector('#cancel');
  let searchForm = document.querySelector('#search');

  Manager.renderContacts();

  newContactForm.addEventListener('submit', Manager.addOrEdit);
  contacts.addEventListener('click', Manager.editOrDelete);
  addContactButton.addEventListener('click', FormManager.showAddContactForm);
  cancelButton.addEventListener('click', Manager.cancelAddOrEdit);
  contacts.addEventListener('click', Manager.filterByTag);
  searchForm.addEventListener('keyup', Manager.filterByName);
});
