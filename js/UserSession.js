'use strict';

function convertUserDB (initUserDB) {
    let userDB = {ids: {}, usernames: {}};
    for (let initUser of initUserDB.users) {
        let user = {...initUser};
        user.id = user.user_id;
        user.credit = null;
        userDB.ids[user.id] = user;
        userDB.usernames[user.username] = user;
    }
    for (let account of initUserDB.account) {
        userDB.ids[account.user_id].credit = Number(account.creditSEK);
    }
    return userDB;
}

function UserSession (userDB,
                      authenticatedIdsRef = "authenticatedVIP",
                      activeIdRef = "activeVIP",
                      creditDiffsRef = "creditDiffs",
                      alwaysSynchronize = true) {
    this.userDB = userDB;
    this.authenticatedIdsRef = authenticatedIdsRef;
    this.activeIdRef = activeIdRef;
    this.creditDiffsRef = creditDiffsRef,
    this.alwaysSynchronize = alwaysSynchronize,

    this.authenticatedIds =
        JSON.parse(localStorage.getItem(authenticatedIdsRef));
    this.activeId =
        JSON.parse(localStorage.getItem(activeIdRef));
    this.creditDiffs =
        JSON.parse(localStorage.getItem(creditDiffsRef));
    if (this.authenticatedIds === null) {
        this.authenticatedIds = {};
        localStorage.setItem(authenticatedIdsRef,
                             JSON.stringify(this.authenticatedIds));
    }
    if (this.creditDiffs === null) {
        this.creditDiffs = {};
        localStorage.setItem(creditDiffsRef, JSON.stringify(this.creditDiffs));
    }
};

UserSession.prototype.synchronize = function () {
    this.synchronizeAuthenticated();
    this.synchronizeActive();
    this.synchronizeCreditDiffs();
};

UserSession.prototype.synchronizeAuthenticated = function () {
    localStorage.setItem(this.authenticatedIdsRef,
                         JSON.stringify(this.authenticatedIds));
};

UserSession.prototype.synchronizeActive = function () {
    localStorage.setItem(this.activeIdRef,
                         JSON.stringify(this.activeId));
};

UserSession.prototype.synchronizeCreditDiffs = function () {
    localStorage.setItem(this.creditDiffsRef,
                         JSON.stringify(this.creditDiffs));
};

UserSession.prototype.authenticate = function (userName,
                                               userPass,
                                               sync = this.alwaysSynchronize) {
    const user = this.userDB.usernames[userName];
    // Password-checking not performed; would require MD5 hashing.
    if (typeof user !== "undefined") {
        this.authenticatedIds[user.id] = null;
        this.activeId = user.id;
        if (sync) {
            this.synchronizeAuthenticated();
            this.synchronizeActive();
        }
        return true;
    } else {
        return false;
    }
};


UserSession.prototype.switch = function (id,
                                        sync = this.alwaysSynchronize) {
    if (id in this.authenticatedIds
        || id === null) {
        this.activeId = id;
        return true;
    } else {
        return false;
    }
};


UserSession.prototype.unauthenticateAll = function (sync = this.alwaysSynchronize) {
    this.authenticatedIds = {};
    this.activeId = null;
    if (sync) {
        this.synchronizeActive();
        this.synchronizeAuthenticated();
    }
};

UserSession.prototype.unauthenticateAllElse = function (sync = this.alwaysSynchronize) {
    for (let id in this.authenticatedIds) {
        if (id !== this.activeId) {
            delete this.authenticatedIds[id];
        }
    }
    if (sync) {
        this.synchronizeAuthenticated();
    }
};

UserSession.prototype.unauthenticate = function (id = this.activeId,
                                                 sync = this.alwaysSynchronize) {
    if (id === null) {
        return true;
    }
    if (id in this.authenticatedIds) {
        delete this.authenticatedIds[id];
        if (sync) {
            this.synchronizeAuthenticated();
        }
        if (this.activeId === id) {
            this.activeId = null;
            if (sync) {
                this.synchronizeActive();
            }
        }
        return true;
    } else {
        return false;
    }
};

UserSession.prototype.active = function () {
    if (this.activeId === null) {
        return null;
    } else {
        return this.userDB.ids[this.activeId];
    }
};

UserSession.prototype.authenticated = function () {
    return this.authenticatedIds.map(id => this.userDB.ids[id]);
};

UserSession.prototype.getCredit = function () {
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    const creditDiff = this.creditDiffs[this.activeId];
    if (typeof creditDiff !== "undefined") {
        userCredit += creditDiff;
    }
    return userCredit;
};

UserSession.prototype.setCredit = function (credit,
                                           sync = this.alwaysSynchronize) {
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    let oldCreditDiff = this.creditDiffs[this.activeId];
    if (typeof oldCreditDiff === "undefined") {
        oldCreditDiff = 0;
    }
    this.creditDiffs[this.activeId] = credit - userCredit;
    if (sync) {
        this.synchronizeCreditDiffs();
    }
    return userCredit + oldCreditDiff;
};

UserSession.prototype.modifyCredit = function (credit,
                                               sync = this.alwaysSynchronize) {
    let userCredit = this.active().credit;
    if (userCredit === null) { userCredit = 0; }
    let oldCreditDiff = this.creditDiffs[this.activeId];
    if (typeof oldCreditDiff === "undefined") {
        oldCreditDiff = 0;
    }
    this.creditDiffs[this.activeId] = oldCreditDiff + credit;
    if (sync) {
        this.synchronizeCreditDiffs();
    }
    return userCredit + oldCreditDiff;
};
