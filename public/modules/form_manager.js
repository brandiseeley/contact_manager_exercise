/* eslint-disable max-statements */
import { Utility } from '../modules/utilities.js';

const Validator = (function() {
  let nameField;
  let emailField;
  let phoneField;
  let fields;
  let flashMessageContainer;
  let errorMessage;
  let successMessage;

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

  function flashMessage(responseData) {
    flashMessageContainer.classList.remove('hidden');
    if (responseData.success) {
      successMessage.textContent = responseData.message;
    } else {
      errorMessage.textContent = responseData.message;
    }

    setTimeout(clearFlashMessage, 3000);
  }

  function clearFlashMessage() {
    flashMessageContainer.classList.add('hidden');
    setTimeout(() => {
      successMessage.textContent = '';
      errorMessage.textContent = '';
    }, 750);
  }

  function init() {
    flashMessageContainer = document.querySelector('#flashMessage');
    successMessage = document.querySelector('#successMessage');
    errorMessage = document.querySelector('#errorMessage');
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
    flashMessage,
    clearFlashMessage,
    init,
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
  let contactId = (contactDiv) => contactDiv.dataset.id;

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

  let showEditContactForm = (contactDiv) => { showContactForm('Edit Contact', contactDiv) };
  let showAddContactForm = () => { showContactForm('Add Contact') };

  function showContactForm(title, contactDiv) {
    Utility.scrollToTop();
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

  function hideContactForm() {
    Utility.scrollToTop();
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
    contactId,
    parseForm,
    init,
  };
})();

export { Validator, FormManager };