////////////////////////////////////////////////////////////////////////////////
// UserSession.js
//
// The module for the UserSession class, objects of which are used within the
// model for managing carts of ordered items.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

////////////////////////////////////////////////////////////////////////////////
// CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// A manager for the authenticated (currently logged-in) users of this session,
// as well as the user currently active.
//
// Provides methods for authenticating and unauthenticating users, as well
// as getting and setting the credit balance of the active user.
function UserSession (userDB,
                      authenticatedIdsRef = "authenticatedVIP",
                      activeIdRef = "activeVIP",
                      creditDiffsRef = "creditDiffs",
                      alwaysSynchronize = true) {
    this.userDB = userDB;

    // The reference for the "authenticated ids" database:
    // the key in sessionStorage where the authenticated users are fetched from
    // and stored to.
    this.authenticatedIdsRef = authenticatedIdsRef;

    // The reference for the "active id" database:
    // the key in sessionStorage where the active user is fetched from
    // and stored to.
    this.activeIdRef = activeIdRef;

    // The reference for the "credit difference" database:
    // the key in localStorage where changes to users credit are stored.
    this.creditDiffsRef = creditDiffsRef,

    // A flag that indicates whether any change to any aspect of
    // user session or "credit difference" database
    // should immediately update sessoinStorage/localStorage to reflect the
    // changes made.
    this.alwaysSynchronize = alwaysSynchronize,

    // The set of authenticated user ids.
    // Represented by a map from user_id to null. If a user_id is present as a
    // key in the map, that indicates that the user_id is in the set.
    this.authenticatedIds =
        JSON.parse(sessionStorage.getItem(authenticatedIdsRef));

    // The currently active user.
    // Represented by a user_id or null, where null indicates no user is active.
    this.activeId =
        JSON.parse(sessionStorage.getItem(activeIdRef));

    // The database of credit differences.
    // Represented by a map from user_id to a number, where the number
    // represents the change in credit.
    this.creditDiffs =
        JSON.parse(localStorage.getItem(creditDiffsRef));

    // If sessionStorage doesn't have the authenticatedIds stored, initialize it.
    if (this.authenticatedIds === null) {
        this.authenticatedIds = {};
        sessionStorage.setItem(authenticatedIdsRef,
                             JSON.stringify(this.authenticatedIds));
    }

    // We don't care about initializing activeId, since the absence of
    // activeIdRef in sessionStorage also serves to indicate that no user is
    // logged in. Made possible because JSON.parse(null) === null.


    // If localStorage doesn't have the authenticatedIds stored, initialize it.
    if (this.creditDiffs === null) {
        this.creditDiffs = {};
        localStorage.setItem(creditDiffsRef, JSON.stringify(this.creditDiffs));
    }
};

// Commit all aspects of the UserSession to sessionStorage/localStorage
UserSession.prototype.synchronize = function () {
    this.synchronizeAuthenticated();
    this.synchronizeActive();
    this.synchronizeCreditDiffs();
};

// Commit authenticatedIds to sessionStorage
UserSession.prototype.synchronizeAuthenticated = function () {
    sessionStorage.setItem(this.authenticatedIdsRef,
                           JSON.stringify(this.authenticatedIds));
};

// Commit activeId to sessionStorage
UserSession.prototype.synchronizeActive = function () {
    sessionStorage.setItem(this.activeIdRef,
                         JSON.stringify(this.activeId));
};

// Commit creditDiffs to localStorage
UserSession.prototype.synchronizeCreditDiffs = function () {
    localStorage.setItem(this.creditDiffsRef,
                         JSON.stringify(this.creditDiffs));
};

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

// Authenticate a user by username and password.
//
// If authentication is successful, authenticate() returns true, and switches
// the active user to the newly authenticated user.
/// Otherwise returns false.
UserSession.prototype.authenticate =
    function (userName,
              userPass,
              shouldSync = this.alwaysSynchronize) {

    const user = this.userDB.usernames[userName];

    // Password-checking not performed; would require MD5 hashing.
    if (typeof user !== "undefined") {
        this.authenticatedIds[user.id] = null;
        this.activeId = user.id;
        if (shouldSync) {
            this.synchronizeAuthenticated();
            this.synchronizeActive();
        }
        return true;
    } else {
        return false;
    }
};


// Switches the active user to another authenticated user by id.
// By default, active user will be switched to null (noone active).
UserSession.prototype.switch =
    function (id = null,
              shouldSync = this.alwaysSynchronize) {

    if (id in this.authenticatedIds
        || id === null) {
        this.activeId = id;
        return true;
    } else {
        return false;
    }
};


// Unauthenticate all users, switching the active user to null (noone active).
UserSession.prototype.unauthenticateAll =
    function (shouldSync = this.alwaysSynchronize) {

    this.authenticatedIds = {};
    this.activeId = null;
    if (shouldSync) {
        this.synchronizeActive();
        this.synchronizeAuthenticated();
    }
};

// Unauthenticate all users but the active user.
// If there is no active user, this will authenticate all users.
UserSession.prototype.unauthenticateAllElse =
    function (shouldSync = this.alwaysSynchronize) {

    for (const id in this.authenticatedIds) {
        if (id !== this.activeId) {
            delete this.authenticatedIds[id];
        }
    }
    if (shouldSync) {
        this.synchronizeAuthenticated();
    }
};

// Unauthenticate user by id.
// By default, this will unauthenticate the active user,
// and by doing that switches the active user to null (noone active).
UserSession.prototype.unauthenticate =
    function (id = this.activeId,
              shouldSync = this.alwaysSynchronize) {

    if (id === null) {
        return true;
    }
    if (id in this.authenticatedIds) {
        delete this.authenticatedIds[id];
        if (shouldSync) {
            this.synchronizeAuthenticated();
        }
        if (this.activeId === id) {
            this.activeId = null;
            if (shouldSync) {
                this.synchronizeActive();
            }
        }
        return true;
    } else {
        return false;
    }
};

// Gets the currently active user. Returns null if no user is active.
UserSession.prototype.active = function () {
    if (this.activeId === null) {
        return null;
    } else {
        return this.userDB.ids[this.activeId];
    }
};

// Gets the currently authenticated users.
UserSession.prototype.authenticated = function () {
    return this.authenticatedIds.map(id => this.userDB.ids[id]);
};

// Gets the credit of the active user.
// If no user is active, this will return undefined.
UserSession.prototype.getCredit = function () {
    if (this.active() === null) {
        return undefined;
    }
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    const creditDiff = this.creditDiffs[this.activeId];
    if (typeof creditDiff !== "undefined") {
        userCredit += creditDiff;
    }
    return userCredit;
};

// Sets the credit of the active user, and return the old credit of the user.
// If no user is active, this will do nothing, and return undefined.
UserSession.prototype.setCredit =
    function (credit,
              shouldSync = this.alwaysSynchronize) {

    if (this.activeId === null) {
        return undefined;
    }
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    let oldCreditDiff = this.creditDiffs[this.activeId];
    if (typeof oldCreditDiff === "undefined") {
        oldCreditDiff = 0;
    }
    // We set the credit to a specific value by
    // setting the creditDiff to the difference between the new credit
    // and the credit in the dataBase
    this.creditDiffs[this.activeId] = credit - userCredit;
    if (shouldSync) {
        this.synchronizeCreditDiffs();
    }
    // The old credit of the user is their credit in the database +
    // the old credit difference
    return userCredit + oldCreditDiff;
};

// Modifies the credit of the active user by the specified amount
// and return the old credit of the user.
// If no user is active, this will do nothing, and return undefined.
UserSession.prototype.modifyCredit =
    function (credit,
              shouldSync = this.alwaysSynchronize) {

    if (this.activeId === null) {
        return undefined;  
    }
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    let oldCreditDiff = this.creditDiffs[this.activeId];
    if (typeof oldCreditDiff === "undefined") {
        oldCreditDiff = 0;
    }
    this.creditDiffs[this.activeId] = oldCreditDiff + credit;
    if (shouldSync) {
        this.synchronizeCreditDiffs();
    }
    // The old credit of the user is their credit in the database +
    // the old credit difference
    return userCredit + oldCreditDiff;
};
