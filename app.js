const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

app.use(express.static("public"));

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-karthik:admin-password@cluster0.nymri.mongodb.net/todosDB",{useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useFindAndModify', false);

const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item", todoSchema);

const listSchema = {
  listName: {
    type: String,
    required: true
  },
  list: [todoSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
  // let day = date.day();
  Item.find(function(err, items){
    if(err)
    console.log(err);
    else
    res.render("list", {listTitle: "Today", newListItems: items});
  });
});

app.get("/:customListName",function(req,res){
  let customListName = _.kebabCase(req.params.customListName);
  List.findOne({listName: customListName},function(err,doc){
    if(doc)
    res.render("list", {listTitle: doc.listName, newListItems: doc.list});
    else{
      const newList = new List({listName: customListName, list: []});
      newList.save();
      res.redirect("/" + customListName);
    }
  });
});

app.get("/about",function(req,res){
  res.render("about");
});

app.post("/",function(req,res){
  let todo = req.body.newTodo;
  const item = new Item({todo: todo});

  let listName = req.body.list;
  if(listName == "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({listName: listName},function(err,doc){
      doc.list.push(item);
      doc.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/del",function(req,res){
  let checkedItemId = req.body._id;
  let listName = req.body.list;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err,item){
      if(err)
      console.log(err);
      else
      console.log("Deleted Today list todo successfully");
      res.redirect("/");
    });
  } else{
    List.findOne({listName: listName}, function(err,doc){
      doc.list.pull({_id: checkedItemId});
      doc.save();
      res.redirect("/" + listName);
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server started successfully");
});
