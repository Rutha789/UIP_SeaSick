//filter menu
const mainnav = document.querySelector(".nav");

const displayDOM = document.querySelector(".display-container");

mainnav.addEventListener("click", event => {
  if (event.target.classList.contains("nav-filter")) {
    if (document.querySelector(".show") === null) {
      const additem = event.target;
      console.log(additem);
      additem.classList.add("show");
      const div = document.createElement("div");
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

//end of filter menu

// document.getElementById("Overly").addEventListener("click", function() {
//   document.getElementById("paydialog-id").style.display = "block";
//   document.getElementById("overlay-id").style.visibility = "visible";
//   console.log("josi");
// });

// document.getElementById("close-pay").addEventListener("click", function() {
//   document.getElementById("paydialog-id").style.display = "none";
//   document.getElementById("overlay-id").style.visibility = "hidden";
// });

document.getElementById("vip-user").addEventListener("click", function() {
  let display = document.getElementById("vipcontainer-id");
  if (display.style.visibility === "visible") {
    display.style.visibility = "hidden";
    document.getElementById("userid").value = "";
    document.getElementById("userpassid").value = "";
  } else {
    display.style.visibility = "visible";
  }
});

document.getElementById("vipclose-id").addEventListener("click", function() {
  let e = document.getElementById("vipcontainer-id");
  e.style.visibility = "hidden";
  document.getElementById("userid").value = "";
  document.getElementById("userpassid").value = "";
});
