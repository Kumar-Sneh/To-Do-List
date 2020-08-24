//jshint esversion: 6

//console.log(module);   //print the date.js module

//module.exports.getDate = function(){
exports.getDate = function(){

  const today = new Date();
  //console.log(today.getDay());  //0-6
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);
};

module.exports.getDay = getDay;

function getDay(){

  const today = new Date();
  //console.log(today.getDay());  //0-6
  const options = {
    weekday: "long"
  };

  const day = today.toLocaleDateString("en-US", options);
  return day;
}
