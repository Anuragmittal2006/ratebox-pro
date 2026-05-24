const searchInput = document.getElementById("search");
const results = document.getElementById("results");

const supplierTabs = document.getElementById("supplierTabs");

const normalModeBtn = document.getElementById("normalMode");
const compareModeBtn = document.getElementById("compareMode");

const compareSelectors = document.getElementById("compareSelectors");

const compareA = document.getElementById("compareA");
const compareB = document.getElementById("compareB");

const discountInput =
document.getElementById(
  "discountInput"
);

let data = {};
let suppliers = [];

let activeSupplier = "";
let compareMode = false;
function normalize(str){

  return (str || "")
    .toString()
    .toLowerCase()

    // remove decimal points
    .replace(/\./g,"")

    // remove separators
    .replace(/[-/ ]/g,"")

    // remove tube/tubeless noise
    .replace(/\btt\b/g,"")
    .replace(/\btl\b/g,"")

    // remove weird chars
    .replace(/[^a-z0-9]/g,"");

}

fetch("./data/suppliers.json")
.then(r=>r.json())
.then(d=>{

  data = d.suppliers;

  suppliers = Object.keys(data);

  activeSupplier = suppliers[0];

  createSupplierTabs();

  populateCompareSelects();

});

function createSupplierTabs(){

  supplierTabs.innerHTML = "";

  suppliers.forEach(name=>{

    const btn = document.createElement("div");

    btn.className = "supplier-btn";

    if(name === activeSupplier){
      btn.classList.add("active");
    }

    btn.innerText = data[name].name;

    btn.onclick = ()=>{

      activeSupplier = name;

      document
        .querySelectorAll(".supplier-btn")
        .forEach(x=>x.classList.remove("active"));

      btn.classList.add("active");

      render();
    };

    supplierTabs.appendChild(btn);

  });

}

function populateCompareSelects(){

  suppliers.forEach(s=>{

    const a = document.createElement("option");
    const b = document.createElement("option");

    a.value = s;
    b.value = s;

    a.innerText = data[s].name;
    b.innerText = data[s].name;

    compareA.appendChild(a);
    compareB.appendChild(b);

  });

}

normalModeBtn.onclick = ()=>{

  compareMode = false;

  normalModeBtn.classList.add("active");
  compareModeBtn.classList.remove("active");

  compareSelectors.classList.add("hidden");

  render();

};

compareModeBtn.onclick = ()=>{

  compareMode = true;

  compareModeBtn.classList.add("active");
  normalModeBtn.classList.remove("active");

  compareSelectors.classList.remove("hidden");

  render();

};

searchInput.addEventListener("input",render);

compareA.addEventListener("change",render);
compareB.addEventListener("change",render);

discountInput.addEventListener(
  "input",
  render
);

function render(){

  const query = normalize(searchInput.value);

  results.innerHTML = "";

  if(!query) return;

  if(compareMode){

    renderCompare(query);

  }else{

    renderNormal(query);

  }

}

function renderNormal(query){

  const list = data[activeSupplier].items;

  const filtered = list.filter(x=>
    x.searchKey.includes(query)
  );

  const cheapest = Math.min(
    ...filtered.map(x=>x.invoice)
  );
const discount =
Number(
  discountInput.value
) || 0;
  filtered.forEach(item=>{

    const card = document.createElement("div");

    card.className = "card";

    if(item.invoice === cheapest){
      card.classList.add("cheapest");
    }

   const discountedPrice = Math.round(

  item.invoice -

  (item.invoice * discount / 100)

);

card.innerHTML = `

  <div class="tyre-name">
    ${item.size}
  </div>

  <div class="price">
    ₹${item.invoice}
  </div>

  ${
    discount > 0
    ?

    `
    <div class="discounted-price">

      Discounted:
      ₹${discountedPrice}

    </div>
    `

    :

    ""

  }

`;

    results.appendChild(card);

  });

}

function renderCompare(query){

  const supplier1 = data[compareA.value];
  const supplier2 = data[compareB.value];

  const map1 = {};
  const map2 = {};
  const discount =
Number(
  discountInput.value
) || 0;

  supplier1.items.forEach(x=>{

    if(x.searchKey.includes(query)){
      map1[x.searchKey] = x;
    }

  });

  supplier2.items.forEach(x=>{

    if(x.searchKey.includes(query)){
      map2[x.searchKey] = x;
    }

  });

  const keys = new Set([
    ...Object.keys(map1),
    ...Object.keys(map2)
  ]);

  keys.forEach(key=>{

    const a = map1[key];
    const b = map2[key];

    const card = document.createElement("div");

    card.className = "card compare-card";

   const discountA = a
? Math.round(
    a.invoice -
    (a.invoice * discount / 100)
  )
: null;

const discountB = b
? Math.round(
    b.invoice -
    (b.invoice * discount / 100)
  )
: null;

card.innerHTML = `

  <div class="compare-tyre">
    ${a?.size || b?.size}
  </div>

  <div class="compare-price">

    <div class="supplier-label">
      ${supplier1.name}
    </div>

    <div class="supplier-rate">
      ₹${a?.invoice || "-"}
    </div>

    ${
      discount > 0 && a
      ?

      `
      <div class="compare-discount">
        ₹${discountA}
      </div>
      `

      :

      ""
    }

  </div>

  <div class="compare-price">

    <div class="supplier-label">
      ${supplier2.name}
    </div>

    <div class="supplier-rate">
      ₹${b?.invoice || "-"}
    </div>

    ${
      discount > 0 && b
      ?

      `
      <div class="compare-discount">
        ₹${discountB}
      </div>
      `

      :

      ""
    }

  </div>

`;

    results.appendChild(card);

  });

}