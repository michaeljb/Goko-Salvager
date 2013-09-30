/*jslint browser: true, devel: true, indent: 4, es5: true, vars: true, nomen: true, regexp: true, forin: true */
/*globals $, GS, mtgRoom */

(function () {
    "use strict";

    console.log('Loading Utils');

    GS.debug = function (text) {
        if (GS.get_option('debug_mode')) {
            console.log(text);
        }
    };

    GS.alsoDo = function (object, methodname, fnBefore, fnAfter) {

        // If we've already overridden this method, then override the
        // overriding method instead
        var methodname_o = '_' + methodname + '_orig';
        if (object.prototype.hasOwnProperty(methodname_o)) {
            return GS.alsoDo(object, methodname_o, fnBefore, fnAfter);
        }

        // Cache original method
        object.prototype[methodname_o] = object.prototype[methodname];
    
        // Replace original method with a method sandwich
        object.prototype[methodname] = function () {

            // Run fnBefore
            if (typeof fnBefore !== 'undefined' && fnBefore !== null) {
                fnBefore.apply(this, arguments);
            }

            // Run the original method
            var out = this[methodname_o].apply(this, arguments);

            // Run fnAfter
            if (typeof fnAfter !== 'undefined' && fnAfter !== null) {
                fnAfter.apply(this, arguments);
            }

            // Return the result of the original method
            return out;
        };
    };

    // Parse numbers like 303 and 4.23k
    GS.parseNum = function (str) {
        try {
            var m = str.match(/^([0-9.]+)([kK]?)$/);
            return Math.floor(parseFloat(m[1]) * (m[2] !== '' ? 1000 : 1));
        } catch (e) {
            // Fail silently if unparseable strings get here
            return null;
        }
    };

    // Parse titles like X+, Y-, X-Y, and +/-Z
    // Precedence: +/- > range > min thresh > max thresh
    GS.parseRange = function (tablename, myRating) {
        var m, minRating = null, maxRating = null;

        if ((m = tablename.match(/(\d+(.\d+)?([kK])?)-/)) !== null) {
            minRating = null;
            maxRating = this.parseNum(m[1]);
        }
        if ((m = tablename.match(/(\d+(.\d+)?([kK])?)\+/)) !== null) {
            minRating = this.parseNum(m[1]);
            maxRating = null;
        }
        if ((m = tablename.match(/(\d+(.\d+)?([kK])?)-(\d+(.\d+)?([kK])?)/)) !== null) {
            minRating = this.parseNum(m[1]);
            maxRating = this.parseNum(m[4]);
        }
        if ((m = tablename.match(/\+\/-(\d+(.\d+)?([kK])?)/)) !== null) {
            minRating = myRating - this.parseNum(m[1]);
            maxRating = myRating + this.parseNum(m[1]);
        }

        return [minRating, maxRating];
    };

    GS.getTableName = function () {
        try {
            return JSON.parse(mtgRoom.getCurrentTable().get('settings')).name;
        } catch (e) {
            return null;
        }
    };

    GS.getMyName = function () {
        return mtgRoom.localPlayer.get('playerName');
    };

    GS.getGameClient = function () {
        if (typeof mtgRoom !== 'undefined') {
            var roomId = mtgRoom.currentRoomId;
            if (roomId !== null) {
                var table = mtgRoom.getCurrentTable();
                var tableNo = table !== null ? table.get('number') : 0;
                var key = roomId + ':' + tableNo;
                return mtgRoom.games[key];
            }
        }
        return null;
    };
    
    GS.sendRoomChat = function (message) {
        var gc = GS.getGameClient();
        gc.clientConnection.send('sendChat', {text: message});
    };

    // Show a message in my chat box without sending
    GS.showRoomChat = function (message) {
        var gc = GS.getGameClient();
        gc.clientConnection.trigger("addChat", {
            playerName: '**',
            text: message
        });
        gc.clientConnection.send('sendChat', {text: message});
    };

    GS.getBrowser = function () {
        var out;
        if (navigator.appVersion.search('Chrome') !== -1) {
            out = 'Chrome';
        } else if (navigator.appVersion.search('Safari') !== -1) {
            out = 'Safari';
        } else {
            out = 'Firefox';
        }
        return out;
    };

    GS.salvagerIconURL = 'http://gokologs.drunkensailor.org/static/img/salvager128.png';
    GS.url = 'www.gokosalvager.com';
}());