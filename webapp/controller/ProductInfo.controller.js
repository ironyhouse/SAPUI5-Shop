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
        Fragment
    ) {
	"use strict";
	return BaseController.extend("sap.ui.Shop.controller.ProductInfo", {

        formatter: formatter,

        /**
         * Controller's "init" lifecycle method.
         */
		onInit: function () {
            var oView = this.getView(),
                oRouter = this.getRouterForThis(),
                oMessageManager = sap.ui.getCore().getMessageManager();

            // Route
            oRouter
                .getRoute("ProductInfo")
                .attachPatternMatched(this._onProductMatched, this);

            oRouter
                .getRoute("SupplierInfo")
                .attachPatternMatched(this._onProductMatched, this);
            this.myRouter = oRouter;

            // Validation
			oView.setModel(oMessageManager.getMessageModel(), "message");
            oMessageManager.registerObject(oView, true);
        },

        /**
         *  Bind context to the view.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        _onProductMatched: function (oEvent) {
            var sLayoutName = oEvent.getParameter("arguments").sLayoutName,
                nProductId = parseInt(oEvent.getParameter("arguments").nProductId, 10),
                nProductIndex = this._getProductIndex(nProductId);

            // set product property
            this.nProductIndex = nProductIndex;
            this.nProductId = nProductId;

            // toggle fullscreen buttons
            if (sLayoutName === "MidColumnFullScreen") {
                this.getModel("State").setProperty("/State/isFullScreenMiddleColumn", true);
                this.getModel("State").setProperty("/State/isShowEndColumnButtons", false);
            }
            if (sLayoutName === "TwoColumnsMidExpanded") {
                this.getModel("State").setProperty("/State/isFullScreenMiddleColumn", false);
                this.getModel("State").setProperty("/State/isShowEndColumnButtons", false);
            }

            // set page layout
            this.setLayout(sLayoutName);

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
                nProductId = this.nProductId,
                sSupplierName = oSelectedListItem
                    .getBindingContext("ProductList")
                    .getProperty("SupplierName");

            // set layout
            this.setLayout("ThreeColumnsMidExpanded");
            // show end column buttons
            this.getModel("State").setProperty("/State/isShowEndColumnButtons", true);

            oRouter.navTo("SupplierInfo", {
                nProductId: nProductId,
                sSupplierName: sSupplierName,
                sLayoutName: "ThreeColumnsMidExpanded"
            });
        },

        /**
         *  Open middle column in full screen mode.
         */
        onOpenFullScreenMiddleColumn: function () {
            // change layout
            this.setLayout("MidColumnFullScreen");
            // change fullscreen button
            this.getModel("State").setProperty("/State/isFullScreenMiddleColumn", true);

            this.getRouterForThis().navTo("ProductInfo",
            {
                nProductId: this.nProductId,
                sLayoutName: "MidColumnFullScreen"
            });
        },

        /**
         *  Open middle column.
         */
        onCloseFullScreenMiddleColumn: function () {
            // change layout
            this.setLayout("TwoColumnsMidExpanded");
            // change fullscreen button
            this.getModel("State").setProperty("/State/isFullScreenMiddleColumn", false);

            this.getRouterForThis().navTo("ProductInfo",
            {
                nProductId: this.nProductId,
                sLayoutName: "TwoColumnsMidExpanded"
            });
        },

        /**
         *  Close middle column.
         */
        onCloseMiddleColumn: function () {
            // change layout
            this.setLayout("OneColumn");
            // change fullscreen button
            this.getModel("State").setProperty("/State/isFullScreenMiddleColumn", false);

            this.getRouterForThis().navTo("ProductList");
        },

        /**
         * "Edit Product" button press event handler.
         */
        onEditProductPress: function () {
            var nProductIndex = this.nProductIndex,
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
         * "Open Cancel Edit Popover" button press event handler.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        onCancelChangesPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView();

                // create popover
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.Shop.view.fragments.CancelEditPopover",
                        controller: this
                    }).then(function(oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
                this._pPopover.then(function(oPopover) {
                    oPopover.openBy(oButton);
                });
        },

        /**
         * This method cancels edit.
         */
        onCancelChanges: function () {
            var oProduct = this.getModel("ProductList").getProperty("/oldProduct"),
                nProductIndex = this.nProductIndex,
                oSuppliersTable = this.byId("SuppliersTable");

            // remove error message
            sap.ui.getCore().getMessageManager().removeAllMessages();
            // set new value (error)
            var sProductPrice = this.getModel("ProductList").getProperty("/oldProduct/Price"),
                sProductUnit = this.getModel("ProductList").getProperty("/oldProduct/Unit"),
                sProductQuantity = this.getModel("ProductList").getProperty("/oldProduct/Quantity"),
                sProductManufacture = this.getModel("ProductList").getProperty("/oldProduct/Manufacture");
            this.byId("ProductPrice").setValue(sProductPrice);
            this.byId("ProductUnit").setValue(sProductUnit);
            this.byId("ProductQuantity").setValue(sProductQuantity);
            this.byId("ProductManufacture").setValue(sProductManufacture);

            // toggle edit
            this.getModel("State").setProperty("/State/isEditProduct", false);
            // set old products
            this.getModel("ProductList").setProperty("/product/" + nProductIndex, oProduct);

            // change delete mode
            oSuppliersTable.setProperty("mode", "None");
        },

        /**
         * "Open Error Popover" button press event handler.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

        /**
         * This method create Error Popover.
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
                oModel = this.getModel("ProductList"),
                oProducts = oModel.getProperty("/product"),
                oSupplierForm = oModel.getProperty("/supplierForm"),
                oSupplierCreatorForm = this.byId("supplierCreator"),
                nProductIndex = this.nProductIndex,
                // get product suppliers
                aSuppliers = oProducts[nProductIndex].Suppliers,
                nSupplierLength;

            // copy supplier form
            oSupplierForm = jQuery.extend(true, {}, oSupplierForm);

            // if supplier list empty
            if (!aSuppliers) {
                aSuppliers = []
                oSupplierForm.SupplierId = 0;
                nSupplierLength = 0;
                oModel.setProperty("/product/" + nProductIndex + "/Suppliers/", aSuppliers);
            } else {
                // create new supplier id
                oSupplierForm.SupplierId = aSuppliers[aSuppliers.length - 1].SupplierId + 1;
                nSupplierLength = aSuppliers.length;
            }

            // set new products
            oModel.setProperty("/product/" + nProductIndex + "/Suppliers/" + nSupplierLength, oSupplierForm)
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
                bCheckForm = true;

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
                if(oSupplierForm.hasOwnProperty(key)) {
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
            this.getModel("State").setProperty("/State/isShowDeleteSupplierButton", bIsDelete);
        },

        /**
         * "Delete Suppliers" button press event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onDeleteSupplierButtonPress: function () {
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
                nProductIndex = this.nProductIndex,
                onSelectSupplier = this.onSelectSupplierPress.bind(this);

            // filtered suppliers
            if (aSelectedSuppliers.length) {
                aSuppliers = aSuppliers.filter(function(item) {
                    var isValid = true;
                    // check item
                    for (var i = 0; i < aSelectedSuppliers.length; i++) {
                        nSupplierId = aSelectedSuppliers[i].getBindingContext("ProductList").getProperty("SupplierId")
                        if (item.SupplierId === nSupplierId) {
                            isValid = false;
                            break;
                        }
                    }
                    return isValid
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
                if (item.nProductId === nProductId) {
                    nProductIndex = index;
                }
            });

            return nProductIndex;
        },

	});
});