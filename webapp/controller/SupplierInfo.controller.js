sap.ui.define([
	"./BaseController"
	], function (
		BaseController
	) {
		"use strict";
		return BaseController.extend("sap.ui.Shop.controller.SupplierInfo", {
			/**
             * Controller's "init" lifecycle method.
             */
			onInit: function () {

                // Route
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter
                    .getRoute("ProductInfo")
                    .attachPatternMatched(this._onObjectMatched, this);
                this.myRouter = oRouter;
            },

            /**
             *  Bind context to the view.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            _onObjectMatched: function (oEvent) {
                var nSupplierId = parseInt(oEvent.getParameter("arguments").SupplierId, 10),
                    nSupplierIndex = this.getSupplierIndex(nSupplierId);

                this.getView().bindElement({
                    path: "/supplier/" + nSupplierIndex,
                    model: "SupplierInfo",
                });
            },

		});
});