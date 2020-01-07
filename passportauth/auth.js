module.exports = {

 entureauthenticated: function (req, res, next){

    if (req.isAuthenticated()) {
        console.log('user authenticated redirected to dashboard');
        return next();
    }
   return res.redirect('/');
} ,
 
redirectdashboard : function  (req,res,next){

    if(req.isAuthenticated()){
        console.log('user authenticated and redirected to dashboard');
        return res.redirect('/dashboard');
    }
   return next();
},

entureboss : function (req,res,next){
    if(req.isAuthenticated()){
        if(req.user.boss == true){
            return next();
        }
        console.log('you must be a boss to access dashboard');
        return res.redirect('/employee/dashboard');
    }
    console.log('not authenticated');
    return res.redirect('/');
   
},
entureemployee : function (req,res,next){
    if(req.isAuthenticated()){
        if(req.user.boss == false){
            return next();
        } 
        console.log('you must be a employee to access dashboard');
        return res.redirect('/boss/dashboard');
    }
    console.log('not authenticated');
    return res.redirect('/');
   
}

}