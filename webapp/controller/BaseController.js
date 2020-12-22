sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
    ], function (Controller, UIComponent) {
    "use strict";
    return Controller.extend("sap.ui.Shop.controller.BaseController", {

        // set page layout
        setLayout: function (sLayoutName) {
            return this.getModel("State").setProperty( "/State/sPageLayout", sLayoutName);
        },

        // get model
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        // get i18n value
        getI18nWord: function (sName, aMessageWord = []) {
            var oBundle = this.getModel("i18n").getResourceBundle(),
                sMessage = oBundle.getText(sName, aMessageWord);

            return sMessage;
        },

        // get this router
        getRouterForThis: function () {
            return UIComponent.getRouterFor(this);
        },

        // get message manager
        getMessageManager: function () {
            return sap.ui.getCore().getMessageManager();
        },
    });
});