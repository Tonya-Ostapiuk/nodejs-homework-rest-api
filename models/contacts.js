const fs = require('fs/promises');
const path = require("path");
const { v4: uuidv4 } = require('uuid');


const contactsPath = path.join(__dirname, 'contacts.json');

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath);
    const result = JSON.parse(data);
     return result;  
  } catch (error) {
    console.log(error);
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const getContact = contacts.find(contact => contact.id === contactId);
    return getContact
      } catch (error) {
    console.log(error);
  }
}

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const removeContact = contacts.find(contact => contact.id === contactId);
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    fs.writeFile(contactsPath, JSON.stringify(newContacts, null, 2));
    console.log(`id: ${contactId} `);
    return removeContact;   
  } catch (error) {
    console.log(error);
  }
}

const addContact = async (name, email, phone)  => {
  try {
    const contacts = await listContacts();
    const newContact = {id: uuidv4(), name, email, phone};
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
   
  } catch (error) {
    console.log(error);
  }
}

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === contactId);
    if (contactIndex === -1) {
      return null;
  }
  contacts[contactIndex] = {
    contactId,
    ...body,
  };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[contactIndex];
} catch (error) {
  console.log(error);
}
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
