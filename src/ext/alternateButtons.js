(function () {
    'use strict';

    console.log('Loading Alternate Buttons');

    var mod = GS.modules.alternateButtons = new GS.Module('Alternate Buttons');
    mod.dependencies = ['GS'];
    mod.load = function () {
        var buttonsAdded = false,
            alternateButtons,
            updateButtons;

        alternateButtons = [{
            // end turn
            gokoView: null,
            gokoImgSrcMatcher: /end_turn/,
            salvagerButton: null,
            salvagerButtonID: 'alt-end-turn'
        }, {
            // end actions
            gokoView: null,
            gokoImgSrcMatcher: /done_playing_actions/,
            salvagerButton: null,
            salvagerButtonID: 'alt-end-actions'
        }];

        GS.whenGameClientReady(function (gameClient) {
            if (GS.get_option('alternate_buttons')) {
                gameClient.clientConnection.bind('uiMultiSelect', updateButtons, gameClient.playerController);

                if (!buttonsAdded) {
                    $('#sidebar').prepend(GS.template('alternate-buttons'));
                    buttonsAdded = true;
                }

                _.each(alternateButtons, function (button) {
                    button.salvagerButton = document.getElementById(button.salvagerButtonID);
                    button.salvagerButton.onclick = function () {
                        button.gokoView._callListener('mousedown');
                        button.gokoView._callListener('mouseup', new FS.Point({x: 0, y: 0}));
                        button.salvagerButton.disabled = true;
                    };
                }, this);

            } else if (buttonsAdded) {
                // if a game was started with the option turned on, then the
                // option was turned off in between games, the button must be
                // removed from the DOM
                document.getElementById('alternate-buttons').remove();
                buttonsAdded = false;
            }
        });

        // hide goko's buttons when they would appear, enable/disable the
        // alternate buttons appropriately
        updateButtons = function (options) {
            var panel = this.dominionWindow._getAllPanels()[0];

            _.each(alternateButtons, function (button) {

                button.gokoView = _.find(panel.views, function (view) {
                    return view && view.image && view.image.src && view.image.src.match(button.gokoImgSrcMatcher) !== null;
                });

                if (button.gokoView) {
                    button.gokoView.visible = false;
                    button.gokoView.eventsEnabled = false;
                    button.salvagerButton.disabled = false;
                } else {
                    button.salvagerButton.disabled = true;
                }

            }, this);

        };

    };

}());
