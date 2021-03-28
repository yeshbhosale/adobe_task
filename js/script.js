$(".right_container_for_mobile").click(function () {
	$(".right_container").addClass("active");
});
$(".close_inmobile").click(function () {
	$(".right_container").removeClass("active");
});

let cart = [];
let button_all = [];
cardDetails = document.querySelector(".item_cart_body");

class UI {
  displayProducts(items){
    let display = "";
    items.forEach(item => {
      display += ` <div id="item_details" class="item_details_bx">
              <div class="img_container">
                <img id="itemImg"  src=${item.image}>
                <div  class="discount_tag">
                  <p id="dt">${item.discount}% off</p>
                </div>
              </div>
              <div class="item_price_action">
                <div class="item_heading">${item.name}</div>
                <div class="item_action">
                  <span class="discounted_price">Rs ${item.price.display}</span>
                  <span class="actual_price">Rs ${item.price.actual}</span>
                  <div class="cart_button">
                    <button class="add_to_cart" data-id= ${item.id}>ADD TO CART</button>
                  </div>
                </div>
              </div>
            </div>`
    });
    const displayProduct = document.querySelector("#card_block");
    displayProduct.innerHTML = display;
  }


  getButtons(){
    const buttons = [...document.querySelectorAll('.add_to_cart')];
    button_all = buttons;

    buttons.forEach(button => {
      const id = button.dataset.id;
      const inCart = cart.find(item => item.id === id);
      if(inCart){
        button.innerText = 'IN CART';
        button.disabled = true;
      }

      button.addEventListener('click', e=> {
        e.preventDefault();
        e.target.innerText = 'IN CART';
        e.target.disabled = true;

        const cartItem = { ...Storage.getProduct(id), count: 1 };

        cart = [...cart, cartItem];

        Storage.saveCart(cart);
        this.setItemValues(cart);
        this.addToCard(cartItem); 
      })
    });
    
  }

  setItemValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    let totalMrp  = 0;
    let totalDiscount = 0;
    // let itemTotalCost = 0;
    

    cart.map(item => {
      itemTotal += item.count;
      tempTotal += item.price.actual * item.count;
      totalMrp += item.price.display * item.count;
      totalDiscount += (item.price.display* item.count) - (item.price.actual* item.count);
      // itemTotalCost = item.price.actual * item.count;
    });
    const item_total = document.querySelector('.items_count_num');
    const cart_total = document.querySelector('.cart_total_amount');
    const total_mrp = document.querySelector('.items_mrp');
    const total_dis = document.querySelector('.items_dis')
    // const itemCost = document.querySelector('.total_item_price');

    item_total.innerHTML = "(" + itemTotal + ")";
    total_mrp.innerHTML = "Rs " + totalMrp;
    total_dis.innerHTML = "Rs " + totalDiscount;
    cart_total.innerHTML = "Rs " + parseFloat(tempTotal.toFixed(2));
    // itemCost.innerHTML = "Rs" + itemTotalCost
  }

  addToCard(item){
    const div = document.createElement('div');
    div.classList.add('item_cart_body');
    div.innerHTML = `<div class="item_each_row">
                    <div class="expirement">
                    <div class="img_container">
                      <img id="cart_item_img"  src=${item.image}>
                    </div>
                    <div class="item_name">
                      ${item.name}
                    </div>
                    <div class="item_delete remove__item" data-id=${item.id}>
                    <i class="fas fa-times"></i>
                    </div>
                    </div>
                    
                    <div class="price_calculate">
                      <button id="test" class="decrease" data-id=${item.id}>
                        <i class="fas fa-minus"></i>
                      </button>
                      <p class="item_total_count">${item.count}</p>
                      <button class="increase" data-id=${item.id}>
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="total_item_price price">Rs ${item.price.actual}</div>
                  </div>`;

                  const cartDOM = document.querySelector(".item_cart_body");
                  cartDOM.appendChild(div);

  }
  setAPP() {
    cart = Storage.getCart();
    this.setItemValues(cart);
    this.populate(cart);

  }

  populate(cart) {
    cart.forEach(item => this.addToCard(item));
  }

  cartLogic(){
      cardDetails.addEventListener("click", e=> {
        const target = e.target.parentElement;
        const targetElement = target.classList.contains("item_delete");
        
        if(!target) return;

        if(targetElement){
          const id = parseInt(target.dataset.id);
          this.removeItem(id);
          cardDetails.removeChild(target.parentElement.parentElement.parentElement);

        }else if (target.classList.contains("increase")){
          const id= parseInt(target.dataset.id, 10);
          let tempItem = cart.find(item => item.id === id);
          tempItem.count++;
          Storage.saveCart(cart);
          this.setItemValues(cart);
          target.previousElementSibling.innerText = tempItem.count;
        }else if (target.classList.contains("decrease")) {
          const id = parseInt(target.dataset.id, 10);
          let tempItem = cart.find(item => item.id === id);
          tempItem.count--;

          if (tempItem.count > 0) {
            Storage.saveCart(cart);
            this.setItemValues(cart);
            target.nextElementSibling.innerText = tempItem.count;
          }else {
            this.removeItem(id);
            cardDetails.removeChild(target.parentElement.parentElement.parentElement);
          }
        }
      });
    }

    removeItem(id) {
      cart = cart.filter(item => item.id !== id);
      this.setItemValues(cart);
      Storage.saveCart(cart);
  
      let button = this.singleButton(id);
      button.disabled = false;
      button.innerText = "ADD TO CART";
    }
  
    singleButton(id) {
      return button_all.find(button => parseInt(button.dataset.id) === id);
    }



}


class Storage {
  static saveProduct(obj) {
    localStorage.setItem("products", JSON.stringify(obj));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(item => item.id === parseInt(id));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

class Products {
  async getProducts() {
    try {
      const result = await fetch("db.json");
      const data = await result.json();
      const products = data.items;
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productsList = new Products();
  const ui = new UI();

  ui.setAPP();

  const productsObj = await productsList.getProducts();
  ui.displayProducts(productsObj);
  Storage.saveProduct(productsObj);
  ui.getButtons();
  ui.cartLogic();
});


