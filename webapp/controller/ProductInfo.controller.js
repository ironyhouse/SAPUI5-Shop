sap.ui.define([
    "./BaseController",
    "sap/ui/Shop/Controller/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (
        BaseController,
        formatter,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Fragment,
    ) {
	"use strict";
	return BaseController.extend("sap.ui.Shop.controller.ProductInfo", {

        formatter: formatter,

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

            // Validation
            var oMessageManager, oView;
			oView = this.getView();

			// set message model
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			// or just do it for the whole view
			oMessageManager.registerObject(oView, true);
        },

        /**
         * "Open Popover" button press event handler.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        onMessagePopoverPress : function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

        /**
         * This method create Popover.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        _getMessagePopover : function () {
			// create popover lazily (singleton)
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "sap.ui.Shop.view.fragments.MessageErrorPopover",
                    this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
        },

        /**
         *  Bind context to the view.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        _onObjectMatched: function (oEvent) {
            var nProductId = parseInt(oEvent.getParameter("arguments").productId, 10),
                nProductIndex = this._getProductIndex(nProductId);

            // this.getModel("ProductList").getProperty("/Sale");

            this.getView().bindElement({
                path: "/product/" + nProductIndex,
                model: "ProductList",
            });
        },

        /**
         *  This method navigates to supplier info.
         */
        onNavToSupplierInfo: function (oEvent) {
            var oSelectedListItem = oEvent.getSource(),
                oRouter = sap.ui.core.UIComponent.getRouterFor(this),
                nSupplierId = oSelectedListItem
                    .getBindingContext("ProductList")
                    .getProperty("productId");

            console.log(nSupplierId);

            // var nSupplierId = 0;

            // oRouter.navTo("SupplierInfo", { SupplierId: nSupplierId });
        },

        /**
         *  This method navigates to product list.
         *
         */
        navToProductList: function () {
			this.myRouter.navTo("ProductList");
        },

        /**
         *  Bind context to the view.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        _getProductIndex: function (nProductId) {
            var oModel = this.getModel("ProductList"),
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
            this.getModel("ProductList").setProperty("/State/editProduct", true);

            // copy product list
            var oProduct = this.getModel("ProductList").getProperty("/product");
            var oOldProducts = jQuery.extend(true, {}, oProduct);
            this.getModel("ProductList").setProperty("/oldProducts", oOldProducts);
        },

        /**
         *  This method change a product.
         */
        onSaveChangesPress: function () {
            var nValidationError = sap.ui
                .getCore()
                .getMessageManager().getMessageModel().oData.length;

            if (nValidationError === 0) {
                this.getModel("ProductList").setProperty("/State/editProduct", false);
            }
        },

        /**
         * "Cancel edit product" button press event handler.
         */
        onCancelChangesPress: function () {
            var sEditCancel = this.getI18nWord("editCancel"),
                onCancelChanges = this.onCancelChanges.bind(this);

            MessageBox.confirm(
                sEditCancel,
                {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            onCancelChanges();
                        }
                    },
                }
            );
        },

        /**
         * This method cancels edit.
         */
        onCancelChanges: function () {
            var oProduct = this.getModel("ProductList").getProperty("/oldProducts");

            // toggle edit
            this.getModel("ProductList").setProperty("/State/editProduct", false);
            // set old products
            this.getModel("ProductList").setProperty("/product", oProduct);
        },

        /**
         * "Create supplier" button press event handler.
         */
        onAddSupplierPress: function () {
            var oView = this.getView(),
                oSupplierFormButton = this.byId("SupplierFormButton"),
                oSupplierCreatorForm = this.byId("supplierCreator");

            // clear form
            this.onClearForm();

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
                oSupplierFormButton.setProperty("enabled", false);
            }
        },

        /**
         *  This method create a supplier.
         */
        onCreateSupplierPress: function () {
            var sSupplierMessageCreate = this.getI18nWord("supplierCreate"),
                nProductId = this.getView().getBindingContext("ProductList").getProperty("productId"),
                oModel = this.getModel("ProductList"),
                oProducts = oModel.getProperty("/product"),
                oSupplierForm = oModel.getProperty("/supplierForm"),
                oSupplierCreatorForm = this.byId("supplierCreator"),
                nProductIndex = this._getProductIndex(nProductId),
                // get product suppliers
                aSuppliers = oProducts[nProductIndex].Suppliers;

            // copy supplier form
            oSupplierForm = jQuery.extend(true, {}, oSupplierForm);

            // create supplier list empty
            if (!aSuppliers) { aSuppliers = [] };

            // create new supplier id
            oSupplierForm.SupplierId = aSuppliers[aSuppliers.length - 1].SupplierId + 1;

            // create new supplier
            aSuppliers.push(oSupplierForm);

            // set new products
            oModel.setProperty("/product", oProducts)
            // show message
            MessageToast.show(sSupplierMessageCreate);
            // close dialog
            oSupplierCreatorForm.close();
        },

        /**
         * "Cancel" button press event handler (in the suppliers dialog).
         */
        onCancelSupplierPress: function () {
            this.byId("supplierCreator").close();
        },

        /**
         * Check form validation.
         */
        checkFormValid: function () {
            var oModel = this.getModel("ProductList"),
                oSupplierForm = oModel.getProperty("/supplierForm"),
                oSupplierFormButton = this.byId("SupplierFormButton"),
                nValidationError = sap.ui
                    .getCore()
                    .getMessageManager().getMessageModel().oData.length,
                // check invalid value
                bCheckForm = nValidationError === 0;

            // validation form
            for (let key in oSupplierForm) {
                if(!oSupplierForm[key]) {
                    bCheckForm = false;
                }
            }

            oSupplierFormButton.setProperty("enabled", bCheckForm);
        },

        /**
         * Clearing supplier form data.
         */
        onClearForm: function () {
            var oModel = this.getModel("ProductList"),
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

            this.getModel("ProductList").setProperty("/State/deleteSupplier", bIsDelete);
        },

        /**
         * "Delete Suppliers" button press event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onDeleteSupplierPress: function () {
            var sSupplierMessageDelete = this.getI18nWord("supplierMessageDelete"),
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
                sSupplierMessageDeleteSuccessful = this.getI18nWord("supplierMessageDeleteSuccessful"),
                oModel = this.getModel("ProductList"),
                aProducts = oModel.getProperty("/product"),
                aSuppliers = this.getView().getBindingContext("ProductList").getProperty("Suppliers"),
                oSuppliersTable = this.byId("SuppliersTable"),
                aSelectedSuppliers = oSuppliersTable.getSelectedItems(),
                nProductId = this.getView().getBindingContext("ProductList").getProperty("productId"),
                nProductIndex = this._getProductIndex(nProductId),
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