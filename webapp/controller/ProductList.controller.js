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
		return BaseController.extend("sap.ui.Shop.controller.ProductList", {

			/**
             * Controller's "init" lifecycle method.
             */
			onInit: function () {

				// Register the view with the message manager
				this.getMessageManager().registerObject(this.getView(), true);

				// bind product list items
				var oTable = this.byId("ProductsTable")
				Fragment.load({
						id: this.getView().getId(),
						name: "sap.ui.Shop.view.fragments.ProductList.ListItem",
						controller: this,
				})
				.then(function (oFragment) {
					oTable.bindItems({
						path: "ProductList>/product",
						template: oFragment,
					})
				})
			},

			/**
             *  This method navigates to product info.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
             */
			onNavToProductInfo: function (oEvent) {
				var oSelectedListItem = oEvent.getSource(),
					oRouter = this.getRouterForThis(),
					nProductId = oSelectedListItem
						.getBindingContext("ProductList")
						.getProperty("nProductId");

				// set layout
				this.setLayout("TwoColumnsMidExpanded");
				// show middle column buttons
				this.getModel("State").setProperty("/State/isShowEndColumnButtons", false);

				oRouter.navTo("ProductInfo",
					{
						nProductId: nProductId,
						sLayoutName: "TwoColumnsMidExpanded"
					});
			},

			/**
             * "Filter" event handler of the "FilterBar".
             */
			onSelectFilter: function () {
				var oProductsTable = this.byId("ProductsTable"),
					oItemsBinding = oProductsTable.getBinding("items"),
					sQueryName = this.getView().byId("FilterName").getValue(),
					sQueryManufacture = this.byId("SelectManufacture").getSelectedKey();

				if (sQueryManufacture === "All") { sQueryManufacture = "" };

				var aFilter = new Filter({
					filters: [
						new Filter("ProductName", FilterOperator.Contains, sQueryName),
						new Filter("Manufacture", FilterOperator.Contains, sQueryManufacture)
					],
					and: true
				});

				// execute filtering
				oItemsBinding.filter(aFilter);
			},

			/**
             * "Clear" button press event handler of the "FilterBar".
             */
			onFiltersClear: function () {
				var oManufacture = this.byId("SelectManufacture"),
					oProductsTable = this.byId("ProductsTable"),
					oItemsBinding = oProductsTable.getBinding("items");

				// change selected item
				oManufacture.setSelectedItem(oManufacture.getItems()[0], true, true);
				// clear search input
				this.getView().byId("FilterName").setValue();
				// update product list
				oItemsBinding.filter();
			},

			/**
             * "Create product" button press event handler.
			 * 	This method opens product form popover.
             */
			onAddProductPress: function () {
				var oView = this.getView(),
					oModel = oView.getModel("ProductList"),
					oProductForm = oModel.getProperty("/productForm"),
					oStoreCreatorForm = this.byId("productCreator"),
					onClearForm = this.onClearForm.bind(this);

				// Error: The given date instance isn't valid
				oProductForm.CreationDate = new Date();

				// create dialog lazily
				if (!oStoreCreatorForm) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "sap.ui.Shop.view.fragments.ProductCreationForm",
						controller: this
					}).then(function(oStoreCreatorForm) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oStoreCreatorForm);
						// clear form
						onClearForm();
						// show form
						oStoreCreatorForm.open();
					});
				} else {
					// clear form
					onClearForm();
					// show form
					oStoreCreatorForm.open();
				}
			},

			/**
             *  This method create a product.
             */
            onCreateProductPress: function () {
				var oModel = this.getModel("ProductList"),
					oStoreCreatorForm = this.byId("productCreator"),
					sNotApplicable = this.getI18nWord("notApplicable"),
					// get product list
					oProducts = oModel.getProperty("/product"),
					// get product form
					oProductForm = oModel.getProperty("/productForm"),
					// product length
					nProductLength = oProducts.length,
					sProductMessageCreate;

				// copy product form
				oProductForm = jQuery.extend(true, {}, oProductForm);

				// create new product id
				oProductForm.nProductId = oProducts[oProducts.length - 1].nProductId + 1;
				// set product img
				oProductForm.ProductImage = "https://picsum.photos/200/300";
				// if product info empty
				if (!oProductForm["ProductInfo"]) {
					oProductForm["ProductInfo"] = sNotApplicable;
				}

				// set new products
				oModel.setProperty("/product/" + nProductLength, oProductForm);

				// set product name
				sProductMessageCreate = this.getI18nWord("productCreate", oProductForm.ProductName);
				// show message
				MessageToast.show(sProductMessageCreate);

				// close dialog
				oStoreCreatorForm.close();
			},

			/**
             * "Cancel" button press event handler (in the dialog).
			 *  This method closes product form popover.
             */
            onCancelProductPress: function () {
				this.byId("productCreator").close();
			},

			/**
			 * Check form for validation.
			 */
			checkFormValid: function () {
				var oModel = this.getModel("ProductList"),
					oProductForm = oModel.getProperty("/productForm"),
					oProductFormButton = this.byId("ProductFormButton"),
					nValidationError = this.getMessageManager().getMessageModel().getData().length,
					// check invalid value
					bCheckForm = nValidationError === 0;

				// check empty value
				for (let key in oProductForm) {
					if(!oProductForm[key] && key !== "ProductInfo") {
						bCheckForm = false;
					}
				}

				// toggle form button
				oProductFormButton.setProperty("enabled", bCheckForm);
			},

			/**
			 * Clear product form data.
			 */
			onClearForm: function () {
				var oModel = this.getModel("ProductList"),
					oProductForm = oModel.getProperty("/productForm");

				// clear form
				for (let key in oProductForm) {
					oProductForm[key] = null;
					this.byId(key).setValue("");
				}

				// clear error message
				this.getMessageManager().removeAllMessages();

				// set min date
				this.byId("CreationDate").setMinDate(new Date());
				// creat new date
				oProductForm.CreationDate = new Date();
				// set product form
				this.getModel("ProductList").setProperty("/productForm", oProductForm);
			},

			/**
             * Row selection event handler.
             */
			onSelectProductPress: function () {
				var bIsDelete = !!this.byId("ProductsTable").getSelectedItems().length;
				this.getModel("State").setProperty("/State/isShowDeleteProductButton", bIsDelete);
			},

            /**
             * This method show delete product confirmation.
             */
			onDeleteProductButtonPress: function () {
				var oModel = this.getModel("ProductList"),
					// get product list
					aProducts = oModel.getProperty("/product"),
					// get product Id
					oSelectItem = this.byId("ProductsTable")
						.getSelectedItem()
						.getBindingContext("ProductList"),
					nProductId = oSelectItem.getProperty("nProductId"),
					sProductName = oSelectItem.getProperty("ProductName"),
					sMessage;

				// get delete message
				sMessage = this.getI18nWord("productMessageDelete", sProductName)

				// show confirmation
                MessageBox.confirm(
                    sMessage,
                    {
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                this.onDeleteProduct(aProducts, nProductId, sProductName);
                            }
                        }.bind(this),
                    }
                );
			},

            /**
             * Execute "delete" request of the product.
             *
			 * @param {Array} aProducts products list.
             * @param {number} nProductId product Id.
			 * @param {Array} sProductName message words.
             */
            onDeleteProduct: function (aProducts, nProductId, sProductName) {
                var oModel = this.getModel("ProductList"),
					sMessage = this.getI18nWord("productMessageDeleteSuccessful", sProductName);

				// filtered products
				aProducts = aProducts.filter(item => item.nProductId !== nProductId);

				// set filtered products
				oModel.setProperty("/product", aProducts);
				// show message
				MessageToast.show(sMessage);

				// clear selections
				this.byId("ProductsTable").removeSelections();
				// toggle delete button
				this.onSelectProductPress();
            },

		});
});