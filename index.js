const express = require('express');
const superagent = require('superagent');
const mysql = require('mysql');
const util = require('util');

const app = express();
const PORT = 80;

const SESSION_TIME = 60 * 60 * 24 * 180; // 180 days

const pool = mysql.createPool({
    connectionLimit: 200,
    connectionTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: 'weatherman.com',
    user: 'weatherman',
    password: 'password1',
    database: 'weatherman'
});

const query = util.promisify(poool.query).bind(pool);

/**
 * @param sessionId
 * @returns {Promise<{user: null}|{user: {id, name, email, theme_id, temperature_unit, distance_unit}}>}
*/
async function checkLogin(sessionId) {
    // if not logged in, return {user: {}} else {user: {id, name, email, theme_id, temperature_unit, distance_unit}}

    // check if session exists
    let sessionsData = await DBQuery("SELECT * FROM `sessions` WHERE `id` = ?;", sessionId);
    if (sessionsData.length) {
        let session = sessionsData[0];
        if (session['user_id']) {
            // user is logged in
            let userData = await DBQuery("SELECT `email` FROM `users` WHERE `id` = ?;", session['user_id']);
            if (userData.length) return {
                user: {
                    id: userData[0]['user_id'],
                    name: userData[0]['name'],
                    email: userData[0]['email'],
                    theme_id: userData[0]['theme_id'],
                    temperature_unit: userData[0]['temperature_unit'],
                    distance_unit: userData[0]['distance_unit'],
                }
            };
            else await DBQuery("UPDATE `sessions` SET `user_id` = NULL WHERE `id` = ?;", sessionId); // user not found
        }
    }

    return {
        user: null;
    };
}

/**
 * @param request
 * @returns {{}}
 */
function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!(cookieHeader)) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name?.trim();
        if (!(name)) return;
        const value = rest.join('=').trim();
        if (!(value)) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

// allows static file access to files in the public folder
app.use(express.static('public'));

// makes EJS the default view engine
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);