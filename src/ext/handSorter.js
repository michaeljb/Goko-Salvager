(function () {
    'use strict';

    console.log('Loading Hand Sorter');

    var mod = GS.modules.handSorter = new GS.Module('Hand Sorter');
    mod.dependencies = ['GS'];
    mod.load = function () {
        var sortHand;

        GS.whenGameClientReady(function (gameClient) {
            if (GS.get_option('hand_sorter')) {
                gameClient.clientConnection.bind('moveCards', sortHand, gameClient.playerController);
                gameClient.clientConnection.bind('uiMultiSelect', sortHand, gameClient.playerController);
                gameClient.clientConnection.bind('updateState', sortHand, gameClient.playerController);
            }
        });

        sortHand = function (options) {
            var handPanels;

            handPanels = _.select(this.dominionWindow._getAllPanels(), function (panel) {
                return panel instanceof FS.Cards.FanCardStackPanel;
            }, this);

            _.each(handPanels, function (panel) {
                panel._cardViews = _.sortBy(panel._cardViews, 'card');
                panel._doLayout();
            }, this);
        };

    };
}());
