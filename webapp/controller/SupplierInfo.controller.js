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

            /**
             *  Bind context to the Product Info.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            onProductPress: function (oEvent) {
                var sProductName = oEvent.getSource()
                        .getBindingContext("ProductList")
                        .getProperty("productName"),
                    oModel = this.getModel("ProductList"),
                    aProducts = oModel.getProperty("/Supplier/" + this._nSupplierIndex + "/products/"),
                    nProductIndex;

                // change layout
                this.onOpenMiddleColumn();

                // get product index
                aProducts.forEach(function(item, index) {
                    if (item.productName === sProductName) {
                        nProductIndex = index;
                    }
                });

                // bine middle column context
                var sPath = "/Supplier/" + this._nSupplierIndex + "/products/" + nProductIndex;
                this.byId("SupplierProductInfo").bindElement({
                    path: sPath,
                    model: "ProductList",
                });
            },

            onOpenFullScreenMiddleColumn: function () {
                // change layout
                this.getView().byId("SupplierInfoLayout").setLayout(Library.LayoutType.MidColumnFullScreen);
                this.getView().getModel("ProductList").setProperty("/State/middleColumn", false);
            },

            onOpenMiddleColumn: function () {
                // change layout
                this.getView().byId("SupplierInfoLayout").setLayout(Library.LayoutType.TwoColumnsMidExpanded);
                this.getView().getModel("ProductList").setProperty("/State/middleColumn", true);
            },

            /**
             *  Close the middle column.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            onCloseMiddleColumn: function () {
                // change layout
                this.getView().byId("SupplierInfoLayout").setLayout(Library.LayoutType.OneColumn);
            },

		});
});