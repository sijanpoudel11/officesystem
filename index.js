var express = require('express');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var session = require('express-session');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var employee = require('./models/allusers');
var tasks = require('./models/tasks');
var auth = require('./passportauth/auth');

require('./passportauth/passport')(passport);

var app = express();

// setup middleware
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use(bodyparser.urlencoded({extended:true}));
app.use(session({secret: "secret", resave: false, saveUninitialized: false,cookie:{
    maxAge: 24*60*60
}}));

var storage = multer.diskStorage({
    destination : "./uploads/images/" ,
    filename : (req,file,cb)=>{
        cb(null,req.body.username + path.extname(file.originalname));
    }
});

var upload = multer({storage:storage}).single('photo')

// passport

app.use(passport.initialize());

app.use(passport.session());

mongoose.connect('mongodb://localhost/officesystem', {useNewUrlParser: true, useUnifiedTopology : true}).then(() => {
    console.log('database connected');
    })


// login page route
app.get('/',auth.redirectdashboard,(req,res)=>{
    res.render('login');
})

app.get('/adduser',auth.entureboss,(req,res)=>{
    res.render('add-users');
})

app.post('/adduser',upload,(req,res)=>{
    console.log(req.file);
    let {name , username , password , gender , contact ,boss} = req.body;
    var imagename = req.file.filename;
    var newuser = new employee({

        name,
        username,
        password,
        gender,
        contact,
        imagename,
        boss
    })
   
    newuser.password = bcrypt.hashSync(password,10);
    newuser.save()
    .then((user)=>{

        console.log(user +' saved in database');
        res.redirect('/dashboard');
    })
    .catch((err)=>{
        res.send(err);
    })
})
// route for user login using passport
app.post('/login',passport.authenticate('login',{
    successRedirect :'/dashboard',
    failureRedirect : '/',
    failureFlash : false
}))

app.get('/dashboard',auth.entureauthenticated,(req,res)=>{
    console.log(req.isAuthenticated());
    if(req.user.boss == true){
        console.log(req.user.name+'  boss logged in');
        res.redirect('/boss/dashboard');
    }else{
        console.log(req.user.name+'  employee logged in');
        res.redirect('/employee/dashboard');
    }
})

app.get('/boss/dashboard',auth.entureboss,(req,res)=>{

    res.render('boss-dashboard',{user : req.user});
})

app.get('/employee/dashboard',auth.entureauthenticated,(req,res)=>{
    
 //   if(req.user.task == true){
        tasks.findOne({employeeid : req.user._id, completed : false})
        .then((task)=>{
           res.render('employee-dashboard',{employee : req.user, task : task})
   
        })
        .catch((err)=>{
            res.send(err);
        })
 //   }
       
     
  
})

 app.get('/boss/givetask',auth.entureauthenticated,(req,res)=>{
     var employees = employee.find({boss : false },(err,users)=>{
        res.render('viewallemployees',{users,loggeduser : req.user});
     }) 
 })
 
 app.get('/boss/update/:id',auth.entureauthenticated,(req,res)=>{

     var id = req.params.id;
     employee.findOne({_id : id}).then((user)=>{
        
          res.render('givetasktoemployee',{user:user,boss : req.user.name,loggeduser:req.user })

             

         })
     
     .catch((err)=>{
         console.log(err);
     })
    })
 
 app.get('/boss/showtask/:id/:name',(req,res)=>{
        var id = req.params.id;
        var name = req.params.name;
        tasks.findOne({employeeid : id}).then((task)=>{
            res.render('showtasktoboss',{task , name,loggeduser:req.user})
        }).catch((err)=>{
            res.send(err);
        })
 
     })
 
 app.post('/boss/givetasktoemployee/:id/:bossname',(req,res)=>{
    var id =  req.params.id;
    var bossname = req.params.bossname;
    console.log(bossname+'  is the boss')
     var material = req.body.material;
     var description = req.body.desc;
     employee.findOne({_id : id})
     .then((user)=>{
 
      var  task1 = new tasks();
      task1.employeeid = id,
      task1.bossname = bossname; 
      task1.task.description = description,
      task1.task.material = material
      
       task1.save()
       .then((task)=>{
         user.task = true;
         user.save().then((newuser)=>{
         }).catch((err)=>{
             res.send(err);
         })
          console.log(task);
          console.log(user);
          res.redirect('/boss/dashboard');
       })
       .catch((err)=>{
           console.log(err);
       })
 
     })
     .catch((err)=>{
         console.log(err);
     })
 
         
 })

 app.get('/taskcompleted/',(req,res)=>{
    console.log(req.user);
    var id = req.params.id;
     res.render('taskcompleted',{id : id,loggeduser:req.user})
 })

app.post('/taskcompleted',(req,res)=>{
    var description = req.body.description;
    var material = req.body.material;
    tasks.findOne({employeeid : req.user._id ,completed : false})
    .then((task)=>{ 
        task.completed = true;
        task.complete.description = description;
        task.complete.material = material;
        task.save().then((newtask)=>{
            console.log('database modified');
            req.user.task = false;
            req.user.save().then((user)=>{
            console.log(req.user);
            res.redirect('/employee/dashboard');
            }).catch((err)=>{
                console.log(err);
            })
        }).catch((err)=>{
            console.log(err);
        })
    }) 
    .catch((err)=>{
        console.log(err);
    })

})

app.get('/seeemployees',auth.entureauthenticated,(req,res)=>{
    employee.find({boss: false})
    .then((employees)=>{
        console.log(employees);
        res.render('seeallemployees',{employees,loggeduser:req.user});
    }).catch((err)=>{
        res.send(err);
    })
})

app.get('/showtaskhistory/:id/:name',(req,res)=>{
    var id = req.params.id;
    var name = req.params.name;
    tasks.find({employeeid:id , completed : true})
    .then((task)=>{
        res.render('showtaskhistory',{tasks:task,name:name,loggeduser:req.user});
    }).catch((err)=>{
        res.send(err);
    })
})

app.get('/changeprofile',auth.entureauthenticated,(req,res)=>{
    res.render('change-profile-information',{loggeduser:req.user});
})

app.get('/changepassword',auth.entureauthenticated,(req,res)=>{
    res.render('changepassword',{loggeduser:req.user});
})

app.post('/changepassword',auth.entureauthenticated,(req,res)=>{
    var {oldusername,oldpassword,newusername,newpassword} = req.body ;
    // compare old password with real password

    if(oldusername == req.user.username && bcrypt.compareSync(oldpassword, req.user.password)){
        console.log('username and password matched. now you can change your password');
        // change password 
        req.user.username = newusername;
        req.user.password = bcrypt.hashSync(newpassword , 10);
        req.user.save().then((user)=>{
            console.log('username and password changed')
            res.redirect('/dashboard');
        })
        .catch((err)=>{
            res.send(err);
        })

    }else
        console.log('username or password incorrect');
    }
)

app.get('/logout',(req,res)=>{
    req.logout();
    console.log('logged out');
    res.redirect('/');
})
 // server established

app.listen('8000',(req,res)=>{
    console.log('listening to port 8000');
})