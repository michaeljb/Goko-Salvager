(function () {
    'use strict';

    console.log('Loading Better End Turn');

    var mod = GS.modules.betterEndTurn = new GS.Module('Better End Turn');
    mod.dependencies = ['GS'];
    mod.load = function () {
        var betterEndTurnButton = null,
            endTurn,
            endTurnView,
            hideEndTurnView;

        GS.whenGameClientReady(function (gameClient) {
            if (GS.get_option('better_end_turn')) {
                gameClient.clientConnection.bind('uiMultiSelect', hideEndTurnView, gameClient.playerController);

                betterEndTurnButton = document.getElementById('better-end-turn');
                if (betterEndTurnButton === null) {
                    $('#sidebar').prepend(GS.template('better-end-turn'));
                    betterEndTurnButton = document.getElementById('better-end-turn');
                }
                betterEndTurnButton.onclick = endTurn;
            } else if (betterEndTurnButton !== null) {
                // if a game was started with the option turned on, then the
                // option was turned off in between games, the button must be
                // removed from the DOM
                betterEndTurnButton.remove();
            }
        });

        // hide goko's end turn button when it would appear, enable/disable our
        // end turn button appropriately
        hideEndTurnView = function (options) {
            var panel = this.dominionWindow._getAllPanels()[0];

            endTurnView = _.find(panel.views, function (view) {
                return view && view.image && view.image.src && view.image.src.match(/end_turn/) !== null;
            });

            if (endTurnView) {
                endTurnView.visible = false;
                endTurnView.eventsEnabled = false;
                betterEndTurnButton.disabled = false;
            } else {
                betterEndTurnButton.disabled = true;
            }
        };

        // simulate a click on the goko end turn button
        endTurn = function () {
            endTurnView._callListener('mousedown');
            endTurnView._callListener('mouseup', new FS.Point({x: 0, y: 0}));
        };

    };

}());
