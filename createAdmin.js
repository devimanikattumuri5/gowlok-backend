const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

mongoose.connect("mongodb+srv://devimanikattumuri_db_user:Devimani2005@cluster0.9csadza.mongodb.net/gaologDB?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

async function createAdmin() {
  try {
    const hashed = await bcrypt.hash("GAOLOG@890", 10);

    await Admin.create({
      email: "admin@gowlok.com",
      password: hashed,
    });

    console.log("Admin Created Successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

createAdmin();