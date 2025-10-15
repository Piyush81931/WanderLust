const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {isLoggedIn} = require("../middleware.js");
const {saveRedirectUrl} = require("../middleware.js");


router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newuser =   new User({username, email});
        let registered  = await User.register(newuser, password);
        console.log(registered);
        req.login(registered, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
        
}))

router.get("/login", (req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",saveRedirectUrl,
            passport.authenticate("local",
            {failureRedirect:"/login",
            failureFlash:true}),
            async (req,res)=>{

                req.flash("success", "Welcome Back to WanderLust");
                const redirectUrl = res.locals.redirectUrl || "/listings";
                res.redirect(redirectUrl); 

})

router.get("/logout",isLoggedIn,(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next();
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
})





// Become Owner Route
router.post("/become-owner", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.role = "owner";
    await user.save();
    req.flash("success", "You are now an owner!");
    res.redirect("/owner/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to update role.");
    res.redirect("/profile");
  }
});



module.exports = router;