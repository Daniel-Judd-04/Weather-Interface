// Called on load.
// Used to set everything up
start = () => {
    // Sort the cities
    sortResults();

    // Add the days and hours to the HTML
    addDays();
    addHours();

    // Create hourly forecast graphs
    createGraph();

    // Search for user location and get weather data
    getUserLocation('search-bar');

    // Get accounts from local storage
    // getAccounts();
}

// ===== ACCOUNTS =====

let Accounts = [];
let currentAccount = null;

// Account class to act as users table
// Stores information locally so users can reload page
class Account {
    constructor(username, email, password, settings, history, NEW) {
        // DETAILS
        this.username = username;
        this.email = email;
        // SETTINGS
        this.settings = settings;
        // LOCATION
        this.history = history;
        if (NEW) {
            this.password = this.encryptPassword(password);
            this.favourite = this.getFavourite(NEW);
        } else {
            this.password = password;
            this.favourite = this.getFavourite(NEW);
        }
    }

// encrypt user password 
    encryptPassword = (password) => {
        let letters = password.split('');
        let nums = [];

        // For each letter
        for (let i = 0; i < letters.length; i++) {
            // Multiple the char code by the next char code 
            if (i < letters.length - 1) nums.push(letters[i].charCodeAt(0) * (letters[i + 1].charCodeAt(0) + 5012));
        }

        // Return the joined numbers
        return nums.join("");
    }

// Finds the users most search for city
    getFavourite = (NEW) => {
        // no searches have been made
        if (this.history.length == 0) return null;

        let modeMap = {};
        let maxEl = this.history[0]
        let maxCount = 1;

        // For each user search history
        for (let i = 0; i < this.history.length; i++) {
            let el = this.history[i];
            if (modeMap[el] == null) modeMap[el] = 1;
            else modeMap[el]++;
            if (modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }

        // Automattically search for the users most searched city
        if (NEW) {
            document.getElementById('search-bar').value = maxEl;
            searchCommit('search-bar', 'pass');
        }

        return maxEl;
    }
}

// Get accounts from local storage and store them as a string
getAccounts = () => {
    AccountsArray = localStorage.getItem("Accounts").split('#-#');
    for (let i = 0; i < AccountsArray.length; i++) {
        AccountAttributes = AccountsArray[i].split('-|-');
        let user = new Account(AccountAttributes[0], AccountAttributes[1], AccountAttributes[2], AccountAttributes[3].split('-/-'), AccountAttributes[4].split('-/-'), false);
        Accounts.push(user);
    }
}

// Create account string to be added to local storage
AccountsString = () => {
    let AccountsArray = [];
    let AccountAttributes = [];

    for (let i = 0; i < Accounts.length; i++) {
        AccountAttributes = [];
        AccountAttributes.push(Accounts[i].username);
        AccountAttributes.push(Accounts[i].email);
        AccountAttributes.push(Accounts[i].password);
        AccountAttributes.push(Accounts[i].settings.join('-/-'));
        AccountAttributes.push(Accounts[i].history.join('-/-'));
        AccountsArray.push(AccountAttributes.join('-|-'));
    }
    return AccountsArray.join('#-#');
}

// Save accounts in local storage
saveSettings = () => {
    localStorage.setItem("Accounts", AccountsString());
    console.log(localStorage.getItem("Accounts"));
}

// Login. Check username and password match users profile. Check username and password match regex
login = () => {
    username = document.getElementById('login-username').value;
    password = document.getElementById('login-password').value;

    // Go through 
    for (let i = 0; i < Accounts.length; i++) {
        // If 
        if ((Accounts[i].username == username) && (Accounts[i].password == Accounts[i].encryptPassword(password))) {
            currentAccount = Accounts[i];
            document.getElementById('account-button').innerHTML = currentAccount.username + '<span class="material-symbols-outlined button-symbol">logout</span>';
            document.getElementById('account-button').onclick = function () { logOut() };
            closePopUp(document.getElementById('account-container'));
            currentAccount.favourite = currentAccount.getFavourite(true);
        }
    }
    // Tell the user the details are incorrect
    if (currentAccount == null) displayMessage('Username or password incorrect!');

    // Remove the password from local storage for security
    password = null;
}

// Check if the account already exists
newAccount = (username) => {
    // check all accounts to see if they have the same username
    for (let i = 0; i < Accounts.length; i++) {
        if (Accounts[i].username == username) return false; // Account already exists
    }
    // if no account is found the allow
    return true;
}


// Sign Up. Check that all fields entered are acceptable. Then create the account
signUp = () => {
    // Get the users details from elements
    username = document.getElementById('sign-up-username').value;
    email = document.getElementById('sign-up-email').value;
    password = document.getElementById('sign-up-password').value;
    confirmPassword = document.getElementById('sign-up-confirm').value;

    // Check that all inputted values are valid
    if ((newAccount(username)) && (password == confirmPassword) && (password != '') && (username != '') && (String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))) {
        // Create an account with the users details
        let user = new Account(username, email, password, [], [], true);
        // Add the user to the current accounts
        Accounts.push(user);
        // save this new account
        saveSettings();

        // set current account
        currentAccount = Accounts[Accounts.length - 1];

        // change certain elements to show the user they have logged in
        document.getElementById('account-button').innerHTML = currentAccount.username + '<span class="material-symbols-outlined button-symbol">logout</span>';
        document.getElementById('account-button').onclick = function () { logOut() };
        // Close the sign up popup for the user
        closePopUp(document.getElementById('account-container'));
    } else { // Find what error to display to user
        if (password != confirmPassword) displayMessage('Passwords not identical!');
        else if (password == '') displayMessage('Enter password!');
        else if (username == '') displayMessage('Enter username!');
        else if (!String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) displayMessage('Enter a valid email address!');
        else if (!newAccount(username)) displayMessage('Account already exists');
    }

    password = null;
    confirmPassword = null;
}

// Called via button. Logs user out and saves their settings
logOut = () => {
    saveSettings();
    document.getElementById('account-button').innerHTML = '<span class="material-symbols-outlined button-symbol">person</span>';
    document.getElementById('account-button').onclick = function () { openPopUp(document.getElementById('account-container')) };
    displayMessage(currentAccount.username + " has been logged out!");
    currentAccount = null;
}

// Creates and displays a message to the user.
displayMessage = (message) => {
    document.getElementById('user-message').innerHTML = message;
    document.getElementById('user-message').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('user-message').style.opacity = '1';
        document.getElementById('user-message').style.transform = 'translate(-50%, 30px)';
    }, 1);
    setTimeout(() => {
        document.getElementById('user-message').style.opacity = '';
        setTimeout(() => {
            document.getElementById('user-message').style.display = '';
            document.getElementById('user-message').style.transform = '';
        }, 300);
    }, 2000);
}

// ===== HTML ELEMENTS =====

// Add 10 days to HTML
addDays = () => {
    element = document.getElementById('daily-container');

    // For each day
    for (let i = 0; i < 10; i++) {
        let day = document.createElement('div');
        day.className = "day flex-col";
        day.id = 'day-' + i;
        day.onclick = function () { focusDay(this) };

        // WHEN NORMAL

        let date = document.createElement('div');
        date.className = "date";
        date.id = 'day-' + i + '-data-0';

        let icon = document.createElement('div');
        icon.className = "day-icon flex-row";
        icon.id = 'day-' + i + '-data-1';
        icon.onclick = function () { displayMessage('This symbol means: ' + icon.firstElementChild.innerHTML.split('_').join(' ')); };

        let range = document.createElement('div');
        range.className = "day-range flex-col";
        range.id = "range-" + i;

        let high = document.createElement('div');
        high.className = "high-temp";
        high.id = 'day-' + i + '-data-2';

        let low = document.createElement('div');
        low.className = "low-temp";
        low.id = 'day-' + i + '-data-3';

        range.appendChild(high);
        range.appendChild(low);

        // WHEN FOCUSED

        let expand = document.createElement('div');
        expand.className = 'expand';
        expand.id = 'expand-' + i;


        let left = document.createElement('div');
        left.className = 'day-details-left flex-col';

        let right = document.createElement('div');
        right.className = 'day-details-right flex-col';


        let UVIndex = document.createElement('div');
        UVIndex.className = "day-detail flex-row";
        UVIndex.id = 'day-' + i + '-data-4';

        let humidity = document.createElement('div');
        humidity.className = "day-detail flex-row";
        humidity.id = 'day-' + i + '-data-5';

        let airQual = document.createElement('div');
        airQual.className = "day-detail flex-row";
        airQual.id = 'day-' + i + '-data-6';

        let pollen = document.createElement('div');
        pollen.className = "day-detail flex-row";
        pollen.id = 'day-' + i + '-data-7';

        let dew = document.createElement('div');
        dew.className = "day-detail flex-row";
        dew.id = 'day-' + i + '-data-8';

        let wind = document.createElement('div');
        wind.className = "day-detail flex-row";
        wind.id = 'day-' + i + '-data-13';
        
        // Add elements to parents
        left.appendChild(wind);
        left.appendChild(pollen);
        left.appendChild(UVIndex);

        right.appendChild(humidity);
        right.appendChild(airQual);
        right.appendChild(dew);

        // Add widgets

        let twilight = document.createElement('div');
        twilight.className = 'day-expand-widget day-twilight flex-col';

        let sym = document.createElement('div');
        sym.className = 'twilight-symbol'
        sym.innerHTML = '<span class="material-symbols-outlined">wb_twilight</span>';


        let sunrise = document.createElement('div');
        sunrise.className = 'sunrise flex-row';
        sunrise.id = 'day-' + i + '-data-9';

        let sunset = document.createElement('div');
        sunset.className = 'sunset flex-row';
        sunset.id = 'day-' + i + '-data-10';

        twilight.appendChild(sym);
        twilight.appendChild(sunrise);
        twilight.appendChild(sunset);

        let rain = document.createElement('div');
        rain.className = 'day-expand-widget day-rain flex-row';
        rain.id = 'day-' + i + '-data-11';

        let temp = document.createElement('div');
        temp.className = 'day-expand-widget day-temp flex-row';
        temp.id = 'day-' + i + '-data-12';

        // 

        expand.appendChild(left);
        expand.appendChild(right);
        expand.appendChild(temp);
        expand.appendChild(rain);
        expand.appendChild(twilight);

        // ADD all elements to day (parent)

        day.appendChild(icon);
        day.appendChild(date);
        day.appendChild(range);
        day.appendChild(expand);

        // ADD to day-container

        element.appendChild(day);
    }
}

// Add 36 hours to HTML
addHours = () => {
    let element = document.getElementById('hourly-container');
    // For each hour
    for (let i = 0; i < 36; i++) {
        let hour = document.createElement('div');
        hour.className = 'hour-container flex-col';

        let temp = document.createElement('div');
        temp.className = 'hour-temp flex-row';
        temp.id = 'hour-' + i + '-data-0';

        hour.appendChild(temp);

        // RAIN %

        let rain = document.createElement('div');
        rain.className = 'hour-rain';
        rain.id = 'hour-' + i + '-data-1';

        hour.appendChild(rain);

        // TIME

        let time = document.createElement('div');
        time.className = 'hour-time flex-row';
        time.id = 'hour-' + i + '-data-2';

        hour.appendChild(time);
        element.appendChild(hour);
    }
}

// ===== HTML ANIMATIONS =====

// Called when day is clicked. Opens a certain day and reveals extra information.
focusDay = (daySelect) => {
    document.getElementById('exit').style.display = 'flex';
    setTimeout(() => { document.getElementById('exit').style.opacity = 1 }, 300);

    // Set ALL to SMALL
    for (let i = 0; i < dailyData.length; i++) {
        document.getElementById('day-' + i).style.height = '0';
        document.getElementById('day-' + i).style.opacity = '0';
        document.getElementById('day-' + i).style.borderBottom = '0';
        document.getElementById('range-' + i).style.display = 'none';
    }

    // Set SELECTED to BIG
    daySelect.style.height = '100%';
    daySelect.style.opacity = '1';

    currentDay = daySelect.id[4];

    document.getElementById('expand-' + currentDay).style.display = 'block';
    document.getElementById('expand-' + currentDay).style.backgroundImage = "url('imgs/Weather Backgrounds/" + dailyData[currentDay].weather[0].icon + ".jpg')";
    // imgs/Weather Backgrounds/10d.jpg
    setTimeout(() => {
        document.getElementById('expand-' + currentDay).style.opacity = '1';
    }, 1);
}

// Called when CLOSE button is clicked. RESETS all days
closeDay = () => {
    setTimeout(() => { document.getElementById('exit').style.display = 'none' }, 200);
    document.getElementById('exit').style.opacity = 0;

    // Set ALL to NORMAL
    for (let i = 0; i < dailyData.length; i++) {
        document.getElementById('day-' + i).style.height = '';
        document.getElementById('day-' + i).style.opacity = '';
        document.getElementById('day-' + i).style.borderBottom = '';

        document.getElementById('day-' + i).style.backgroundImage = 'none';

        document.getElementById('range-' + i).style.display = '';

        setTimeout(() => { document.getElementById('expand-' + i).style.display = '' }, 200);
        document.getElementById('expand-' + i).style.opacity = '';
    }
}

// Called when user clicks 'See More' on the NOW section.
// Opens / Closes the INFO on the NOW section.
seeMore = () => {
    if (!isExpanded()) {
        document.getElementById('details').style.display = 'block';
        setTimeout(() => { document.getElementById('details').style.opacity = 1 }, 400);
        document.getElementById('see-more').innerHTML = 'See Less';
        document.getElementById('info-container').style.height = 'calc(70vh - 30px)';
        updateMaps('search-bar', dailyDataJSON.city.coord.lon, dailyDataJSON.city.coord.lat, getZoomLevel(), 400);
        if (currentLocation) document.getElementById('current-location-pin').style.opacity = '0';
    } else {
        document.getElementById('details').style.opacity = 0
        setTimeout(() => { document.getElementById('details').style.display = 'none'; }, 400);
        document.getElementById('see-more').innerHTML = 'See More';
        document.getElementById('info-container').style.height = '24vh';
        updateMaps('search-bar', dailyDataJSON.city.coord.lon, dailyDataJSON.city.coord.lat, getZoomLevel(), 400);
        if (currentLocation) document.getElementById('current-location-pin').style.opacity = '1';
    }
}

// Open POP UP
openPopUp = (popUpType) => {
    document.getElementById('background-cover').style.display = 'block';
    popUpType.style.display = 'block';

    setTimeout(() => {
        document.getElementById('background-cover').style.opacity = '1';
        popUpType.style.opacity = '1';
        popUpType.style.transform = 'translate(-50%, -50%)';
    }, 1);

    // This is to show login first and hide the sign up
    if (popUpType.id == 'account-container') {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('sign-up-container').style.display = 'none';
        //popUpType.style.height = '39vh';
    }

    document.body.style.overflow = 'hidden';
}

// Closes POP UP
closePopUp = (popUpType) => {
    document.getElementById('background-cover').style.opacity = '0';
    popUpType.style.opacity = '0';
    // Hide element after the animations are done
    setTimeout(() => {
        document.getElementById('background-cover').style.display = 'none';
        popUpType.style.display = 'none';
        popUpType.style.transform = 'translate(-50%, -30%)';
    }, 300);

    document.body.style.overflow = 'auto';
}

// Reveals website
revealWebsite = () => {
    element = document.getElementById('website-cover');

    // Make the cover hide
    element.style.height = '0';
    setTimeout(() => {
        // Remove the cover to allow user to click elements
        element.style.display = 'none';
    }, 500);
}

// ===== CHANGE SETTINGS =====

let contrastActive = false;
let selections = [['temp', 'rain', 'wind'], ['normal', 'dark', 'light', 'contrast', 'pink', 'question'], ['cen', 'far', 'kel'], ['metric', 'imperial'], ['off', 'four', 'two', 'one'], ['walk', 'cycle', 'bus', 'train']];

// Called when ever a selection is changed.
// Updates the required settings when they are changed by user.
// Sets the selected option to BolTxt
changeSelect = (selection, distance) => {
    selection.parentElement.firstElementChild.style.transform = distance;

    for (let i = 0; i < selections.length; i++) {
        if (selections[i].includes(selection.id)) {
            for (let j = 0; j < selections[i].length; j++) {
                document.getElementById(selections[i][j]).firstElementChild.style.color = 'var(--NorTxt)';
            }
            if (i == 0) { // MAP overlay

            } else if (i == 1) { // COLOR style
                changeColours(selection);
            } else if (i == 2) { // TEMP unit
                updateHours();
                updateDays();
                updateNow();
            } else if (i == 3) { // DISTANCE unit
                updateDays();
                updateNow();
            } else if (i == 4) { // Frequncy

            }
        }
    }
    selection.firstElementChild.style.color = 'var(--BolTxt)';
}

// Sets the website to a different theme.
// Also changes the logo to fit theme.
changeColours = (selection) => {
    // Change css vars with js using selection index and COLOURS array
    // Go through each colour selection
    for (let i = 0; i < selections[1].length; i++) {
        if (selection.id == selections[1][i]) {
            // Go through each colour hex
            for (let j = 0; j < VARS.length; j++) {
                // Update the CSS variables
                document.querySelector(':root').style.setProperty(VARS[j], COLORS[i][j])
            }
        }
    }

    // if contrast selected, set transparent backgrounds none
    if (selection.id == 'contrast') {
        for (let i = 0; i < dailyData.length; i++) document.getElementById('day-' + i).style.backgroundImage = 'none';
        contrastActive = true;
    } else {
        for (let i = 0; i < dailyData.length; i++) document.getElementById('day-' + i).style.backgroundImage = "url('/imgs/Weather Backgrounds/" + dailyData[i].weather[0].main + ".jpg')";
        contrastActive = false;
    }

    // Update the website logo to the chosen colour
    if (selection.id == 'light') {
        document.getElementById('logo').src = 'imgs/Logos/Light_Logo.png';
    } else if (selection.id == 'dark') {
        document.getElementById('logo').src = 'imgs/Logos/Dark_Logo.png';
    } else if (selection.id == 'contrast') {
        document.getElementById('logo').src = 'imgs/Logos/Contrast_Logo.png';
    } else if (selection.id == 'pink') {
        document.getElementById('logo').src = 'imgs/Logos/Pink_Logo.png';
    } else {
        document.getElementById('logo').src = 'imgs/Logos/Normal_Logo.png';
    }
}

// ===== HTML UPDATES =====

let Symbols = ['flare', 'humidity_mid', 'lens_blur', 'local_florist', 'thermometer', 'contrast', 'contrast', 'water_drop', 'device_thermostat', 'air'];
let Units = ['', '%', '', '', '°', '', '', '%', '°', ''];
let TIMEZONE;

// Update each day using API data.
updateDays = () => {
    for (let i = 0; i < dailyData.length; i++) {
        // date, wind, symbol, temp, high, low, humidity, visibility
        document.getElementById('day-' + i + '-data-0').innerHTML = convertDate(dailyData[i].dt); // DATE
        document.getElementById('day-' + i + '-data-1').innerHTML = '<img class="day-icon-img" src="imgs/Weather Icons/' + dailyData[i].weather[0].icon + '.png">' // SYMBOL

        document.getElementById('day-' + i + '-data-2').innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>' + convertTemp(dailyData[i].temp.max) + '°'; // HIGH
        document.getElementById('day-' + i + '-data-3').innerHTML = '<span class="material-symbols-outlined">arrow_downward</span>' + convertTemp(dailyData[i].temp.min) + '°'; // LOW

        document.getElementById('day-' + i + '-data-4').innerHTML = '<span class="material-symbols-outlined">cloud</span>' + dailyData[i].clouds + '%'; // CLOUDS
        document.getElementById('day-' + i + '-data-5').innerHTML = '<span class="material-symbols-outlined">humidity_mid</span>' + dailyData[i].humidity + '%'; // HUM
        document.getElementById('day-' + i + '-data-6').innerHTML = '<span class="material-symbols-outlined">speed</span>' + convertDistance(dailyData[i].pressure, 'pressure'); // PRESSURE
        document.getElementById('day-' + i + '-data-7').innerHTML = '<span class="material-symbols-outlined">air</span>' + convertDistance(dailyData[i].gust, 'speed'); // GUST
        document.getElementById('day-' + i + '-data-8').innerHTML = '<span class="material-symbols-outlined">rainy</span>' + convertDistance(dailyData[i].rain, 'rain'); // RAIN

        document.getElementById('day-' + i + '-data-9').innerHTML = convertTime(dailyData[i].sunrise + TIMEZONE); // SUNRISE
        document.getElementById('day-' + i + '-data-10').innerHTML = convertTime(dailyData[i].sunset + TIMEZONE); // SUNSET

        document.getElementById('day-' + i + '-data-11').innerHTML = '<span class="material-symbols-outlined">water_drop</span>' + Math.round(dailyData[i].pop * 100) + '%'; // RAIN
        document.getElementById('day-' + i + '-data-12').innerHTML = '<span class="material-symbols-outlined">device_thermostat</span>' + convertTemp(dailyData[i].temp.day) + '°'; // TEMP

        document.getElementById('day-' + i + '-data-13').innerHTML = '<span class="material-symbols-outlined">wind_power</span>' + convertDistance(dailyData[i].speed, 'speed'); // WIND
    }
}

// Update each hour using API data.
updateHours = () => {
    let lowest = hourlyData[0].main.temp;
    let highest = hourlyData[0].main.temp;

    for (let i = 0; i < hourlyData.length; i++) {
        // temp, rain, humidity, time
        document.getElementById('hour-' + i + '-data-0').innerHTML = convertTemp(hourlyData[i].main.temp) + '°'; // TEMP
        if (i % 1 == 0) document.getElementById('hour-' + i + '-data-1').innerHTML = Math.round(hourlyData[i].pop * 100) + '%'; // RAIN
        if (i % 3 == 0) {
            if (i == 0) document.getElementById('hour-' + i + '-data-2').innerHTML = 'Now';
            else if (i == 24) document.getElementById('hour-' + i + '-data-2').innerHTML = '+24hrs';
            else document.getElementById('hour-' + i + '-data-2').innerHTML = convertTime(hourlyData[i].dt + TIMEZONE); // TIME
        }

        // Set new high or low if needed
        if (hourlyData[i].main.temp < lowest) lowest = hourlyData[i].main.temp;
        else if (hourlyData[i].main.temp > highest) highest = hourlyData[i].main.temp;
    }

    // Calculate the position of the temp.
    let range = highest - lowest;

    // Give each temp a different top style
    for (let i = 0; i < hourlyData.length; i++) {
        percent = (hourlyData[i].main.temp - lowest) / range;
        document.getElementById('hour-' + i + '-data-0').style.top = (4 - (3 * percent)) + 'vh';
    }
    // Create a new graph
    createGraph();
}

// Update the NOW section using API data.
updateNow = () => {
    // Update the date and time
    document.getElementById('now-0').innerHTML = convertDate(nowDataJSON.dt + TIMEZONE);
    document.getElementById('now-1').innerHTML = convertTime(nowDataJSON.dt + TIMEZONE);

    // Update the weather icon, temperature and description
    document.getElementById('now-2').innerHTML = "<img src='imgs/Weather Icons/" + nowDataJSON.weather[0].icon.substring(0, 2) + "d.png'>" + convertTemp(nowDataJSON.main.temp) + '°';
    document.getElementById('now-3').innerHTML = convertTemp(nowDataJSON.main.feels_like) + '°';
    document.getElementById('now-4').innerHTML = "Currently " + nowDataJSON.weather[0].description;

    // Update all other data
    document.getElementById('now-5').innerHTML = convertTemp(nowDataJSON.main.temp_max) + '°';
    document.getElementById('now-6').innerHTML = convertTemp(nowDataJSON.main.temp_min) + '°';
    document.getElementById('now-7').innerHTML = convertDistance(nowDataJSON.wind.speed, 'speed');
    document.getElementById('now-8').innerHTML = nowDataJSON.clouds.all + '%';
    document.getElementById('now-9').innerHTML = nowDataJSON.main.humidity + '%';
    document.getElementById('now-10').innerHTML = convertDistance(nowDataJSON.visibility, 'visibility');
    document.getElementById('now-11').innerHTML = convertDistance(nowDataJSON.main.pressure, 'pressure');
    document.getElementById('now-12').innerHTML = convertTime(nowDataJSON.sys.sunrise + TIMEZONE);
    document.getElementById('now-13').innerHTML = convertTime(nowDataJSON.sys.sunset + TIMEZONE);
}

// ===== HOURLY GRAPHS =====

let newTempGraph, newRainGraph;
let chart = null;

// Create the graph and set its styling parameters
createGraph = () => {
    tempGraph = document.getElementById('hourly-graph').getContext("2d");

    let tempDataSet = [];
    let timeDataSet = [];
    
    // Add temps to array for graph
    for (i = 0; i < hourlyData.length; i++) {
        tempDataSet.push(convertTemp(hourlyData[i].main.temp, true));
        timeDataSet.push(hourlyData[i].dt);
    }

    // destroy any old graphs
    if (chart != null) chart.destroy();

    // create graph and style
    chart = new Chart(tempGraph, {
        // Set graph type
        type: 'line',
        data: {
            // x-axis data
            labels: timeDataSet,
            datasets: [{
                pointRadius: 0,
                // y-axis data
                data: tempDataSet,
                // Set graph line width
                borderWidth: 2,
                fill: true,
                // Set graph colours
                borderColor: "#D17400",
                backgroundColor: "rgba(209, 116, 0, 0.5)"
            }]
        },
        options: {
            // Remove any extra styling
            legend: {
                display: false,
            },
            // Correctly align graph
            layout: {
                padding: {
                    left: -10
                }
            },
            // Remove axis visibility
            scales: {
                xAxes: [{
                    display: false,
                    gridLines: {
                        // Make lines invisible by setting transparency to 0
                        color: "rgba(0, 0, 0, 0)",
                    }
                }],
                yAxes: [{
                    display: false,
                    gridLines: {
                        // Make lines invisible by setting transparency to 0
                        color: "rgba(0, 0, 0, 0)",
                    }   
                }]
            }
        }
    });
}

// ===== CONVERSIONS =====

// Convert distance measurements between imperial and metric. Speed, visibility, rain and pressure.
convertDistance = (measurement, measurementType) => {
    if (measurementType == 'speed') {
        if (document.getElementById('selector-distance-mode').style.transform == 'translateX(2.5vh)') { // Imperial
            return Math.round(measurement * 223.7) / 100 + ' mph';
        } else { // Metric
            return Math.round(measurement * 36) / 10 + ' km/h';
        }
    } else if (measurementType == 'visibility') {
        if (document.getElementById('selector-distance-mode').style.transform == 'translateX(2.5vh)') { // Imperial
            return Math.round(measurement / 160.9) / 10 + ' mi';
        } else { // Metric
            return Math.round(measurement / 100) / 10 + ' km';
        }
    } else if (measurementType == 'rain') { 
        if (document.getElementById('selector-distance-mode').style.transform == 'translateX(2.5vh)') { // Imperial
            return Math.round(measurement / 2.54) / 10 + ' in';
        } else { // Metric
            return measurement + ' mm';
        }
    } else if (measurementType == 'pressure') {
        if (document.getElementById('selector-distance-mode').style.transform == 'translateX(2.5vh)') { // Imperial
            return Math.round(measurement * 1.45) / 100 + ' PSI';
        } else { // Metric
            return measurement + ' hPa';
        }
    }
}

// Convert unix timestamps to date format (Mon 1 Jan)
convertDate = (unixTimestamp) => {
    let dateObject = new Date(unixTimestamp * 1000)
    return dateObject.toLocaleString("en-US", { weekday: "short" }) + " " + dateObject.toLocaleString("en-US", { day: "numeric" }) + " " + dateObject.toLocaleString("en-US", { month: "long" }) // December
}


// Convert unix timestamps to time format (12:00)
convertTime = (unixTimestamp) => {
    dateObj = new Date(unixTimestamp * 1000);
    utcString = dateObj.toUTCString();

    return (utcString.slice(-12, -7));
}

// Convert temperature units between kelvin, celsius and fahrenheit
convertTemp = (temp, exact) => { // GIVEN KELVIN
    // Do not round if exact is true
    if (exact) {
        if (document.getElementById('selector-temp-mode').style.transform == '') { // C
            return temp - 273.15;
        } else if (document.getElementById('selector-temp-mode').style.transform == 'translateX(-5vh)') { // F
            return ((temp - 273.15) * (9 / 5)) + 32;
        } else if (document.getElementById('selector-temp-mode').style.transform == 'translateX(5vh)') { // K
            return temp;
        }
    } else {
        if (document.getElementById('selector-temp-mode').style.transform == '') { // C
            return Math.round(temp - 273.15);
        } else if (document.getElementById('selector-temp-mode').style.transform == 'translateX(-5vh)') { // F
            return Math.round(((temp - 273.15) * (9 / 5)) + 32);
        } else if (document.getElementById('selector-temp-mode').style.transform == 'translateX(5vh)') { // K
            return Math.round(temp);
        }
    }
}

// ===== SEARCH RESULTS =====

let currentResult = -1; // Used in search results
let results = ['Current Location']; // Array of search results. Always has current location available
let currentLocation = true;

// Removes all results and then adds new results.
// Called when a letter is added to search bar.
updateAutoFill = (search) => {
    removeResults(search);
    results = ['Current Location'];
    if (search.value.length > 0) addResults(search);
}

// Called on load.
// Creates search tags using city, country, state and group.
// Sorts the cities in terms of population.
sortResults = () => {
    // Go through each city
    for (let i = 0; i < CITIES.length; i++) {
        // Determine whether it is normal, group, state or capital city
        // And format its display name and search tags accordingly
        if (CITIES[i][4] == '') {
            CITIES[i][6] = CITIES[i][0] + ", " + CITIES[i][1]; // NORMAL [City, Country]
            CITIES[i][7] = CITIES[i][0].split(' ').join('-') + "-" + CITIES[i][1].split(' ').join('-') + "-" + CITIES[i][6] + "-" + CITIES[i][0] + "-" + CITIES[i][1]; // [CityCountry]
        } else if (CITIES[i][4].substring(0, 2) == '1-') {
            CITIES[i][6] = CITIES[i][0] + ", " + CITIES[i][4].substring(2) + ", " + CITIES[i][1]; // [City (State), Country]
            CITIES[i][7] = CITIES[i][0].split(' ').join('-') + "-" + CITIES[i][4].substring(2).split(' ').join('-') + "-" + CITIES[i][1].split(' ').join('-') + "-" + CITIES[i][6] + "-" + CITIES[i][0] + "-" + CITIES[i][1] + "-" + CITIES[i][4].substring(2); // [CityStateCountry]
        } else if (CITIES[i][4].substring(0, 2) == '2-') {
            CITIES[i][6] = CITIES[i][0] + ", " + CITIES[i][1] + " (" + CITIES[i][4].substring(2) + ")"; // GROUP [City, Country (Group)]
            CITIES[i][7] = CITIES[i][0].split(' ').join('-') + "-" + CITIES[i][1].split(' ').join('-') + "-" + CITIES[i][4].substring(2).split(' ').join('-') + "-" + CITIES[i][6] + "-" + CITIES[i][0] + "-" + CITIES[i][1] + "-" + CITIES[i][4].substring(2); // GROUP [CityCountryGroup)]
        } else if (CITIES[i][4].substring(0, 2) == '3-') {
            CITIES[i][6] = CITIES[i][0] + "<span>*</span>, " + CITIES[i][1]; // CAPITAL [City[STAR], Country]
            CITIES[i][7] = CITIES[i][0].split(' ').join('-') + "-" + CITIES[i][1].split(' ').join('-') + "-*-" + CITIES[i][0] + "*, " + CITIES[i][1] + "-" + CITIES[i][0] + "-" + CITIES[i][1]; // CAPITAL [CityCountry]
        }
    }

    // Get SCORE
    for (let i = 0; i < CITIES.length; i++) CITIES[i][5] = CITIES[i][2] * CITIES[i][3];

    // SORT in terms of SCORE
    CITIES.sort(function (a, b) { return b[5] - a[5]; });
}

// Called either on exit, or search
// Finds which search bar is being used
// Removes all results.
removeResults = (search) => {
    let element;
    // Get the search element
    if (search.id == 'search-bar') element = document.getElementById('results-container');
    else if (search.id == 'search-bar-from') element = document.getElementById('results-container-from');
    else if (search.id == 'search-bar-to') element = document.getElementById('results-container-to');

    // Remove each HTML element
    while (element.firstChild) element.firstChild.remove();
    // Reset styling of search bar
    search.style.borderRadius = "2vh";
    // Reset the current result to beginning
    currentResult = -1;
}

// Called on change.
// Filters by search string, and then creates HTML results
addResults = (search) => {
    let element;
    // Get the search element
    if (search.id == 'search-bar') element = document.getElementById('results-container');
    else if (search.id == 'search-bar-from') element = document.getElementById('results-container-from');
    else if (search.id == 'search-bar-to') element = document.getElementById('results-container-to');

    // Filter Results
    // Go through each city
    for (let i = 0; i < CITIES.length; i++) {
        // Get each tag of the city
        let values = CITIES[i][7].toLowerCase().split('-');
        // console.log("VALUES :: " + CITIES[i][7].toLowerCase());
        // Go through each tag
        for (let j = 0; j < values.length; j++) {
            // See if a tag starts with the search term
            if (values[j].startsWith(search.value.toLowerCase())) {
                // Add the city to results
                results.push(CITIES[i][6]);
                // We don't need to check any more tags so break this loop
                break;
            }
        }
        // If it is main search bar, break after 20 results
        // If it is a different search bar, break after only 10 results
        // This is due to size availability on the website
        if ((search.id == 'search-bar') && (results.length >= 20)) break;
        else if (((search.id == 'search-bar-from') || (search.id == 'search-bar-to')) && (results.length >= 10)) break;
    }

    // Create Results
    // Go through each result that has been added
    for (let i = 0; i < results.length; i++) {
        // Create an element, add its attributes and add it to the results container
        let result = document.createElement('div');
        result.innerHTML = results[i];
        result.className = "result";
        result.id = 'result-' + i;
        result.onmousedown = function () { this.parentElement.parentElement.firstElementChild.value = this.textContent; searchCommit(this.parentElement.parentElement.firstElementChild.id); };
        element.appendChild(result);
    }
    // If there are no results, reset the search bar to default style
    if (results.length > 0) search.style.borderRadius = "2vh 2vh 0 0";
    else search.style.borderRadius = "15px";
}

// Resets all hover results
updateResultHover = () => {
    // Go through each result
    for (let i = 0; i < results.length; i++) {
        // Reset their style to default
        document.getElementById('result-' + i).style.background = '';
        document.getElementById('result-' + i).style.color = '';
    }
}

// Commits search if valid search
// Gets coords of search destination
searchCommit = (searchID, pass) => {
    let search = document.getElementById(searchID);

    // Check value is allowed
    if ((validSearch(search)) || (search.value == 'Current Location')) {
        // Remove the results
        removeResults(search);
        // Make user exit the search bar
        search.blur();
        if (search.id == 'search-bar') {
            console.log(search.value)
            // Determine whether thet searched for Current Location or a city
            if (search.value == 'Current Location') {
                currentLocation = true;
                if (!isExpanded()) document.getElementById('current-location-pin').style.opacity = '1';
                // Get the weather data at their location
                getUserLocation(search.id);
                // Update the current location element on the map with a 'my_location' icon
                document.getElementById('current-location').innerHTML = '<span class="material-symbols-outlined">my_location</span>' + search.value;
            } else {
                currentLocation = false;
                document.getElementById('current-location-pin').style.opacity = '0';
                // Get the weather data at the searched city
                getGeoCoords(search);
                // Update the current location element on the map with an 'explore' icon
                document.getElementById('current-location').innerHTML = '<span class="material-symbols-outlined">explore</span>' + search.value;
            }
            
            // If they are logged in, add this search to their search history
            if ((currentAccount != null) && (pass == null)) currentAccount.history.push(search.value);
        }
    }
}

// Checks if the search string is a valid search using TAGS
validSearch = (search) => {
    // Go through each city
    for (let i = 0; i < CITIES.length; i++) {
        // If the search value is in cities then return true
        // The second part of the if statement is for capital cities, as their display name contains <span> tags
        // So I need to remove the <span> tags when checking capitals
        if ((CITIES[i][6] == search.value) || (CITIES[i][0] + "*, " + CITIES[i][1] == search.value)) return true;
    }
    // If no city is found to match the searched term, return false
    return false;
}

// ===== API CALLS =====
let dailyDataJSON, hourlyDataJSON, nowDataJSON, rainADataJSON, rainBDataJSON, geoJSON; // Arrays of JSON DATA
let hourlyData = [];
let dailyData = [];
let nowData = [];
let coordsA, coordsB;

// Requests user location then gets weather data with those coords
getUserLocation = (searchId) => {
    // Check if the user allows for location to be used
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            coordsLat = position.coords.latitude;
            coordsLon = position.coords.longitude;
            userCoords = [coordsLat, coordsLon];
            console.log(userCoords);
            if (searchId == 'search-bar') getWeatherData(coordsLat, coordsLon, searchId);
            else return [coordsLat, coordsLon];
        });
    } else {
        // If user doesn't allow location
        document.getElementById('search-bar').value = 'London, England (UK)';
        searchCommit('search-bar', 'pass');
        displayMessage("Geolocation is not supported by this browser.");
    }
}

// Uses API to request coords of searched city
// then gets weather data of those coords
getGeoCoords = (search) => {
    // Make an API call with the searched city
    const httpGeocodeRequest = new XMLHttpRequest();
    httpGeocodeRequest.onload = function () {
        let geoResponse = this.responseText;
        // Store the result
        geoJSON = JSON.parse(geoResponse);
        console.log(geoJSON);
        // If main search bar get the weather data with these coords
        if (search.id == 'search-bar') getWeatherData(geoJSON[0].lat, geoJSON[0].lon, search.id);
        else return [geoJSON[0].lat, geoJSON[0].lon];
    }
    // API call
    httpGeocodeRequest.open("GET", "https://pro.openweathermap.org/geo/1.0/direct?q=" + search.value + "&limit=1&appid=a40651dfb50ee30fb55dac4c32368b7b", true); // GEO CODE
    httpGeocodeRequest.send();
}

// Gets coords of both locations searched in the transport section
getTransportLocations = () => {
    // Get the search bar elements
    locationA = document.getElementById('search-bar-from');
    locationB = document.getElementById('search-bar-to');

    if (locationA.value == 'Current Location') { // Searched for Current Location
        coordsA = getUserLocation(locationA.id);
    } else { // Searched for city
        coordsA = getGeoCoords(locationA);
    }
    if (locationB.value == 'Current Location') { // Searched for Current Location
        coordsB = getUserLocation(locationB.id);
    } else { // Searched for city
        coordsB = getGeoCoords(locationB);
    }
    // Get the rain data
    getRainData(coordsA, 'A');
}


// Requests the weather (rain) data of the locations searched in the transport section using an API
getRainData = (coords, locationType) => {
    // Get the hourly forecast for the search location
    const httpRainRequest = new XMLHttpRequest();
    httpRainRequest.onload = function () {
        let rainResponse = this.responseText;
        // Store the data
        if (locationType == 'A') {
            rainADataJSON = JSON.parse(rainResponse);
            getRainData(coordsB, 'B');
        } else {
            rainBDataJSON = JSON.parse(rainResponse);
            // Once both sets of data are stored calculate
            calculateTransport();
        }
    }
    // API call
    httpRainRequest.open("GET", "https://api.openweathermap.org/data/2.5/forecast/hourly?lat=" + coords[0] + "&lon=" + coords[1] + "&appid=a40651dfb50ee30fb55dac4c32368b7b", true); // NOW
    httpRainRequest.send();
}

// Uses the population of the searched city to define the zoom level of the map
let geoCity, dailyCity = '';
getZoomLevel = (cityPopulation = null) => {
    if (cityPopulation != null) { // Check if it has been called manually
        return Math.floor(((Math.log(22000000 / cityPopulation)) / Math.log(22000000)) * 7) + 9;
    } else { // Normal sequence
        // Get either city name or local geo name
        if (dailyDataJSON != null) dailyCity = dailyDataJSON.city.name;
        if (geoJSON != null) geoCity = geoJSON[0].name;
        
        // Find the population of the searched city
        let population = null;
        for (let i = 0; i < CITIES.length; i++) {
            if ((CITIES[i][0] == geoCity) || (CITIES[i][0] == dailyCity)) population = CITIES[i][3];
        }
        // If city not found in database
        if (population == null) return 10;

        // Map the population to an integer between 16 and 10
        // 9 MIN (City), 15 MAX (City)
        // FLOOR for integer. LOG for correct scaling. Map to range of 10-16
        return Math.floor(((Math.log(22000000 / population)) / Math.log(22000000)) * 6) + 10;
    }
}

// Given LAT, LON and search bar id.
// Requests Daily, Hourly and Current data using LAT and LON through API
// Then sets the data in arrays
// calls the update settings
// Then updates maps
getWeatherData = (LAT, LON, searchId = 'search-bar') => {
    const httpDayRequest = new XMLHttpRequest();
    httpDayRequest.onload = function () {
        let dailyResponse = this.responseText;
        // Store API response
        dailyDataJSON = JSON.parse(dailyResponse);
        console.log(dailyDataJSON);

        // Update daily containers
        setDayData();
        updateDays();

        // Close any expanded days
        closeDay();

        const httpHourRequest = new XMLHttpRequest();
        httpHourRequest.onload = function () {
            let hourlyResponse = this.responseText;
            // Store API response
            hourlyDataJSON = JSON.parse(hourlyResponse);
            console.log(hourlyDataJSON.list);

            // Update hourly containers
            setHourData();
            updateHours();

            // If first load
            if (map == null) addMaps();

            // Update the maps with the new data
            updateMaps(searchId, dailyDataJSON.city.coord.lon, dailyDataJSON.city.coord.lat, getZoomLevel());

            const httpNowRequest = new XMLHttpRequest();
            httpNowRequest.onload = function () {
                let nowResponse = this.responseText;
                // Store API response
                nowDataJSON = JSON.parse(nowResponse);
                console.log(nowDataJSON);

                // Update the current weather container
                updateNow();
            }
            // Current API cal
            httpNowRequest.open("GET", "https://api.openweathermap.org/data/2.5/weather?lat=" + LAT + "&lon=" + LON + "&appid=a40651dfb50ee30fb55dac4c32368b7b", true); // NOW
            httpNowRequest.send();
        
        }
        // Hourly API call
        httpHourRequest.open("GET", "https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=" + LAT + "&lon=" + LON + "&appid=a40651dfb50ee30fb55dac4c32368b7b&cnt=36", true); // HOURLY
        httpHourRequest.send();
    }
    // Daily API call
    httpDayRequest.open("GET", "https://api.openweathermap.org/data/2.5/forecast/daily?lat=" + LAT + "&lon=" + LON + "&appid=a40651dfb50ee30fb55dac4c32368b7b&cnt=10", true); // DAILY
    httpDayRequest.send();
}

// Uses recieved API data to add elements to an array
setHourData = () => {
    hourlyData = [];
    // Go through each hour and add the data
    for (i = 0; i < 36; i++) {
        hourlyData.push(hourlyDataJSON.list[i]);
    }
}

// Uses recieved API data to add elements to an array
// Also sets the timezone offset. This is used when displaying the time to the user.
setDayData = () => {
    // Set the timezone of the searched location
    // Used for displayed time, to show local time
    TIMEZONE = dailyDataJSON.city.timezone;
    dailyData = [];
    // Go through each day and add the data
    for (i = 0; i < 10; i++) {
        dailyData.push(dailyDataJSON.list[i]);
    }
}

// ===== TRAVEL =====

let arriveTIME, departTIME, rainTIME, minutes;
let responses = [
    'Leave<span>INT</span>minutes early, at<span>TIME</span>, to arrive at<span>TIME</span>to avoid showers.', // Avoidable
    "Showers don't stop until<span>TIME</span>. You could leave at<span>TIME</span>, to arrive<span>INT</span>minutes late at<span>TIME</span>to avoid showers.", // Avoidable but late
    'Showers are expected at all times. Leave at<span>TIME</span>,with an umbrella, to arrive at<span>TIME</span>', // Non-avoidable
    'No rain is expected at<span>TIME</span>. Leave at<span>TIME</span>, to arrive on time at<span>TIME</span>' // Clear
];

// Calculate the optimum response to display to the user. Based off of rain forecasts
calculateTransport = () => {
    summary = document.getElementById('travel-summary');
    console.log('CALC', locationA.value.length)

    // Only if search bars have content
    if ((locationA.value.length > 0) && (locationB.value.length > 0)) {
        updateMaps('transport-search-A', coordsA[0], coordsA[1], 8);
        updateMaps('transport-search-B', coordsB[0], coordsB[1], 8);
        document.getElementById('location-A').innerHTML = '<span class="material-symbols-outlined">pin_drop</span>' + locationA.value;
        document.getElementById('location-B').innerHTML = '<span class="material-symbols-outlined">pin_drop</span>' + locationB.value;


        arriveTIME = ' 15:08 ';
        departTIME = ' 16:35 ';
        rainTIME = ' 16:20 ';
        minutes = ' 15 ';

        let responeVAR = [
            [minutes, departTIME, arriveTIME],
            [rainTIME, departTIME, minutes, arriveTIME],
            [departTIME, arriveTIME],
            [rainTIME, departTIME, arriveTIME]
        ];

        responseType = 0;

        // Update HTML elements
        summary.innerHTML = responses[responseType];
        element = summary.firstElementChild;

        // For each response variable
        for (let i = 0; i < responeVAR[responseType].length; i++) {
            element.innerHTML = responeVAR[responseType][i];
            element = element.nextElementSibling;
        }

        document.getElementById('results-cover').style.height = '0';
    }
}

// ===== MAPS =====

let userLat = 0;
let userLong = 0;
let userCoords = [0, 0];
let map = null;
let mapTo, mapFrom, mapIDs;

// Create maps using openlayers
loadMaps = (target) => {
    return newMap = new ol.Map({
        target: target,
        layers: [
            new ol.layer.Tile({
                // Sets the style of the map
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            //                          LON (E, -W)    LAT (N, -S)
            center: ol.proj.fromLonLat([userCoords[0], userCoords[1]]),
            // 9 MIN (City), 15 MAX (City)
            // 3 MIN (Country), 13 MAX (Country)
            minZoom: 5,
            maxZoom: 16,
            // Default zoom (gets updated)
            zoom: 1
        })
        
    });
}

// Add main maps and travel maps 
addMaps = () => {
    // Main map
    map = loadMaps('map');
    // travel reccomendations maps
    mapTo = loadMaps('map-to');
    mapFrom = loadMaps('map-from');
    mapIDs;

    // This is final step in loading website
    // Reaveal website now that this is loaded
    revealWebsite();
}

// Update the maps with new location coords
updateMaps = (searchType, LON, LAT, ZOOM, animationTime = 3000) => { // MAKE VARIABLE TIME DEPENDING ON DISTANCE
    if (searchType == 'search-bar') mapID = map;
    else if (searchType == 'transport-search-A') mapID = mapFrom;
    else if (searchType == 'transport-search-B') mapID = mapTo;

    // Use openlayers to update the maps using the animate function
    mapID.getView().animate({
        center: ol.proj.transform([LON - (0.0175*(15 - ZOOM)*isExpanded()), LAT], 'EPSG:4326', 'EPSG:3857'),
        zoom: ZOOM,
        duration: animationTime,
      });
}

isExpanded = () => {
    return !(document.getElementById('see-more').innerHTML == 'See More');
}

// ===== KEY EVENTS =====

// Event listener for keydown
document.addEventListener('keydown', function (event) {
    let search;

    // Determine if relevant key press
    if ((event.key == 'ArrowDown') || (event.key == 'ArrowUp')) {
        // Find which search bar is being used
        if (document.getElementById('result-0').parentElement.id == 'results-container') search = document.getElementById('search-bar');
        else if (document.getElementById('result-0').parentElement.id == 'results-container-from') search = document.getElementById('search-bar-from');
        else if (document.getElementById('result-0').parentElement.id == 'results-container-to') search = document.getElementById('search-bar-to');
    }

    // Determine if relevant key press
    if (event.key == 'ArrowDown') { // Move focused result down
        currentResult++;
        // Check for overflow, if at bottom go back to top
        if (currentResult > (results.length - 1)) currentResult = 0;
    } else if (event.key == 'ArrowUp') { // Move focused result up
        currentResult--;
        // Check for underflow, is at top go back to search bar
        if (currentResult < 0) currentResult = -1;
    } else if (event.key == 'Enter') { // Commit search
        // Find which search bar is being used
        if (document.getElementById('search-bar') == document.activeElement) searchCommit('search-bar');
        else if (document.getElementById('search-bar-from') == document.activeElement) searchCommit('search-bar-from');
        else if (document.getElementById('search-bar-to') == document.activeElement) searchCommit('search-bar-to');
    }

    // Determine if relevant key press
    if ((event.key == 'ArrowDown') || (event.key == 'ArrowUp')) {
        // Update the hovered element
        updateResultHover();

        if (currentResult > -1) { // Check that currently hovering
            search.value = document.getElementById('result-' + currentResult).textContent;
            if (document.getElementById('selector-colour-mode').style.transform == 'translateX(60px)') {
                document.getElementById('result-' + currentResult).style.background = 'var(--NorTxt)';
                document.getElementById('result-' + currentResult).style.color = 'var(--PriBG)';
            } else {
                document.getElementById('result-' + currentResult).style.background = 'rgba(0, 0, 0, 0.2)';
                document.getElementById('result-' + currentResult).style.color = 'var(--BolTxt)';
            }
        }
    }
});