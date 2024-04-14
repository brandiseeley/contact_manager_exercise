/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable max-statements-per-line */
/* eslint-disable indent */
import { ContactManager } from '../modules/contact_manager.js';
import { Templater } from '../modules/template_manager.js';
import { Utility } from '../modules/utilities.js';
import { Validator, FormManager  } from '../modules/form_manager.js';

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
    if (Utility.caseFreeIncludes(tags, tagName)) return;
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

const Manager = (function() {

  async function renderContacts(contacts, query) {
    if (contacts === undefined) {
      contacts = await ContactManager.contacts(TagManager.activeTags());
    }

    contacts = { contacts };
    if (query) {
      contacts.query = query;
    }

    let contactDiv = document.querySelector('#contacts');
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

    let responseData = await ContactManager.addOrEditContact(contactData);
    Validator.flashMessage(responseData);

    renderContacts();
    FormManager.hideContactForm();
  }

  async function editOrDelete(event) {
    if (event.target.tagName !== 'BUTTON' ||
        !(event.target.classList.contains('edit') ||
        event.target.classList.contains('delete'))) return;
    let contactDiv = event.target.closest('div');
    let id = FormManager.contactId(contactDiv);
    if (event.target.className === 'delete') {
      let responseData = await ContactManager.deleteContact(id);
      Validator.flashMessage(responseData);
      FormManager.hideContactForm();
      renderContacts();
    } else {
      FormManager.showEditContactForm(contactDiv);
    }
  }

  function cancelAddOrEdit(event) {
    if (event) event.preventDefault();
    FormManager.hideContactForm();
  }

  function tagClick(event) {
    if (event.target.tagName === 'BUTTON' && event.target.className === 'tag') {
      TagManager.addTag(event.target.textContent.trim());
      Utility.scrollToTop();
      renderContacts();
    }
  }

  function removeTag(event) {
    if (!event.target.closest('button')) return;
    event.target.closest('button').remove();
    Utility.scrollToTop();
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
    tagClick,
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
  contacts.addEventListener('click', Manager.tagClick);
  filteringTags.addEventListener('click', Manager.removeTag);
});
