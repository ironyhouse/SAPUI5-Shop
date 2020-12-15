sap.ui.define([
    "sap/ui/core/mvc/Controller"
    ], function (Controller) {
    "use strict";
    return Controller.extend("sap.ui.Shop.controller.BaseController", {

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
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Check form validation.
         */
        // checkFormValid: function (sModelName, sFormId, sFormButtonId) {
        //     var oModel = this.getModel(sModelName),
        //         oForm = oModel.getProperty(sFormId),
        //         oFormButton = this.byId(sFormButtonId),
        //         nValidationError = sap.ui
        //             .getCore()
        //             .getMessageManager().getMessageModel().getData().length,
        //         // check invalid value
        //         bCheckForm = nValidationError === 0;

        //     // validation form
        //     for (let key in oForm) {
        //         if(!oForm[key]) {
        //             bCheckForm = false;
        //         }
        //     }

        //     oFormButton.setProperty("enabled", bCheckForm);
        // },
    });
});