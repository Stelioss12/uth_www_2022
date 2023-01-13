let activePage = "bio";
let pageCategory = 'index';
const leftSideMenu = document.querySelector('.side-menu-wrapper');
const sectionElements = Array.from(document.querySelectorAll('section'));
const subcategoryElements = Array.from(document.querySelectorAll('div[subcategory]'));
const bioSectionElement = document.getElementById('bio');
const photosSectionElement = document.getElementById('photos');
const booksSectionElement = document.getElementById('books');
const linksSectionElement = document.getElementById('links');
const manageSectionElement = document.getElementById('manage');
const goRegisterButton = document.getElementById('go-register');
const goLoginRegisterButton = document.getElementById('go-login');
const baseUrl = "api/";
const loginUsernameInputField = document.getElementById('loginUsername');
const loginPasswordInputField = document.getElementById('loginPassword');
const loginButtonElement = document.getElementById('login-button');
const loginErrorDiv = document.getElementById('loginError');
const loginButtonTextElement = document.getElementById('loginButtonText');

const registerUsernameInputField = document.getElementById('registerUsername');
const registerPasswordInputField = document.getElementById('registerPassword');
const registerRepeatPasswordInputField = document.getElementById('registerRepeatPassword');
const registerButtonInputField = document.getElementById('register-button');
const registerErrorInputField = document.getElementById('registerError');

const linkListGeneral = document.getElementById('linkListGeneral');
const linkListNobel = document.getElementById('linkListNobel');
const linkListManage = document.getElementById('linkListM');
const bookListGeneral = document.getElementById('bookListGeneral');
const bookListPoems = document.getElementById('poihmata-lista');
const bookListTranslations = document.getElementById('metafraseis-lista');
const bookListManage = document.getElementById('bookListM');
const linkList = [linkListGeneral, linkListNobel,  linkListManage, bookListGeneral, bookListPoems, bookListTranslations, bookListManage];
const overlay = document.getElementById('overlay');
let bookData = {};
let linkData = {};

function updateSideMenu() {
  const children = leftSideMenu.querySelectorAll('.side-menu-wrapper div');
  children.forEach((child) => {
    const splitId = child.id.split('-');
    const category = splitId[0];
    const subcategory = splitId[1];
    if (activePage === "manage") {
      if (category === "manage") {
        if ((subcategory === 'links' || subcategory === 'books'))
        {
          if (isAuthenticated()) {
            child.classList.remove('d-none');
          } else {
            child.classList.add('d-none');
          }

        } else if ((child.id.includes('login') && isAuthenticated() || child.id.includes('logout') && !isAuthenticated())) {
          child.classList.add('d-none');
        }
        else {
          child.classList.remove('d-none');
        }
      }  else {
        child.classList.add('d-none');
      }
      return;
    }
    if (category === activePage) {
      child.classList.remove('d-none');
    } else {
      child.classList.add('d-none');
    }
  });
}

function addEventHandlers() {
  const topBioButton = document.getElementById("navMenuButtonBio");
  const topPhotosButton = document.getElementById("navMenuButtonPhotos");
  const topBooksButton = document.getElementById("navMenuButtonBooks");
  const topLinksButton = document.getElementById("navMenuButtonLinks");
  const topManageButton = document.getElementById("navMenuButtonManage");
  topBioButton.addEventListener('click', () => {
    navMenuButton_onClick("bio");
  });
  topPhotosButton.addEventListener('click', () => {
    navMenuButton_onClick("photos");
  });
  topBooksButton.addEventListener('click', () => {
    navMenuButton_onClick("books");
  });
  topLinksButton.addEventListener('click', () => {
    navMenuButton_onClick("links");
  });
  topManageButton.addEventListener('click', () => {
    navMenuButton_onClick("manage");
  });

  const sideMenu = document.querySelectorAll('.side-menu');
  sideMenu.forEach((item) => {
    item.addEventListener('click', () => {
      changeSubcategory(item.id.split('-')[1]);
    });
  });

  goRegisterButton.addEventListener('click', () => {
    pageCategory = 'register';
    updateContent();
  });

  goLoginRegisterButton.addEventListener('click', () => {
    pageCategory = 'login';
    updateContent();
  });

  registerButtonInputField.addEventListener('click', () => {
    onRegisterClicked().then();
  });

  loginButtonElement.addEventListener('click', () => {
    onLoginClicked().then();
  });

  document.getElementById('goManageBooks')?.addEventListener('click', () => {
    changeSubcategory('books')
  });
  document.getElementById('goManageLinks')?.addEventListener('click', () => {
    changeSubcategory('links');
  });
  overlay.addEventListener('click', (evt) => {
    if (evt.target === overlay) {
      closeModal();
    }
  });
  document.getElementById('newBook')?.addEventListener('click', () => {
    editBook();
  });
  document.getElementById('newLink')?.addEventListener('click', () => {
    editLink();
  });
}

function closeModal() {
  overlay.classList.add('d-none');
  overlay.innerHTML = "";
}

function openModal() {
  overlay.classList.remove('d-none');
}

function editBook(id) {
  const fragment = document.createRange().createContextualFragment(document.getElementById('editBookModalTemplate').innerHTML);
  if(id) {
    const bookIdInput = fragment.querySelector('#bookId');
    bookIdInput.value = String(id);
    const bookTitleInput = fragment.querySelector('#bookTitle');
    bookTitleInput.value = bookData[id]?.title;
    const bookYearInput = fragment.querySelector('#bookYear');
    bookYearInput.value = String(bookData[id]?.year);
    const bookYearType = fragment.querySelector('#bookType');
    bookYearType.value = String(bookData[id]?.category).toUpperCase();
  }
  overlay.appendChild(fragment);
  overlay.querySelector('#saveButton').addEventListener('click', () => {
    const id = overlay.querySelector('#bookId');
    const bookTitle = overlay.querySelector('#bookTitle');
    const bookYear = overlay.querySelector('#bookYear');
    const bookCategory = overlay.querySelector('#bookType');
    if (!bookTitle.value.length || !bookYear.value.length) {
      changeSaveMessage('Please fill all fields.');
      return;
    }
    changeSaveMessage();
    saveBook({
      id: id.value.length ? Number(id.value) : undefined,
      title: bookTitle.value,
      year: +bookYear.value,
      category: bookCategory.value === 'POIHMA' ? 'POIHMA' :'METAFRASH',
    }).then();
  });
  openModal();
}

function editLink(id) {
  const fragment = document.createRange().createContextualFragment(document.getElementById('editLinkModalTemplate').innerHTML);
  if(id) {
    const linkId = fragment.querySelector('#linkId');
    linkId.value = String(id);
    const linkUrl = fragment.querySelector('#linkUrl');
    linkUrl.value = linkData[id]?.url;
    const linkText = fragment.querySelector('#linkTxt');
    linkText.value = String(linkData[id]?.txt);
    const linkCategory = fragment.querySelector('#linkCategory');
    linkCategory.value = String(linkData[id]?.category).toUpperCase();
  }
  overlay.appendChild(fragment);
  overlay.querySelector('#saveButton').addEventListener('click', () => {
    const id = overlay.querySelector('#linkId');
    const linkInput = overlay.querySelector('#linkUrl');
    const txtInput = overlay.querySelector('#linkTxt');
    const linkCategory = overlay.querySelector('#linkCategory');
    if (!linkInput.value.length) {
      changeSaveMessage('Link field is required.');
      return;
    }
    changeSaveMessage();
    saveLink({
      id: id.value.length ? +id.value : undefined,
      url: linkInput.value,
      txt: txtInput.value,
      category: linkCategory.value === 'GENERAL' ? "GENERAL" : "NOBEL",
    }).then();
  });
  openModal();
}

async function onLoginClicked() {
  if (loginUsernameInputField.value.length < 1) {
    showLoginError('Please enter a valid username.');
    return;
  }
  if (loginPasswordInputField.value.length < 1) {
    showLoginError('Please enter a valid password.');
    return;
  }
  loginButtonTextElement.disabled = true;
  const data = {
    username: loginUsernameInputField?.value,
    password: loginPasswordInputField?.value,
  };
  const result = JSON.parse(await apiCall('POST', baseUrl + "users/login", data).catch((err) => { console.log(err); return null }));
  loginButtonTextElement.disabled = false;
  if (result?.access_token) {
    showLoginError();
    const token = result.access_token;
    setCookie('access_token', token, {
      expires: new Date(2030,1,1),
    });
    updateSideMenu();
    pageCategory = 'index';
    updateContent();
  } else {
    if (result?.message) {
      showLoginError(result.message);
    } else {
      showLoginError("An error has occurred. Please try again.");
    }
  }
}

async function onRegisterClicked() {
  if (registerUsernameInputField.value.length < 1) {
    showRegisterError('Please enter a valid username.');
    return;
  }
  if (registerPasswordInputField.value.length < 1) {
    showRegisterError('Please enter a valid password.');
    return;
  }
  if (registerPasswordInputField.value !== registerRepeatPasswordInputField.value) {
    showRegisterError('The two passwords you entered do not match.');
    return;
  }
  registerButtonInputField.disabled = true;
  const data = {
    username: registerUsernameInputField?.value,
    password: registerPasswordInputField?.value,
  };
  const result = JSON.parse(await apiCall('post', baseUrl + "users/register", data).catch(() => null));
  registerButtonInputField.disabled = false;
  if (result?.access_token) {
    showRegisterError();
    const token = result?.accessToken;
    setCookie('access_token', token, {
      expires: new Date(2024,1,1)
    });
    updateSideMenu();
    pageCategory = 'index';
    updateContent();
  } else {
    if (result?.message) {
      showRegisterError(result.message);
    } else {
      showRegisterError("An error has occurred. Please try again.");
    }
  }
}

function showRegisterError(text) {
  if (text) {
    registerErrorInputField.innerText = text;
    registerErrorInputField.classList.remove('d-none');
  } else {
    registerErrorInputField.innerText = "";
    registerErrorInputField.classList.add('d-none');
  }
}

function showLoginError(text) {
  if (text) {
    loginErrorDiv.innerText = text;
    loginErrorDiv.classList.remove('d-none');
  } else {
    loginErrorDiv.innerText = "";
    loginErrorDiv.classList.add('d-none');
  }
}

function changeSaveMessage(text) {
  const textElement = overlay.querySelector('#errorMessage');
  if (text) {
    textElement.innerText = text;
    textElement.classList.remove('d-none');
  } else {
    textElement.innerText = "";
    textElement.classList.add('d-none');
  }
}

function apiCall(method, url, data) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('content-type', 'application/json');
    if (getCookie("access_token")) {
      xhr.setRequestHeader('Authorization', getCookie("access_token"));
    }
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
      });
    };
    switch (method.toLowerCase()) {
      case 'post':
      case 'patch':
      case 'put':
        Object.keys(data ?? {}).length ? xhr.send(JSON.stringify(data)) : xhr.send();
        break;
      default:
        xhr.send();
    }
  });
}

function navMenuButton_onClick(page) {
  activePage = page;
  pageCategory = 'index';
  updateSideMenu();
  updateContent();
}

function changeSubcategory(subcategory) {
  if (activePage === "manage" && subcategory === 'logout') {
    subcategory = 'login';
    setCookie('access_token', "");
    updateSideMenu();
  }
  pageCategory = subcategory;
  updateContent();
}

async function deleteBook(id) {
  return await apiCall("DELETE",baseUrl + `books/${id}`, {});
}

async function deleteLink(id) {
  return await apiCall("DELETE",baseUrl + `links/${id}`, {});
}

async function saveBook(bookData) {
  overlay.querySelector('#saveButton').disabled = true;
  const result = JSON.parse(await apiCall(bookData.id ? 'PATCH' : 'POST', baseUrl + `books/${bookData?.id ? bookData.id.toString() : 'new'}`, bookData).catch(() => null));
  if (result?.data) {
    closeModal();
    updateContent();
  } else {
    overlay.querySelector('#saveButton').disabled = false;
    if (result?.message) {
      changeSaveMessage(result.message);
    } else {
      changeSaveMessage('An unknown error has occurred. Please try again.');
    }
  }
}

async function saveLink(linkData) {
  overlay.querySelector('#saveButton').disabled = true;
  const result = JSON.parse(await apiCall(linkData.id ? 'PATCH' : 'POST', baseUrl + `links/${linkData?.id ? linkData.id.toString() : 'new'}`, linkData).catch(() => null));
  if (result?.data) {
    closeModal();
    updateContent();
  } else {
    overlay.querySelector('#saveButton').disabled = false;
    if (result?.message) {
      changeSaveMessage(result.message);
    } else {
      changeSaveMessage('An unknown error has occurred. Please try again.');
    }
  }
}

function updateContent() {
  showRegisterError();
  showLoginError();
  linkList.forEach((link) => {
    link.innerHTML = "";
  });

  sectionElements.forEach((section) => {
    section.classList.add('d-none');
  });
  subcategoryElements.forEach((section) => {
    section.classList.add('d-none');
  });
  if (activePage === "manage" && pageCategory === 'index' && !isAuthenticated()) {
    pageCategory = 'login';
  }
  subcategoryElements.find((section) => section.getAttribute('subcategory') === pageCategory && section.parentElement.id === activePage)?.classList.remove('d-none');
  let element;
  switch(activePage) {
    case "bio":
      element = bioSectionElement;
      break;
    case "books":
      element = booksSectionElement;
      switch(pageCategory) {
        case 'index':
          getBooks().then((results) => {
            results = JSON.parse(results);
            for (const result of results?.data) {
              bookListGeneral.insertAdjacentHTML('beforeend', `<div class="mt-10">${result.title} - ${result.year}</div>`);
            }
          });
          break;
        case 'poihmata':
          getBooks({ category: "POIHMA" }).then((results) => {
            results = JSON.parse(results);
            for (const result of results?.data) {
              bookListPoems.insertAdjacentHTML('beforeend', `<div class="mt-10">${result.title} - ${result.year}</div>`);
            }
          });
          break;
        case 'metafraseis':
          getBooks({ category: "METAFRASH" }).then((results) => {
            results = JSON.parse(results);
            for (const result of results?.data) {
              bookListTranslations.insertAdjacentHTML('beforeend', `<div class="mt-10">${result.title} - ${result.year}</div>`);
            }
          });
          break;
        default:
          break;
      }
      break;
    case "photos":
      element = photosSectionElement;
      break;
    case "links":
      element = linksSectionElement;
      switch(pageCategory) {
        case 'index':
          getLinks({ category: "GENERAL" }).then((results) => {
            results = JSON.parse(results);
            for (const result of results?.data) {
              linkListGeneral.insertAdjacentHTML('beforeend', `<div class="mt-10"><a href="${result.url}">${result.url}</a> ${result.txt}</div>`);
            }
          });
          break;
        case 'nobel':
          getLinks({ category: "NOBEL" }).then((results) => {
            results = JSON.parse(results);
            for (const result of results?.data) {
              linkListNobel.insertAdjacentHTML('beforeend', `<div class="mt-10"><a href="${result.url}">${result.url}</a> ${result.txt}</div>`);
            }
          });
          break;
        default:
          break;
      }
      break;
    case "manage":
      element = manageSectionElement;
      switch(pageCategory) {
        case 'books':
          getBooks().then((results) => {
            bookData = {};
            results = JSON.parse(results);
            for (const result of results?.data) {
              bookData[result.id] = result;
              bookListManage.insertAdjacentHTML('beforeend', `<div class="mt-10">${result.title} - ${result.year} <span class="clickable" id="editbook${result.id}">📝</span> <span class="clickable" id="delbook${result.id}">❌</span> </div>`);
              const deleteButton = bookListManage.querySelector(`#delbook${result.id}`);
              deleteButton.addEventListener('click', () => {
                deleteBook(result.id).then((res) => {
                  const resJson = JSON.parse(res);
                  if (resJson.data) {
                    deleteButton.parentElement.remove();
                    delete bookData[result.id];
                  }
                });
              });
              const editButton = bookListManage.querySelector(`#editbook${result.id}`);
              editButton.addEventListener('click', () => {
                editBook(result.id);
              });
            }
          });
          break;
        case 'links':
          getLinks().then((results) => {
            linkData = {};
            results = JSON.parse(results);
            for (const result of results?.data) {
              linkData[result.id] = result;
              linkListManage.insertAdjacentHTML('beforeend', `<div class="mt-10"><a href="${result.url}">${result.url}</a> ${result.txt} <span class="clickable" id="editlink${result.id}">📝</span> <span class="clickable" id="dellink${result.id}">❌</span> </div>`);
              const deleteButton = linkListManage.querySelector(`#dellink${result.id}`);
              deleteButton.addEventListener('click', () => {
                deleteLink(result.id).then((res) => {
                  const resJson = JSON.parse(res);
                  if(resJson.data) {
                    deleteButton.parentElement.remove();
                    delete linkData[result.id];
                  }
                });
              });
              const editButton = linkListManage.querySelector(`#editlink${result.id}`);
              editButton.addEventListener('click', () => {
                editLink(result.id);
              });
            }
          });
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  element?.classList.remove('d-none');
}

async function getBooks(filter) {
  if (filter) {
    return await apiCall("POST",baseUrl + `books/search`, filter);
  }
  return await apiCall("GET",baseUrl + `books/all`, null);
}

async function getLinks(filter) {
  if (filter)
  {
    return await apiCall("POST",baseUrl + `links/search`, filter);
  }
  return await apiCall("GET",baseUrl + `links/all`, null);
}

function isAuthenticated() {
  return getCookie("access_token")?.length;
}

function setCookie(name, value)
{
  const options = { path: '/', expires: new Date(2025,1,1).toISOString()};
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  for (let optionKey in options)
  {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }
  document.cookie = updatedCookie;
}
function getCookie(name)
{
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length >= 2) return parts.pop().split(';').shift();
}

updateSideMenu();
addEventHandlers();

