(function () {
    "use strict";

    console.log('Loading Always Stack');

    var mod = GS.modules.alwaysStack = new GS.Module('Always Stack');
    mod.dependencies = ['GS', 'FS.Cards.CardStackPanel'];
    mod.load = function () {
        GS.alsoDo(FS.Cards.CardStackPanel, 'addView', null, function (view, index) {
            if (GS.get_option('always_stack') && this.autoStackCards) {
                this.stackCards = true;
            }
        });
    };
}());
