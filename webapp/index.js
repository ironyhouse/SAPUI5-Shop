sap.ui.define(["sap/ui/core/ComponentContainer"], function (
    ComponentContainer
) {
    "use strict";

    new ComponentContainer({
        name: "sap.ui.Shop",
        settings: {
            id: "Shop",
        },
        async: true,
    }).placeAt("content");
});
