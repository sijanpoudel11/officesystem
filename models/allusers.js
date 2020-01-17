var mongoose = require('mongoose');

var alluser = mongoose.Schema({
    username : {
        type : String,
        required : true
    } ,
    password : {
        type : String,
        required : true
    } ,
    name : {
        type : String,
        required : true
    } ,
    gender : {
        type : String,
        required : true
    } ,
    contact : {
        type : String ,
        required : true
    } ,
     imagename :   {
                type : String 
        }
    ,

    boss : {
        type : Boolean ,
        required : true
        
    } ,
    task : {
        type : Boolean ,
        required : true,
        default : false
    } 


})

module.exports = mongoose.model('alluser' , alluser);