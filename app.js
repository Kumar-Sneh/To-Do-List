//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sneh:VTZYAVLrOiLVxHbn@todolist.ildqk.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Hit the + button to add a new item."
});

const item2 = new Item({
  name: "<-- Hit this to delete an item."
});

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const list1 = new List({
  name: "Home",
  items: [item1, item2]
});
list1.save();

let day = date.getDate();

app.get("/", function(req, res){

  Item.find({}, function(err, items){
    if(items.length === 0){
      Item.insertMany([item1, item2], function(err){
        if(err)
          console.log(err);
        else
        console.log("Successfully saved default items to DB.");
      });
      res.redirect("/");
    } else {
      List.find({}, function(err, lists){
        if(err){
          console.log(err);
          res.redirect("/");
        } else {
          res.render("list", {
            Title: day,
            Items: items,
            Lists: lists
          });
        }
      });
    }
  });
});

app.get("/lists/:listTitle", function(req, res){
  const listTitle = _.capitalize(req.params.listTitle);

  List.findOne({name: listTitle}, function(err, foundList){
    if(err){
      console.log(err);
      res.redirect("/");
    } else {
      //Shows the existing list
      if(foundList) {
        List.find({}, function(err, lists){
          if(err){
            console.log(err);
            res.redirect("/");
          } else {
            res.render("list", {
              Title: listTitle,
              Items: foundList.items,
              Lists: lists
            });
          }
        });
      } else {
        //Create a new list
        const newList = new List({
          name: listTitle,
          items: [item1, item2]
        });
        newList.save();
        res.redirect("/lists/" + listTitle);
      }
    }
  });
});

app.post("/", function(req, res){
  const newItem = new Item({
    name: req.body.newItem
  });

  const title = req.body.title;
  if(title === day) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: title}, function(err, foundList){
      if(err) {
        console.log(err);
        res.redirect("/");
      } else {
        foundList.items.push(newItem);
        foundList.save();    //Automatically update the object data in collection
        res.redirect("/lists/" + title);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listTitle = req.body.title;

  if(listTitle === day) {
    Item.findByIdAndRemove(itemId, function(err){
      if(err)
      console.log(err);
      else
      console.log("Successfully deleted checked item");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemId}}}, function(err, foundList){
      if(err) {
        console.log(err);
        res.redirect("/");
      }
    });
    res.redirect("/lists/" + listTitle);
  }
});

app.post("/delete-list", function(req, res){
  const itemId = req.body.checkbox;

  List.findByIdAndRemove(itemId, function(err){
    if(err)
    console.log(err);
    else
    console.log("Successfully deleted checked item");
  });
  res.redirect("/");
});

app.post("/add-list", function(req, res){
  const list_name = _.capitalize(req.body.newList);

  const newList = new List({
    name: list_name,
    items: []
  });
  newList.save();
  res.redirect("/lists/" + list_name);
});

let port = process.env.PORT;
app.listen(port == null || port == "" || 3000, function(){
  console.log("Server is listening to port " + port);
});

//Heroku App
//https://stark-spire-00974.herokuapp.com/
