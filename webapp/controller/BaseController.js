sap.ui.define([
    "sap/ui/core/mvc/Controller"
    ], function (Controller) {
    "use strict";
    return Controller.extend("my.application.controller.BaseController", {

        // get model
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        // get i18n value
        getI18nWord: function (sValue) {
            return this.getModel("i18n").getProperty(sValue);
        },
    });
});