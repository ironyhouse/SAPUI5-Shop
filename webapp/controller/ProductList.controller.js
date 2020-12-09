sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
	], function (
		Controller,
		Filter,
		FilterOperator,
		MessageToast,
		MessageBox,
		Fragment
	) {
		"use strict";
		return Controller.extend("sap.ui.Shop.controller.ProductList", {
			/**
             * Controller's "init" lifecycle method.
             */
			onInit: function () {

				// Register the view with the message manager
				sap.ui
					.getCore()
					.getMessageManager()
					.registerObject(this.getView(), true);
			},

			/**
             *  This method navigates to product info.
             */
			onNavToProductInfo: function (oEvent) {
				var oSelectedListItem = oEvent.getSource(),
					oRouter = sap.ui.core.UIComponent.getRouterFor(this),
					nProductId = oSelectedListItem
						.getBindingContext("ProductList")
						.getProperty("productId");

				oRouter.navTo("ProductInfo", { productId: nProductId });
			},








			onInputChange: function (oEvent) {

			},

			/**
             * "Filter" event handler of the "FilterBar".
             */
			onSelectFilter: function () {
				var oProductsTable = this.byId("ProductsTable"),
					oItemsBinding = oProductsTable.getBinding("items"),
					sQueryName = this.getView().byId("FilterName").getValue(),
					sQueryManufacture = this.byId("FilterManufacture").getSelectedKey();

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
				var oManufacture = this.byId("FilterManufacture"),
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
             * "Product Select" button press event handler.
             */
			onSelectProductPress: function () {
				var bIsDelete = !!this.byId("ProductsTable").getSelectedItems().length;
				this.getView().getModel("ProductList").setProperty("/State/deleteProduct", bIsDelete);
			},

			/**
             * "Create product" button press event handler.
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
				var sProductMessageCreate = this.getView().getModel("i18n").getProperty("productCreate"),
					oModel = this.getView().getModel("ProductList"),
					// get product list
					oProducts = oModel.getProperty("/product"),
					// get product form
					oProductForm = oModel.getProperty("/productForm"),
					bCheckForm;

				// copy product form
				oProductForm = jQuery.extend(true, {}, oProductForm);

				// check form
				bCheckForm = this.checkFormValid(oProductForm);

				if (bCheckForm) {
					// create new product id
					oProductForm.productId = oProducts[oProducts.length - 1].productId + 1;
					// set product img
					oProductForm.ProductImage = "https://picsum.photos/200/300";

					// add product
					oProducts.push(oProductForm);
					// set new products
					oModel.setProperty("/product", oProducts)
					// show message
					MessageToast.show(sProductMessageCreate);
					// close dialog
					this.byId("productCreator").close();
				}
			},

			/**
			 * Check form validation.
			 */
			checkFormValid: function (oProductForm) {
				var nValidationError = sap.ui
					.getCore()
					.getMessageManager().getMessageModel().oData.length,
					// check invalid value
					bCheckForm = nValidationError === 0;

				// check empty value
				for (let key in oProductForm) {
					if(!oProductForm[key]) {
						bCheckForm = false;
						this.byId(key).setProperty("valueState", "Error");
					} else {
						this.byId(key).setProperty("valueState", "None");
					}
				}

				return bCheckForm;
			},

			/**
             * "Cancel" button press event handler (in the dialog).
             */
            onCancelProductPress: function () {
				this.byId("productCreator").close();
				this.onClearForm()
			},

			/**
			 * Clearing product form data.
			 */
			onClearForm: function () {
				var oModel = this.getView().getModel("ProductList"),
					oProductForm = oModel.getProperty("/productForm");

				// clear form
				for (let key in oProductForm) {
					oProductForm[key] = null;
					this.byId(key).setProperty("valueState", "None");
				}

				// set min date
				this.byId("CreationDate").setMinDate(new Date());
				// creat new date
				oProductForm.CreationDate = new Date();
				// set product form
				this.getView().getModel("ProductList").setProperty("/productForm", oProductForm);
			},

            /**
             * Execute "delete" request of the product.
             */
			onDeleteProductPress: function () {
				var oModel = this.getView().getModel("ProductList"),
					// get product list
					aProducts = oModel.getProperty("/product"),
					// get product Id
					nProductId = this.byId("ProductsTable").getSelectedItem().getBindingContext("ProductList").getProperty("productId"),
					onDeleteProduct = this.onDeleteProduct.bind(this),
					oBundle = this.getView().getModel("i18n").getResourceBundle(),
					sMessageWord = [];

				// get product name
				aProducts.forEach(item => {
					if (item.productId === nProductId) {
						sMessageWord.push(item.ProductName);
					}
				});

				// get delete message
				var sMessage = oBundle.getText("productMessageDelete", sMessageWord);

				// show confirmation
                MessageBox.confirm(
                    sMessage,
                    {
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                onDeleteProduct(aProducts, nProductId, sMessageWord);
                            }
                        },
                    }
                );
			},

            /**
             * Execute "delete" request of the product.
             *
             * @param {number} nProductId event object
             */
            onDeleteProduct: function (aProducts, nProductId, sMessageWord) {
                var oModel = this.getView().getModel("ProductList"),
					oBundle = this.getView().getModel("i18n").getResourceBundle(),
					sMessage = oBundle.getText("productMessageDeleteSuccessful", sMessageWord);

				// filtered products
				aProducts = aProducts.filter(item => item.productId !== nProductId);

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