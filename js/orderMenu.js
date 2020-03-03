window.onload = function() {
  initialPage();
};

function initialPage() {
  $("#orderBar").load("../html/orderBar.html");
  var mainnav = document.querySelector(".nav");
  var displayDOM = document.querySelector(".display-container");

  var h = document.getElementById("item-container").clientHeight / 3;
  var itemList;
  itemList = localStorage.item;
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  renderShopItem(h, itemList[0].itemId, itemList[0].quan);
  //adding filter menu  pop up on click

  mainnav.addEventListener("click", event => {
    if (event.target.classList.contains("nav-filter")) {
      if (document.querySelector(".show") === null) {
        var additem = event.target;
        console.log(additem);
        additem.classList.add("show");
        var div = document.createElement("div");
        div.id = "show-id";
        div.classList.add("show-filter");

        div.innerHTML =
          " <h3>Alcohol strength </h3>" +
          '<div><input type="range" list="tickmarks">' +
          '<datalist id="tickmarks">' +
          '<option value="0" label="0%"></option>' +
          '<option value="10"></option>' +
          '<option value="20"></option>' +
          '<option value="30"></option>' +
          '<option value="40"></option>' +
          '<option value="50" label="50%"></option>' +
          '<option value="60"></option>' +
          '<option value="70"></option>' +
          '<option value="80"></option>' +
          '<option value="90"></option>' +
          '<option value="100" label="100%"></option>' +
          "</datalist> <div>" +
          "<h3>Packaging Type</h3>" +
          '<div><label class="one"><input type="radio" id="radioglass" name="package" value="glass">Glass</lable> </div>' +
          '<div><label class="two"><input type="radio" id="radioflask" name="package" value="flask"><lable>Flask</lable></div>' +
          '<button type="submit" class="btn-submit">Submit</button>';
        displayDOM.appendChild(div);
      } else {
        var removediv = document.getElementById("show-id");
        removediv.parentNode.removeChild(removediv);
        var removeatt = document.getElementById("4");
        removeatt.classList.remove("show");
      }
    }
  });

  //end filter menu
}

function renderShopItem(h, itemId, quan = 1, pc = "40%") {
  //render shopitem regarding the size
  var shopItem = document.createElement("div");
  shopItem.className = "shopItem";
  shopItem.style =
    "height:" +
    h +
    "px;width:" +
    h +
    "px;display: inline-block;padding:1% 1% 1% 1%;background-color:dimgrey;";
  shopItem.draggable = true;
  shopItem.ondrag = true;
  if (itemId != undefined) {
    shopItem.id = itemId;
  }

  //create a infoicon for each shopItem
  var infoIcon = document.createElement("img");
  //   infoIcon.className = "infoIcon";
  //   infoIcon.style = "height:20%;width: 20%;top:0;margin: 2% 2% 2% 2%;";
  infoIcon.draggable = false;
  infoIcon.src = "../res/info_icon.png";
  shopItem.appendChild(infoIcon);

  //create a ecoIcon
  var ecoIcon = document.createElement("img");
  //   ecoIcon.className = "ecoIcon";
  //   ecoIcon.style = "height:20%;width: 20%;bottom:0;margin: 2% 2% 2% 2%;";
  ecoIcon.draggable = false;
  ecoIcon.src = "../res/eco_icon.png";
  shopItem.appendChild(ecoIcon);

  //create a pcent
  var pcent = document.createElement("p");
  pcent.className = "pcent";
  pcent.textContent = pc;
  pcent.style =
    "height:20%;width: 20%;margin: 2% 2% 2% 2%;color:white;font-weight: bold;";
  pcent.draggable = false;
  shopItem.appendChild(pcent);

  //create a drag and drop overlay
  var overlay = document.getElementById("overlay");
  shopItem.addEventListener("drag", function() {
    overlay.style = "display:inherit;";
  });
  shopItem.addEventListener("dragend", function() {
    overlay.style = "display:none;";
  });

  //append the item into the order item list
  document.getElementById("item-container").appendChild(shopItem);
}
