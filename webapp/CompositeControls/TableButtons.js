sap.ui.define(['sap/ui/core/XMLComposite'], function(XMLComposite) {
	"use strict";
	var oTableButtons = XMLComposite.extend("sap.ui.Shop.CompositeControls.TableButtons", {
		metadata: {
			properties: {
				buttonAddText: { type: "string", defaultValue: "add" },
				buttonDeleteText: { type: "string", defaultValue: "delete" },
				enabledAdd: { type: "boolean", defaultValue: true },
				enabledDelete: { type: "boolean", defaultValue: true }
			},
			events: {
				pressAdd: {
					parameters: {
						value: {type: "string"}
					}
				},
				pressDelete: {
					parameters: {
						value: {type: "string"}
					}
				}
			}
		},

		onAddPress: function() {
			this.fireEvent("pressAdd");
		},

		onDeletePress: function() {
			this.fireEvent("pressDelete");
		}
	});
	return oTableButtons;
});
