let listProductHTML = document.querySelector('.list_menu');
let listCartHTML = document.querySelector('.listCart');
let buttonAction = document.querySelector('.button-action')
let totalPaymentHml = document.querySelector('.total-payment')
let products = [];
let cart = []

function addDataToHTML () {
    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('col-sm-4');
            newProduct.innerHTML =
                `<div class="card card-content">
                        <img class="card-img-top" src="${product.img_url}" alt="...">
                        <div class="card-body">
                            <p class="card-title text-center" style="color: rgb(0, 91, 228);">${product.title_menu}</p>
                            <button class="btn btn-primary float-right">Add</button>
                        </div>
                    </div>`;
            listProductHTML.appendChild(newProduct);
        });
    }
}

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('btn-primary')) {
        let id_product = positionClick.parentElement.parentElement.parentElement.dataset.id
        addToCart(id_product); 
    }

})
function addToCart (product_id) {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart = [{
            product_id: product_id,
            quantity: 1,
        }];
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
    addButtonActionHTML()
    addTotalPaymentHTML()
}

function addCartToMemory () {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function addCartToHTML () {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity = totalQuantity + item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('row', 'item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
                <div class="col-sm" style="margin-top: 20px;">
                    <span class="name_menu">${info.title_menu}</span>
                </div>
                <div class="col-sm" style="margin-top: 20px;">
                    <span class="totalPrice">Rp. ${info.price * item.quantity}</span>
                </div>
                <div class="col-sm" style="margin-top: 20px;">
                    <span class="quantity">
                        <span class="fas fa-minus"></span>
                        <span>${item.quantity}</span>
                        <span class="fas fa-plus"></span>
                    </span>
                </div>
            `;
        })
    }
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('fa-minus') || positionClick.classList.contains('fa-plus')) {
        let product_id = positionClick.parentElement.parentElement.parentElement.dataset.id;
        console.log(product_id, "click plus minus");
        let type = 'minus';
        if (positionClick.classList.contains('fa-plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
function changeQuantityCart (product_id, type) {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;

            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
    addTotalPaymentHTML()
}

function addButtonActionHTML () {
    buttonAction.innerHTML = ''
        let buttonInsert = document.createElement('div');
        buttonInsert.classList.add('col');
        buttonInsert.innerHTML = `<button class="btn btn-info float-right" onclick="submitCheckout()">
                                                    Submit
                                                </button>
                                                <button class="btn btn-danger float-right" onclick="removeButtonActionHtml()">
                                                    Cancel
                                                </button>`
        buttonAction.appendChild(buttonInsert)
}

function addTotalPaymentHTML () {
    totalPaymentHml.innerHTML = ''
    let totalPaymentInsert = document.createElement('div');
    totalPaymentInsert.classList.add('col');
    let totalPayment = 0
    // console.log(cart, "cart");
    // console.log(products, "products");
    cart.forEach(item => {
        products.forEach(product => {
            product.id = product.id.toString()
            if(item.product_id === product.id){
                totalPayment = totalPayment + (item.quantity * product.price)
            }
        })
        totalPaymentInsert.innerHTML = `<span>Total Payment : </span><span>Rp. ${totalPayment}</span>`
    })
    totalPaymentHml.appendChild(totalPaymentInsert)
}

function removeButtonActionHtml () {
    buttonAction.innerHTML = ''
    listCartHTML.innerHTML = '';
    totalPaymentHml.innerHTML = ''
    cart = []
    localStorage.clear();
}

async function submitCheckout(){
    let post_data = {
        created_time: new Date(),
        list_order: [],
        total_payment: 0
    };

    products.forEach(product => {
        product.id = product.id.toString();
        product['quantity'] = 0
        cart.forEach(item => {
            if(product.id === item.product_id){
                product['quantity'] = product['quantity'] + item['quantity'] 
                console.log(product, "Product before push");
                post_data.list_order.push({...product});
                post_data.total_payment += product.price * item.quantity;
            }
        });
    });

    console.log(post_data, "Post Data");

    const result = await Swal.fire({
        title: "Are you sure?",
        icon: "question",
        showCancelButton: true
    });

    console.log(result, "result");

    if (!result.isConfirmed) {
        return;
    }

    fetch(`https://pos-wcdo.onrender.com/order_report`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post_data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data, "Response Data");
        Swal.fire({
            title: "Success Created",
            icon: "success",
            timer: 2000,
          });
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({
            title: error,
            icon: "error",
            timer: 5000,
          });
    });
}


function initApp () {
    fetch('https://pos-wcdo.onrender.com/list_menu')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();
        })
}
initApp();

window.onbeforeunload = function (e) {
    localStorage.clear();
};


