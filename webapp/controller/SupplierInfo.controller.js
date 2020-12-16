sap.ui.define([
	"./BaseController",
	'sap/f/library'
	], function (
        BaseController,
        fioriLibrary
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
                var oModel = this.getModel("ProductList"),
                    aProducts = oModel.getProperty("/Supplier"),
                    sSupplierName = oEvent.getParameter("arguments").SupplierName,
                    nSupplierIndex;

                // get product index
                aProducts.forEach(function(item, index) {
                    if (item.supplierName === sSupplierName) {
                        nSupplierIndex = index;
                    }
                });

                this._sSupplierName = sSupplierName;
                this._nSupplierIndex = nSupplierIndex;

                this.getView().bindElement({
                    path: "/Supplier/" + nSupplierIndex,
                    model: "ProductList",
                });
            },


            onProductPress: function (oEvent) {
                var oRouter = this.getRouterForThis(),
                    oFCL = this.oView.getParent().getParent(),
                    sProductName = oEvent.getSource()
                        .getBindingContext("ProductList")
                        .getProperty("productName");

                oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

                oRouter.navTo("SupplierProductInfo", {
                    SupplierName: this._sSupplierName,
                    ProductName: sProductName,
                    layout: "TwoColumnsMidExpanded"
                });
            },
		});
});