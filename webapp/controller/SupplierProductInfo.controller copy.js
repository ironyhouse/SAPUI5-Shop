sap.ui.define([
	"./BaseController"
	], function (
        BaseController
	) {
		"use strict";
		return BaseController.extend("sap.ui.Shop.controller.SupplierProductInfo", {
			// /**
            //  * Controller's "init" lifecycle method.
            //  */
			// onInit: function () {

            //     // Route
            //     var oRouter = this.getRouterForThis();

            //     oRouter
            //         .getRoute("SupplierProductInfo")
            //         .attachPatternMatched(this._onObjectMatched, this);
            //     this.myRouter = oRouter;
            // },

            // /**
            //  *  Bind context to the view.
            //  *
            //  * @param {sap.ui.base.Event} oEvent event object.
            //  */
            // _onObjectMatched: function (oEvent) {
            //     var oModel = this.getModel("ProductList"),
            //         aProducts = oModel.getProperty("/Supplier"),
            //         sSupplierName = oEvent.getParameter("arguments").SupplierName,
            //         nSupplierIndex;

            //     // get product index
            //     aProducts.forEach(function(item, index) {
            //         if (item.supplierName === sSupplierName) {
            //             nSupplierIndex = index;
            //         }
            //     });

            //     this._nSupplierIndex = nSupplierIndex;

            //     this.getView().bindElement({
            //         path: "/Supplier/" + nSupplierIndex,
            //         model: "ProductList",
            //     });
            // },
		});
});