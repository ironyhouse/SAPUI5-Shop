sap.ui.define([
	"./BaseController",
	"sap/f/library"
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
                var oRouter = this.getRouterForThis();

                oRouter
                    .getRoute("SupplierInfo")
                    .attachPatternMatched(this._onSupplierMatched, this);
            },

            /**
             *  Bind context to the view.
             *
             *  @param {sap.ui.base.Event} oEvent event object.
             */
            _onSupplierMatched: function (oEvent) {
                var sLayoutName = oEvent.getParameter("arguments").sLayoutName,
                    oModel = this.getModel("SupplierList"),
                    aProducts = oModel.getProperty("/Supplier"),
                    nProductId = oEvent.getParameter("arguments").nProductId,
                    sSupplierName = oEvent.getParameter("arguments").sSupplierName,
                    nSupplierIndex;

                // set page layout
                this.setLayout(sLayoutName);

                // toggle fullscreen buttons
                if (sLayoutName === "EndColumnFullScreen") {
                    this.getModel("State").setProperty("/State/isFullScreenEndColumn", true);
                }

                // get product index
                for (var i = 0; i < aProducts.length; i++) {
                    if (aProducts[i].supplierName === sSupplierName) {
                        nSupplierIndex = i;
                        break;
                    }
                }

                this.nProductId = nProductId
                this.sSupplierName = sSupplierName;

                this.getView().bindElement({
                    path: "/Supplier/" + nSupplierIndex,
                    model: "SupplierList",
                });
            },

            /**
             *  Open end column in full screen mode.
             */
            onCloseFullScreenEndColumn: function () {
                // change layout
                this.setLayout("EndColumnFullScreen");
                // change fullscreen button
                this.getModel("State").setProperty("/State/isFullScreenEndColumn", true);

                this.getRouterForThis().navTo("SupplierInfo", {
                    nProductId: this.nProductId,
                    sSupplierName: this.sSupplierName,
                    sLayoutName: "EndColumnFullScreen"
                });
            },

            /**
             *  Open end column.
             */
            onOpenEndColumn: function () {
                // change layout
                this.setLayout("ThreeColumnsMidExpanded");
                // change fullscreen button
                this.getModel("State").setProperty("/State/isFullScreenEndColumn", false);

                this.getRouterForThis().navTo("SupplierInfo", {
                    nProductId: this.nProductId,
                    sSupplierName: this.sSupplierName,
                    sLayoutName: "ThreeColumnsMidExpanded"
                });
            },

            /**
             *  Close end column.
             */
            onCloseEndColumn: function () {
                // change layout
                this.setLayout("TwoColumnsMidExpanded");

                // show end column buttons
                this.getModel("State").setProperty("/State/isShowEndColumnButtons", false);
                // change fullscreen button
                this.getModel("State").setProperty("/State/isFullScreenEndColumn", false);

                this.getRouterForThis().navTo("SupplierInfo", {
                    nProductId: this.nProductId,
                    sSupplierName: this.sSupplierName,
                    sLayoutName: "TwoColumnsMidExpanded"
                });
            },

		});
});