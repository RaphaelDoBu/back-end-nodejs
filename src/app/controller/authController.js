const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');
const mailer = require('../../module/mailer');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async(req, res) =>{
    const {email} = req.body;
    
    try{
        if(await User.findOne({email})){
            return res.status(400).send({error: 'User already exists'});
        }
        const user = await User.create(req.body);
        user.password = undefined;
        return res.send({user, token: generateToken({id: user.id})});
    } catch (err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/authenticate', async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).send({error: 'User not found'})
    }
    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({error: 'Invalid password'})
    }

    user.password = undefined;

    res.send({user, token: generateToken({id: user.id})});
});

router.post('/forgot_password', async(req, res) => {
    const{email} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).send({erro: 'User not found'})
        }
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now
            },
        },{ new: true, useFindAndModify: false });

        mailer.sendMail({
            to: email,
            from: 'raphaeldobu@gmail.com',
            template: 'auth/forgot_password',
            context: {token}
        }, (err) =>{
            console.log(err)
            if(err){
                return res.status(400).send({error: 'Cannot send forgot password email'});
            }
            return res.send();
        })
    } catch(err) {
        console.log(err)
        res.status(400).send({error: 'Erro on forgot password, try again'});
    }

});

router.post('/reset_password', async(req, res) =>{
    const {email, token, password} = req.body;

    try{
        //Pega esses dois campos a mais pq eles estão como select false
        const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');

        if(!user){
            return res.status(400).send({erro: 'User not found'});
        }

        if(token !== user.passwordResetToken){
            return res.status(400).send({erro: 'Token invalid'});
        }

        const now = new Date();

        if(now > user.passwordResetExpires){
            return res.status(400).send({erro: 'Token expired, generate a now one'});
        };

        user.password = password;

        await user.save();
        res.send();

    } catch(err){
        res.status(400).send({error: 'Cannot reset password, try again'})
    }
});

module.exports = app => app.use('/auth', router);