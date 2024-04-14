const Templater = (function() {
  let contactTemplate;
  let contactSectionTemplate;
  let filteringTagsTemplate;

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

  function filteringTags(tags) {
    if (filteringTagsTemplate) return filteringTagsTemplate({ tags });

    let html = document.querySelector('#filteringTagsTemplate').innerHTML;
    filteringTagsTemplate = Handlebars.compile(html);
    return filteringTagsTemplate({ tags });
  }

  return {
    contact,
    contactSection,
    filteringTags,
  };
})();

export { Templater };