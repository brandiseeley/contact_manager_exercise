/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable max-statements-per-line */
/* eslint-disable indent */
import { ContactManager } from './contact_manager.js';
import { Templater } from './template_manager.js';

const Validator = (function() {
  let nameField;
  let emailField;
  let phoneField;
  let fields;

  function validInputs() {
    for (let field of fields) {
      if (!field.validity.valid) return false;
    }
    return true;
  }

  function showErrors() {
    for (let field of fields) {
      if (!field.validity.valid) {
        let error = field.nextElementSibling;
        error.textContent = field.validationMessage;
      }
    }
  }

  function suppressError(input) {
    let error = input.nextElementSibling;
    error.textContent = '';
  }

  function clearAllErrors() {
    for (let field of fields) {
      let error = field.nextElementSibling;
      error.textContent = '';
    }
  }

  function init() {
    nameField = document.querySelector('#contactForm input[name="full_name"]');
    emailField = document.querySelector('#contactForm input[name="email"]');
    phoneField = document.querySelector('#contactForm input[name="phone_number"]');
    fields = [nameField, emailField, phoneField];
  }

  return {
    validInputs,
    showErrors,
    suppressError,
    clearAllErrors,
    init,
  };
})();

const TagManager = (function() {
  let filteringTags;

  function activeTags() {
    let tags = filteringTags.querySelectorAll('.tag');
    return Array.from(tags).map(tag => {
      return tag.firstChild.nodeValue.trim();
    });
  }

  function addTag(tagName) {
    let tags = activeTags();
    if (tags.includes(tagName)) return;
    tags.push(tagName);
    let html = Templater.filteringTags(tags);
    document.querySelector('#filteringTags').innerHTML = html;
  }

  function init() {
    filteringTags = document.querySelector('#filteringTags');
  }

  return {
    init,
    addTag,
    activeTags,
  };
})();

const FormManager = (function() {
  let form;
  let formWrapper;
  let formHeader;

  let hide = () => formWrapper.classList.add('hidden');
  let show = () => formWrapper.classList.remove('hidden');
  let isHidden = () => formWrapper.classList.contains('hidden');
  let setHeader = (title) => { formHeader.textContent = title };
  let setEditId = (value) => document.querySelector('#editId').setAttribute('value', value);

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
    setEditId(id);
  }

  function showContactForm(title, contactDiv) {
    scrollTo({top: 0, left: 0, behavior: "smooth"});
    let delayToShow = 0;
    if (!isHidden()) {
      hideContactForm();
      delayToShow = 750;
    }
    setTimeout(() => {
      setHeader(title);
      if (contactDiv) populateInputs(contactDiv);
      show();
    }, delayToShow);
  }

  // Public Methods

  let showEditContactForm = (contactDiv) => { showContactForm('Edit Contact', contactDiv) };
  let showAddContactForm = () => { showContactForm('Add Contact') };

  function hideContactForm() {
    setEditId('');
    hide();
    setTimeout(() => {
      Validator.clearAllErrors();
      formHeader.textContent = '';
      formWrapper.querySelector('form').reset();
    }, 750);
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
      contacts = await ContactManager.contacts(TagManager.activeTags());
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

    if (!Validator.validInputs()) {
      Validator.showErrors();
      return;
    }

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

  function addTag(event) {
    if (event.target.tagName === 'BUTTON' && event.target.className === 'tag') {
      TagManager.addTag(event.target.textContent.trim());
      renderContacts();
    }
  }

  function removeTag(event) {
    if (!event.target.closest('button')) return;
    event.target.closest('button').remove();
    renderContacts();
  }

  async function filterByName(event) {
    let query = event.target.value;
    let contacts = await ContactManager.allContactsMatchingSearch(query);
    renderContacts(contacts, query);
  }

  function focusOnInput(event) {
    if ((event.target.tagName === 'INPUT') && !event.target.validity.valid) {
      Validator.suppressError(event.target);
    }
  }

  return {
    renderContacts,
    addOrEdit,
    editOrDelete,
    cancelAddOrEdit,
    addTag,
    filterByName,
    focusOnInput,
    removeTag,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  FormManager.init();
  Validator.init();
  TagManager.init();

  let newContactForm = document.querySelector('#contactForm');
  let contacts = document.querySelector('#contacts');
  let addContactButton = document.querySelector('#add');
  let cancelButton = document.querySelector('#cancel');
  let searchForm = document.querySelector('#search');
  let filteringTags = document.querySelector('#filteringTags');

  Manager.renderContacts();

  newContactForm.addEventListener('submit', Manager.addOrEdit);
  newContactForm.addEventListener('focusin', Manager.focusOnInput);
  addContactButton.addEventListener('click', FormManager.showAddContactForm);
  cancelButton.addEventListener('click', Manager.cancelAddOrEdit);
  searchForm.addEventListener('keyup', Manager.filterByName);
  contacts.addEventListener('click', Manager.editOrDelete);
  contacts.addEventListener('click', Manager.addTag);
  filteringTags.addEventListener('click', Manager.removeTag);
});
