sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (
        BaseController,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Fragment
    ) {
	"use strict";
	return BaseController.extend("sap.ui.Shop.controller.ProductInfo", {

        /**
         * Controller's "init" lifecycle method.
         */
		onInit: function () {
            var oView = this.getView(),
                oRouter = this.getRouterForThis(),
                oMessageManager = this.getMessageManager();

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
         *
         *  @param {sap.ui.base.Event} oEvent event object.
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
         *  This method changes page to edit mode.
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
            var nValidationError = this.getMessageManager().getMessageModel().getData().length,
                oSuppliersTable = this.byId("SuppliersTable");

            if (nValidationError === 0) {
                this.getModel("State").setProperty("/State/isEditProduct", false);

                oSuppliersTable.setProperty("mode", "None");
            }
        },

        /**
         *  This method opens popover.
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
         * This method discards edit.
         */
        onCancelChanges: function () {
            var oProduct = this.getModel("ProductList").getProperty("/oldProduct"),
                nProductIndex = this.nProductIndex,
                oSuppliersTable = this.byId("SuppliersTable");

            // remove error message
            this.getMessageManager().removeAllMessages();
            // set new value (error)
            var sProductPrice = this.getModel("ProductList").getProperty("/oldProduct/Price"),
                sProductUnit = this.getModel("ProductList").getProperty("/oldProduct/Unit"),
                sProductQuantity = this.getModel("ProductList").getProperty("/oldProduct/Quantity"),
                sProductManufacture = this.getModel("ProductList").getProperty("/oldProduct/Manufacture");
            this.byId("ProductPrice").setValue(sProductPrice);
            this.byId("ProductUnit").setValue(sProductUnit);
            this.byId("ProductQuantity").setValue(sProductQuantity);
            this.byId("ProductManufacture").setValue(sProductManufacture);
            this.byId("ProductManufacture").setProperty("valueState", "None");

            // toggle edit
            this.getModel("State").setProperty("/State/isEditProduct", false);
            // set old products
            this.getModel("ProductList").setProperty("/product/" + nProductIndex, oProduct);

            // change delete mode
            oSuppliersTable.setProperty("mode", "None");
        },

        /**
         * This method clears input error state.
         */
        onManufactureChange: function () {
            this.byId("ProductManufacture").setProperty("valueState", "None");
        },

        /**
         * This method validates combobox.
         */
        onEnterValue: function () {
            var oCombobox = this.byId("ProductManufacture"),
                aBoxItems = oCombobox.getItems(),
                sInputValue = oCombobox.getValue();

            for (var i = 0; i < aBoxItems.length; i++) {
                if (aBoxItems[i].getText() === sInputValue) {
                    return
                }
            }

            oCombobox.setProperty("valueState", "Error");
            oCombobox.setProperty("showValueStateMessage", true);
        },

        /**
         * This method open error popover.
         *
         *  @param {sap.ui.base.Event} oEvent event object.
         */
        onMessagePopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
            oView = this.getView();

            // create popover
            if (!this._pPopoverError) {
                this._pPopoverError = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.Shop.view.fragments.MessageErrorPopover",
                    controller: this
                }).then(function(oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pPopoverError.then(function(oPopover) {
                oPopover.openBy(oButton);
            });
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
         * "Add (supplier)" button press event handler.
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
            var oModel = this.getModel("ProductList"),
                oProducts = oModel.getProperty("/product"),
                oSupplierForm = oModel.getProperty("/supplierForm"),
                oSupplierCreatorForm = this.byId("supplierCreator"),
                sNotApplicable = this.getI18nWord("notApplicable"),
                nProductIndex = this.nProductIndex,
                // get product suppliers
                aSuppliers = oProducts[nProductIndex].Suppliers,
                sSupplierMessageCreate,
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

            // if city empty
            if (!oSupplierForm["SuppliersCity"]) {
                oSupplierForm["SuppliersCity"] = sNotApplicable;
            }

            // set new products
            oModel.setProperty("/product/" + nProductIndex + "/Suppliers/" + nSupplierLength, oSupplierForm);

            // get message
            sSupplierMessageCreate = this.getI18nWord("supplierCreate", oSupplierForm.SupplierName );
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
         * Check supplier form for validation.
         */
        checkFormValid: function () {
            var oModel = this.getModel("ProductList"),
                oSupplierForm = oModel.getProperty("/supplierForm"),
                oSupplierFormButton = this.byId("SupplierFormButton"),
                bCheckForm = true;

            // validation form
            for (let key in oSupplierForm) {
                if(!oSupplierForm[key] && key !== "SuppliersCity") {
                    bCheckForm = false;
                }
            }

            oSupplierFormButton.setProperty("enabled", bCheckForm);
        },

        /**
         * Clear supplier form data.
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
         * Row selection event handler.
         * After selection "delete button" will be enabled.
         */
        onSelectSupplierPress: function () {
            var bIsDelete = !!this.byId("SuppliersTable").getSelectedItems().length;
            this.getModel("State").setProperty("/State/isShowDeleteSupplierButton", bIsDelete);
        },

        /**
         * This method show delete supplier confirmation.
         *
         * @param {sap.ui.base.Event} oEvent event object
         */
        onDeleteSupplierButtonPress: function () {
            var sSupplierMessageDelete = this.getI18nWord("supplierMessageDelete");

            MessageBox.confirm(
                sSupplierMessageDelete,
                {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            this.onDeleteSupplier();
                        }
                    }.bind(this),
                }
            );
        },

        /**
         * Execute "delete" request of the supplier.
         */
        onDeleteSupplier: function () {
            var sSupplierMessageDeleteSuccessful = this.getI18nWord("supplierMessageDeleteSuccessful"),
                oModel = this.getModel("ProductList"),
                aProducts = oModel.getProperty("/product"),
                aSuppliers = this.getView().getBindingContext("ProductList").getProperty("Suppliers"),
                oSuppliersTable = this.byId("SuppliersTable"),
                aSelectedSuppliers = oSuppliersTable.getSelectedItems(),
                nProductIndex = this.nProductIndex,
                nSupplierId;

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
            this.onSelectSupplierPress();
        },

        /**
         *  Get product index.
         * @param {number} nProductId product ID.
         *
         * @return {number} product index.
         * 
         * @private
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