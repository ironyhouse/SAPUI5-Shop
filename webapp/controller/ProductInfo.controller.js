sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Shop/Controller/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (
        Controller,
        formatter,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Fragment
    ) {
	"use strict";
	return Controller.extend("sap.ui.Shop.controller.ProductInfo", {

        formatter: formatter,

        /**
         * Controller's "init" lifecycle method.
         */
		onInit: function () {
            // Route
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            // Register the view with the message manager
            sap.ui
                .getCore()
                .getMessageManager()
                .registerObject(this.getView(), true);

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
            var nProductId = parseInt(oEvent.getParameter("arguments").productId, 10),
                nProductIndex = this.getProductIndex(nProductId);

            this.getView().getModel("ProductList").getProperty("/Sale");

            this.getView().bindElement({
                path: "/product/" + nProductIndex,
                model: "ProductList",
            });
        },

        /**
         *  Bind context to the view.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        getProductIndex: function (nProductId) {
            var oModel = this.getView().getModel("ProductList"),
                aProducts = oModel.getProperty("/product"),
                nProductIndex = null;

            // get product index
            aProducts.forEach(function(item, index) {
                if (item.productId === nProductId) {
                    nProductIndex = index;
                }
            });

            return nProductIndex;
        },

        /**
         *  This method navigates to product list.
         *
         */
        navToProductList: function () {
			this.myRouter.navTo("ProductList");
        },

        /**
         * "Search" event handler of the "SearchField".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onSuppliersSearch: function (oEvent) {
            var oSuppliersTable = this.byId("SuppliersTable"),
                oItemsBinding = oSuppliersTable.getBinding("items"),
                sQuery = oEvent.getParameter("query");

            var aFilter = new Filter({
                filters: [
                    new Filter("SupplierName", FilterOperator.Contains, sQuery),
                    new Filter("SuppliersAddress", FilterOperator.Contains, sQuery),
                    new Filter("SuppliersCity", FilterOperator.Contains, sQuery),
                    new Filter("SuppliersCountry", FilterOperator.Contains, sQuery)
                ],
                and: false
            });

            oItemsBinding.filter(aFilter);
        },

        /**
         * "Edit Product" button press event handler.
         */
        onEditProductPress: function () {
            // toggle "Edit Product"
            this.getView().getModel("ProductList").setProperty("/State/editProduct", true);

            // copy product list
            var oProduct = this.getView().getModel("ProductList").getProperty("/product");
            var oOldProducts = jQuery.extend(true, {}, oProduct);
            this.getView().getModel("ProductList").setProperty("/oldProducts", oOldProducts);
        },

        /**
         *  This method change a product.
         */
        onSaveChangesPress: function () {
            var nValidationError = sap.ui
                .getCore()
                .getMessageManager().getMessageModel().oData.length;

            if (nValidationError === 0) {
                this.getView().getModel("ProductList").setProperty("/State/editProduct", false);
            }
        },

        /**
         * "Cancel edit supplier" button press event handler.
         */
        onCancelChangesPress: function () {
            // toggle edit
            this.getView().getModel("ProductList").setProperty("/State/editProduct", false);

            // set old products
            var oProduct = this.getView().getModel("ProductList").getProperty("/oldProducts");
            this.getView().getModel("ProductList").setProperty("/product", oProduct);
        },

        /**
         * "Create supplier" button press event handler.
         */
        onAddSupplierPress: function () {
            var oView = this.getView(),
                oSupplierCreatorForm = this.byId("supplierCreator");

            // clear form
            // this.onClearForm();

            // create dialog lazily
            if (!oSupplierCreatorForm) {
                // load asynchronous XML fragment
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.Shop.view.fragments.SupplierCreationForm",
                    controller: this
                }).then(function (oSupplierCreatorForm) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oSupplierCreatorForm);
                    oSupplierCreatorForm.open();
                });
            } else {
                oSupplierCreatorForm.open();
            }
        },

        /**
         *  This method create a supplier.
         */
        onCreateSupplierPress: function () {
            var sSupplierMessageCreate = this.getView().getModel("i18n").getProperty("supplierCreate"),
                sProductFormValid = this.getView().getModel("i18n").getProperty("productFormValid"),
                nProductId = this.getView().getBindingContext("ProductList").getProperty("productId"),
                oModel = this.getView().getModel("ProductList"),
                // get product list
                oProducts = oModel.getProperty("/product"),
                // get product form
                oSupplierForm = oModel.getProperty("/supplierForm"),
                // product index
                nProductIndex = this.getProductIndex(nProductId),
                bCheckForm = true;

            // copy supplier form
            oSupplierForm = jQuery.extend(true, {}, oSupplierForm);

            // get product suppliers
            var aSuppliers = oProducts[nProductIndex].Suppliers

            // create supplier list empty
            if (!aSuppliers) {
                aSuppliers = [];
            };

            // validation form
            for (let key in oSupplierForm) {
                if(!oSupplierForm[key]) {
                    bCheckForm = false;
                }
            }

            if (bCheckForm) {
                // create new product id
                oSupplierForm.SupplierId = aSuppliers[aSuppliers.length - 1].SupplierId + 1;

                // create new supplier
                aSuppliers.push(oSupplierForm);

                // set new products
                oModel.setProperty("/product", oProducts)
                // show message
                MessageToast.show(sSupplierMessageCreate);
                // close dialog
                this.byId("supplierCreator").close();
            } else {
                MessageBox.alert(sProductFormValid);
            }
        },

        /**
         * "Cancel" button press event handler (in the suppliers dialog).
         */
        onCancelSupplierPress: function () {
            this.byId("supplierCreator").close();
        },

        /**
         * Clearing supplier form data.
         */
        onClearForm: function () {
            var oModel = this.getView().getModel("ProductList"),
                oSupplierForm = oModel.getProperty("/supplierForm");

            for (let key in oSupplierForm) {
                if(oSupplierForm.hasOwnProperty(key)){
                    oSupplierForm[key] = null;
                }
            }

            oModel.setProperty("/supplierForm", oSupplierForm);
        },

        /**
         * "Supplier Select" button press event handler.
         */
        onSelectSupplierPress: function () {
            var bIsDelete = !!this.byId("SuppliersTable").getSelectedItems().length;

            this.getView().getModel("ProductList").setProperty("/State/deleteSupplier", bIsDelete);
        },

        /**
         * "Delete Suppliers" button press event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onDeleteSupplierPress: function () {
            var sSupplierMessageDelete = this.getView().getModel("i18n").getProperty("supplierMessageDelete"),
                onDeleteSupplier = this.onDeleteSupplier.bind(this);

            MessageBox.confirm(
                sSupplierMessageDelete,
                {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            onDeleteSupplier();
                        }
                    },
                }
            );
        },

        /**
         * Execute "delete" request of the supplier.
         */
        onDeleteSupplier: function () {
            var nSupplierId,
                sSupplierMessageDeleteSuccessful = this.getView().getModel("i18n").getProperty("supplierMessageDeleteSuccessful"),
                oModel = this.getView().getModel("ProductList"),
                aProducts = oModel.getProperty("/product"),
                aSuppliers = this.getView().getBindingContext("ProductList").getProperty("Suppliers"),
                oSuppliersTable = this.byId("SuppliersTable"),
                aSelectedSuppliers = oSuppliersTable.getSelectedItems(),
                nProductId = this.getView().getBindingContext("ProductList").getProperty("productId"),
                nProductIndex = this.getProductIndex(nProductId),
                onSelectSupplier = this.onSelectSupplierPress.bind(this);

            // filtered suppliers
            if (aSelectedSuppliers.length) {
                aSuppliers = aSuppliers.filter(function(item) {
                    var bIsValid = true;
                    // check item
                    for (var i = 0; i < aSelectedSuppliers.length; i++) {
                        nSupplierId = aSelectedSuppliers[i].getBindingContext("ProductList").getProperty("SupplierId")
                        if (item.SupplierId === nSupplierId) {
                            bIsValid = false;
                            break;
                        }
                    }
                    return bIsValid
                });
            }

            // add filtered suppliers
            aProducts[nProductIndex].Suppliers = aSuppliers;
            // set products
            oModel.setProperty("/product", aProducts);
            // show message
            MessageToast.show(sSupplierMessageDeleteSuccessful);
            // clear selections
			oSuppliersTable.removeSelections();
            // toggle delete button
            onSelectSupplier();
        }

	});
});