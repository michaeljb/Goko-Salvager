(function () {
    "use strict";

    var mod = GS.modules.automatchSeekPop = new GS.Module('Automatch Seek Popup');
    mod.dependencies = ['$'];
    mod.load = function () {
        GS.AM = GS.AM || {};

        GS.AM.appendSeekPopup = function (viewport) {
            viewport.append([
                '<div id="seekAAPop" title="Looking for Match">',
                '<p>Automatch is looking for players whose ',
                '   search criteria match your table.</p>',
                '<button id="seekAAStop">Stop Looking</button>',
                '<button id="seekAAOkay">Keep Looking</button>',
                '</div>'
            ].join(''));

            $('#seekAAPop').dialog({
                modal: false,
                width: 500,
                draggable: true,
                resizeable: false,
                autoOpen: false
            });

            $('#seekAAStop').click(function () {
                GS.AM.showSeekPop(false);
                GS.AM.cancelSeek();
            });

            $('#seekAAOkay').click(function () {
                GS.AM.showSeekPop(false);
            });
        };

        // Update and show/hide the dialog
        GS.AM.showSeekPop = function (visible) {

            if (visible === undefined) {
                visible = true;
            }

            if (GS.AM.state.seek !== null) {
                $('#seekAAPop').dialog(visible ? 'open' : 'close');
                $('#seekAAOkay').focus();
            } else if (visible) {
                // No popup needed since automatch settings come from
                // user settings. Just submit the AM request.

                // Clear any cached table information from an automatch request
                // that was generated through a table create.
                GS.AM.tableSettings = null;

                // Send seek request
                GS.AM.submitSeek({
                    player: GS.AM.player,
                    requirements: []
                });
            }
        };
    };
}());
