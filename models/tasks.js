var mongoose = require('mongoose');

var taskschema = mongoose.Schema({

 employeeid : {
    type : String,
    required : true
 },
 bossname :{
     type : String,
     required : true
 }
 ,
 task :{

    description :{ type : String,
        required : true
    },

    material :{ type : String,
        required : true
    }
 },
 completed:{
     type:Boolean,
     required : true,
     default : false
 },
 complete :{

    description :{
         type : String,
        required : false
    },

    material :{ 
        type : String,
        required : false
    }
 }

})

module.exports = mongoose.model('task',taskschema);