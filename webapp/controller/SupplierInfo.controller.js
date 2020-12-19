sap.ui.define([
	"./BaseController",
	'sap/f/library'
	], function (
        BaseController,
        Library
	) {
		"use strict";
		return BaseController.extend("sap.ui.Shop.controller.SupplierInfo", {
			/**
             * Controller's "init" lifecycle method.
             */
			onInit: function () {
                // Route
                var oRouter = this.getRouterForThis();

                oRouter
                    .getRoute("SupplierInfo")
                    .attachPatternMatched(this._onSupplierMatched, this);
            },

            /**
             *  Bind context to the view.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            _onSupplierMatched: function (oEvent) {
                var oModel = this.getModel("SupplierList"),
                    aProducts = oModel.getProperty("/Supplier"),
                    sSupplierName = oEvent.getParameter("arguments").SupplierName,
                    nSupplierIndex;

                // get product index
                aProducts.forEach(function(item, index) {
                    if (item.supplierName === sSupplierName) {
                        nSupplierIndex = index;
                    }
                });

                this._nSupplierIndex = nSupplierIndex;

                this.getView().bindElement({
                    path: "/Supplier/" + nSupplierIndex,
                    model: "SupplierList",
                });
            },

            /**
             *  Open end column in full screen mode.
             */
            onOpenFullScreenEndColumn: function () {
                // change layout
                this.getView().getParent().getParent().setLayout(Library.LayoutType.EndColumnFullScreen);
                // change fullscreen button
                this.getModel("State").setProperty("/State/supplierEndColumn", false);
            },

            /**
             *  Open end column.
             */
            onOpenEndColumn: function () {
                // change layout
                this.getView().getParent().getParent().setLayout(Library.LayoutType.ThreeColumnsMidExpanded);
                // change fullscreen button
                this.getModel("State").setProperty("/State/supplierEndColumn", true);
            },

            /**
             *  Close end column.
             */
            onCloseEndColumn: function () {
                // change layout
                this.getView().getParent().getParent().setLayout(Library.LayoutType.TwoColumnsMidExpanded);

                // show end column buttons
                this.getModel("State").setProperty("/State/pageLayoutButtons", true);
                // change fullscreen button
                this.getModel("State").setProperty("/State/supplierEndColumn", true);
            },

		});
});