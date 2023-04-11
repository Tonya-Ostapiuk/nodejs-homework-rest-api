const express = require("express");
const contactsRep = require("../../models/contacts");
const router = express.Router();
const { addContactSchema } = require("../../schemas/validation.schema");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsRep.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await contactsRep.getContactById(contactId);
    if (contact === null) {
      const error = new Error("Not found");
      error.code = 404;
      throw error;
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {name, email, phone} = req.body;

    const { error } = addContactSchema.validate({ name, email, phone });

    if (error) {
      const err = new Error("Missing required name field");
      err.code = 400;
      throw err;
    }

    const newContact = await contactsRep.addContact(name, email, phone);
    res.status(201).send(newContact)
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const removeContact = await contactsRep.removeContact(contactId);
    if (removeContact === null) {
      const err = new Error("This contact is not found");
      err.code = 404;
      throw err;
    }
    res.json(removeContact);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;
    const { error } = addContactSchema.validate({ name, email, phone });

    if (error) {
      const err = new Error("Missing field");
      err.code = 400;
      throw err;
    }

    const updateContact = await contactsRep.updateContact(contactId, { name, email, phone });

    if (updateContact === null) {
      const err = new Error("This contact is not found");
      err.code = 404;
      throw err;
    }
    res.json(updateContact);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
