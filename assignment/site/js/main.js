var finalOrder = {};
var orderLineItems = {};
var finalAmount = 0;

$(document).ready(function () {
    loadProducts();

    $("#place-order-button").click(function () {
        fetch('OrderProcessingServlet', {
            method: 'POST',
            body: JSON.stringify({ 'order': finalOrder }),
            headers: { 'content-type': 'application/json' },
        })
            .then(function (response) {
                if (response.ok) {
                    console.log('Post Non Apple Payment successful !');
                } else {
                    console.log('Post Non Apple Payment Post failed !!!');
                }
            });
    });
    displaySelectedItemsDiv(false);
    disableNonApplePayButton(true);
});

function disableNonApplePayButton(disable) {
    $("#place-order-button").prop('disabled', disable);
}

function displaySelectedItemsDiv(display) {
    if (display) {
        $("#selected-products-div").show();
    } else {
        $("#selected-products-div").hide();
    }
}

function loadProducts() {
    $.getJSON('content/products.json', function (data) {
        var listItems = [];

        $.each(data, function (key, val) {
            var orderLineItem = {
                "product": val,
                "count": 0
            };

            orderLineItems[orderLineItem.product.id] = orderLineItem;

            var listItem = 
                '<li>' +
                    '<a href="#">' +
                        '<img src="content/assets/productImages/' + orderLineItem.product.image + '"/>' + 
                        '<div class="wrapper"' +
                        '<h2>' + orderLineItem.product.name + '</h2>' +
                        '<p> ' + orderLineItem.product.description + '</p>' +
                        (typeof(orderLineItem.product.options) == "undefined" ? 
                            '<p>$' + (orderLineItem.product.price / 100) + '</p>' :
                            buildOptions(orderLineItem.product.options)) +
                        '</div>' +
                    '</a>' +
                    '<a id="btn_' + orderLineItem.product.id + '_add" onclick="productAdded(this)" href="#purchase" data-rel="popup" data-position-to="window" data-transition="pop">+</a>' +
                '</li>';

            listItems.push(listItem);
        });

        $("#all-products").append(listItems.join(''));
        // Task 2: Add the missing line. Hint: The list may need to be refreshed to reapply the styles as the list is build dynamically instead of static
        // $("#all-products").listview('refresh');
    });
}

function buildOptions(options) {
    var optionsHTML = '<p>';

    $.each(options, function(size, price) {
        optionsHTML = optionsHTML +
        '<button onclick="console.log(\'hello\')">' + size + '</button>&nbsp;&nbsp;'
    });

    optionsHTML = optionsHTML + '</p>';

    return optionsHTML;
}

function productAdded(component) {
    var productId = getProductId(component.id);
    var orderLineItem = orderLineItems[productId];
    orderLineItem.count = orderLineItem.count + 1;
    orderLineItems[productId] = orderLineItem;
    calculatePrice();
    disableNonApplePayButton(false);
    repaintSelectedList();
}

function productRemoved(component) {
    var productId = getProductId(component.id);
    var orderLineItem = orderLineItems[productId];
    if (orderLineItem.count > 0) {
        orderLineItem.count = orderLineItem.count - 1;
        orderLineItems[productId] = orderLineItem;
        console.log(productId + " - " + orderLineItem.count);
    }
    calculatePrice();
    repaintSelectedList();
    if (orderLineItem.count == 0) disableNonApplePayButton(true);
}

function repaintSelectedList() {
    var listSelectedItems = [];
    $.each(orderLineItems, function (key, orderLineItem) {
        if (orderLineItem.count != 0) {

            var listSelectedItem = 
                '<li>' +
                    '<a href="#">' +
                        '<img src="content/assets/productImages/' + orderLineItem.product.image + '"/>' + 
                        '<div class="wrapper"' +
                        '<h2>' + orderLineItem.product.name + '</h2>' +
                        '<p>' + (orderLineItem.count) + '</p>' +
                        '</div>' +
                        '<a id="btn_' + orderLineItem.product.id + '_add" onclick="productRemoved(this)" href="#purchase" data-rel="popup" data-position-to="window" data-transition="pop">-</a>' +
                '</li>';

            listSelectedItems.push(listSelectedItem);
        }
    });

    $("#selected-products").empty();
    $("#selected-products").append(listSelectedItems.join(''));
    // $("#selected-products").listview('refresh');

    if (listSelectedItems.length == 0) {
        displaySelectedItemsDiv(false);
    } else {
        displaySelectedItemsDiv(true);
    }
}

function getProductId(componentId) {
    var firstIndex = componentId.indexOf('_') + 1;
    var lastIndex = componentId.lastIndexOf('_');

    return componentId.substring(firstIndex, lastIndex);
}

function calculatePrice() {
    var subTotal = 0.0;
    var finalOrderItems = [];

    $.each(orderLineItems, function (key, orderLineItem) {
        if (orderLineItem.count != 0) {
            subTotal = subTotal + orderLineItem.count * orderLineItem.product.price;
            finalOrderItems.push(orderLineItem);
        }
    });
    var formattedSubTotal = subTotal / 100.0;

    $("#payment_amount").text("$" + formattedSubTotal);

    finalOrder = {
        "finalOrderItems": finalOrderItems,
        "subTotal": subTotal,
        "formattedSubTotal": formattedSubTotal
    };

    finalAmount = subTotal;
    console.log('Final amount : ' + finalAmount)
    console.log(JSON.stringify(finalOrder));
}

