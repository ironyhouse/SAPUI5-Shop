sap.ui.define([
    "./BaseController",
    "sap/ui/Shop/Controller/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/f/library'
], function (
        BaseController,
        formatter,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Fragment,
        Library
    ) {
	"use strict";
	return BaseController.extend("sap.ui.Shop.controller.ProductInfo", {

        formatter: formatter,

        /**
         * Controller's "init" lifecycle method.
         */
		onInit: function () {
            // Route
            var oRouter = this.getRouterForThis();

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
         *  Bind context to the view.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        _onObjectMatched: function (oEvent) {
            var nProductId = parseInt(oEvent.getParameter("arguments").productId, 10),
                nProductIndex = this._getProductIndex(nProductId);

            // set product index
            this.getModel("State").setProperty("/State/productIndex", nProductIndex)

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
                oRouter = this.getRouterForThis(),
                nProductId = this.getView()
                    .getBindingContext("ProductList")
                    .getProperty("productId"),
                nSupplierId = oSelectedListItem
                    .getBindingContext("ProductList")
                    .getProperty("SupplierId"),
                sSupplierName = oSelectedListItem
                    .getBindingContext("ProductList")
                    .getProperty("SupplierName");

            // set layout
            this.getView().getParent().getParent().setLayout(Library.LayoutType.ThreeColumnsMidExpanded);
            // show end column buttons
            this.getModel("State").setProperty("/State/pageLayoutButtons", false);

            oRouter.navTo("SupplierInfo", {
                productId: nProductId,
                SupplierName: sSupplierName,
                SupplierId: nSupplierId
            });
        },

        /**
         *  This method navigates to product list.
         *
         */
        navToProductList: function () {
			this.myRouter.navTo("ProductList");
        },

        /**
         *  Open middle column in full screen mode.
         */
        onOpenFullScreenMiddleColumn: function () {
            // change layout
            this.getView().getParent().getParent().setLayout(Library.LayoutType.MidColumnFullScreen);
            // change fullscreen button
            this.getModel("State").setProperty("/State/middleColumn", false);
        },

        /**
         *  Open middle column.
         */
        onOpenMiddleColumn: function () {
            // change layout
            this.getView().getParent().getParent().setLayout(Library.LayoutType.TwoColumnsMidExpanded);
            // change fullscreen button
            this.getModel("State").setProperty("/State/middleColumn", true);
        },

        /**
         *  Close middle column.
         */
        onCloseMiddleColumn: function () {
            // change layout
            this.getView().getParent().getParent().setLayout(Library.LayoutType.OneColumn);
            // change fullscreen button
            this.getModel("State").setProperty("/State/middleColumn", true);
        },

        /**
         * "Edit Product" button press event handler.
         */
        onisEditProductPress: function () {
            var nProductIndex = this.getModel("State").getProperty("/State/productIndex"),
                oSuppliersTable = this.byId("SuppliersTable");

            // change delete mode
            oSuppliersTable.setProperty("mode", "MultiSelect");

            // toggle "Edit Product"
            this.getModel("State").setProperty("/State/isEditProduct", true);

            // copy product
            var oProduct = this.getModel("ProductList").getProperty("/product/" + nProductIndex);
            var oOldProduct = jQuery.extend(true, {}, oProduct);
            this.getModel("ProductList").setProperty("/oldProduct", oOldProduct);
        },

        /**
         *  This method change a product.
         */
        onSaveChangesPress: function () {
            var nValidationError = sap.ui
                    .getCore()
                    .getMessageManager().getMessageModel().getData().length,
                oSuppliersTable = this.byId("SuppliersTable");

            if (nValidationError === 0) {
                this.getModel("State").setProperty("/State/isEditProduct", false);

                oSuppliersTable.setProperty("mode", "None");
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
            var oProduct = this.getModel("ProductList").getProperty("/oldProduct"),
                nProductIndex = this.getModel("State").getProperty("/State/productIndex"),
                oSuppliersTable = this.byId("SuppliersTable");

            // remove error message
            sap.ui.getCore().getMessageManager().removeAllMessages();
            // set new value (error)
            var sProductPrice = this.getModel("ProductList").getProperty("/oldProduct/Price"),
                sProductUnit = this.getModel("ProductList").getProperty("/oldProduct/Unit"),
                sProductQuantity = this.getModel("ProductList").getProperty("/oldProduct/Quantity"),
                sProductManufacture = this.getModel("ProductList").getProperty("/oldProduct/Manufacture"),
                sProductCreationDate = this.getModel("ProductList").getProperty("/oldProduct/CreationDate");
            this.byId("ProductPrice").setValue(sProductPrice);
            this.byId("ProductUnit").setValue(sProductUnit);
            this.byId("ProductQuantity").setValue(sProductQuantity);
            this.byId("ProductManufacture").setValue(sProductManufacture);
            this.byId("ProductDate").setValue(sProductCreationDate);


            // toggle edit
            this.getModel("State").setProperty("/State/isEditProduct", false);
            // set old products
            this.getModel("ProductList").setProperty("/product/" + nProductIndex, oProduct);

            // change delete mode
            oSuppliersTable.setProperty("mode", "None");
        },

        /**
         * "Open Popover" button press event handler.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

        /**
         * This method create Popover.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        _getMessagePopover: function () {
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

            // if supplier list empty
            if (!aSuppliers) {
                aSuppliers = []
                oSupplierForm.SupplierId = 0;
            } else {
                // create new supplier id
                oSupplierForm.SupplierId = aSuppliers[aSuppliers.length - 1].SupplierId + 1;
            }

            // set new products
            oModel.setProperty("/product/" + nProductIndex + "/Suppliers/", aSuppliers)
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
                    .getMessageManager().getMessageModel().getData().length,
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

            this.getModel("State").setProperty("/State/isDeleteSupplierButton", bIsDelete);
        },

        /**
         * "Delete Suppliers" button press event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onisDeleteSupplierButtonPress: function () {
            var sSupplierMessageDelete = this.getI18nWord("supplierMessageDelete"),
                onisDeleteSupplierButton = this.onisDeleteSupplierButton.bind(this);

            MessageBox.confirm(
                sSupplierMessageDelete,
                {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            onisDeleteSupplierButton();
                        }
                    },
                }
            );
        },

        /**
         * Execute "delete" request of the supplier.
         */
        onisDeleteSupplierButton: function () {
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
        },

        /**
         *  Get product index.
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

	});
});