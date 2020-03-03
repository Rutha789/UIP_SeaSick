const people = ["josi", "yoni", "nor", "naiomi", "welid", "meron"];
const ulpeople = document.querySelector(".person");

let htmlli = ``;

people.forEach(person => {
  ulpeople.innerHTML += `<li style="color:purple">${person}</li>`;
});
