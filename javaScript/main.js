let title = document.getElementById("title");
let price = document.getElementById("price");
let taxes = document.getElementById("taxes");
let ads = document.getElementById("ads");
let discount = document.getElementById("discount");
let total = document.getElementById("total");
let count = document.getElementById("count");
let category = document.getElementById("category");
let submit = document.getElementById("submit");
let mood = "create";
let tmp;

//get Total
function getTotal() {
  if (price.value != "") {
    let result = +price.value + +taxes.value + +ads.value - +discount.value;
    total.innerHTML = result;
    total.style.backgroundColor = "#147cf3ff";
  } else {
    total.innerHTML = "";
    total.style.backgroundColor = "rgb(236, 161, 9)";
  }
}

// Create Product
let dataPro;
if (localStorage.productf != null) {
  dataPro = JSON.parse(localStorage.productf);
} else {
  dataPro = [];
}

submit.onclick = function () {
  let newPro = {
    title: title.value.toLowerCase(),
    price: price.value,
    taxes: taxes.value,
    ads: ads.value,
    discount: discount.value,
    total: total.innerHTML,
    count: count.value,
    category: category.value.toLowerCase(),
    // .toUpperCase()
    Date: new Date()
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // اجعلها false إذا كنت تريد نظام 24 ساعة
      })
      .replace(/(\d+)\/(\d+)\/(\d+),/, "$3/$2/$1"),
  };
  if (
    newPro.title != "" &&
    price.value != "" &&
    category.value != "" &&
    count.value < 100
  ) {
    if (mood === "create") {
      if (newPro.count > 1) {
        for (let i = 0; i < newPro.count; i++) {
          dataPro.push(newPro);
        }
      } else {
        dataPro.push(newPro);
      }
    } else {
      dataPro[tmp] = newPro;
      mood = "create";
      submit.innerHTML = "Create";
      count.style.display = "block";
    }
    clearData();
  }

  localStorage.setItem("productf", JSON.stringify(dataPro));
  console.log(dataPro);

  showData();
};

// Clear Input

function clearData() {
  title.value = "";
  price.value = "";
  taxes.value = "";
  ads.value = "";
  discount.value = "";
  total.innerHTML = "";
  count.value = "";
  category.value = "";
}
// Read
function showData() {
  getTotal();
  let table = "";
  for (let i = 0; i < dataPro.length; i++) {
    table += `
        <tr>
            <td>${i + 1}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <td>${dataPro[i].category}</td>
            <td><small style="color: #fff; font-size: 12px; display: black; margin-top: 5px;">
            🕒 ${dataPro[i].Date ? dataPro[i].Date : "UNKNOWN"}
            </small></td>
            <td><button id="update" onclick = "updateData(${i})">تعديل</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">حذف</button></td>
        </tr> `;
  }
  document.getElementById("tbody").innerHTML = table;

  let btnDelete = document.getElementById("deleteAll");
  if (dataPro.length > 0) {
    btnDelete.innerHTML = `
         <button onclick="exportToPDF()" style="background-color: #e91e63; margin-top: 5px;">
        تحميل السجلات PDF</button>
        <button onclick = "deleteAll()" style="margin-top: 10px;">حذف كل السجلات (${dataPro.length})</button>
       `;
  } else {
    btnDelete.innerHTML = " ";
  }
}
showData();

//////////////////////// convert To Pdf ////////////////////////////

// 7. ميزة حفظ البيانات بصيغة PDF
/**
 * دالة التصدير المحدثة لمكتبة html2pdf.js
 * تحسب إجمالي السعر الأساسي وإجمالي التكلفة النهائية
 */
function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        console.error("Library html2pdf not found");
        alert("عذراً، مكتبة PDF غير محملة");
        return;
    }

    // 1. إعداد التاريخ والوقت الحالي لعنوان التقرير
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // تنسيق الوقت (12 ساعة مع AM/PM)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; 

    const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes} ${ampm}`;
    const fileName = `Daily_Report_${year}-${month}-${day}.pdf`;

    // 2. حساب إجمالي المبالغ وبناء الصفوف
    let totalBasePrice = 0;
    let tableBodyHtml = "";

    dataPro.forEach((product, index) => {
        const price = Number(product.price) || 0;
        const rowTotal = Number(product.total) || price;
        totalBasePrice += price;

        // جلب التاريخ المخزن
        const regDate = product.date || product.Date || "N/A";

        tableBodyHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${product.title}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">${price.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${product.category}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #147cf3;">${rowTotal.toFixed(2)}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 10px; color: #555;">${regDate}</td>
            </tr>
        `;
    });

    // 3. إنشاء تصميم التقرير (نفس صيغة كود المخرجات)
    const element = document.createElement('div');
    element.innerHTML = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white;">
            <div style="text-align: center; border-bottom: 3px solid #147cf3; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #147cf3; margin: 0; text-transform: uppercase;">تقرير سجل المبيعات </h1>
                <p style="color: #666; margin: 5px 0; direction: ltr;">Generated on: ${formattedDateTime}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
                <thead>
                    <tr style="background-color: #333; color: white;">
                        <th style="padding: 12px; border: 1px solid #222; width: 40px;">#</th>
                        <th style="padding: 12px; border: 1px solid #222;">اسم المنتج</th>
                        <th style="padding: 12px; border: 1px solid #222;">السعر الأساسي</th>
                        <th style="padding: 12px; border: 1px solid #222;">الفئة</th>
                        <th style="padding: 12px; border: 1px solid #222;">التكلفة الإجمالية</th>
                        <th style="padding: 12px; border: 1px solid #222;">التاريخ/الوقت</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f1f1f1; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: left;">إجمالي السعر الأساسي:</td>
                        <td colspan="4" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #530303; font-size: 18px;">${totalBasePrice.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                <p>Eng.Al-ParatY_770049491</p>
            </div>
        </div>
    `;

    // 4. إعدادات التصدير
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 5. التنفيذ
    html2pdf().set(opt).from(element).save();
}
///////////////////////////////////////////////////////
// Delete

function deleteData(i) {
    if (confirm("هل تريد حذف السجل هذا؟")) {
        dataPro.splice(i, 1);
        localStorage.productf = JSON.stringify(dataPro);
        showData();
    }
}

// DeleteAll
function deleteAll() {
  if (confirm("هل تريد حذف كافة السجلات؟")) { 
  localStorage.clear();
  dataPro.splice(0);
  showData();
  }
}

// Update
function updateData(i) {
  title.value = dataPro[i].title;
  price.value = dataPro[i].price;
  taxes.value = dataPro[i].taxes;
  ads.value = dataPro[i].ads;
  discount.value = dataPro[i].discount;
  getTotal();
  count.style.display = "none";
  category.value = dataPro[i].category;
  submit.innerHTML = "Update";
  mood = "update";
  tmp = i;
  scroll({
    top: 0,
    behavior: "smooth",
  });
  // showSection('inputSection'); // إضافة هذا السطر هنا
  //   title.value = dataPro[i].title;
}

// Search
let searchMood = "Title";

function getSearchMood(id) {
  let search = document.getElementById("search");

  if (id == "searchTitle") {
    searchMood = "Title";
  } else {
    searchMood = "Category";
  }
  search.placeholder = "Search By " + searchMood;

  search.focus();
  search.value = "";
  showData();
  // console.log(searchMood);
}

function searchData(value) {
  let table = "";
  for (let i = 0; i < dataPro.length; i++) {
    if (searchMood == "Title") {
      if (dataPro[i].title.includes(value.toLowerCase())) {
        table += `
          <tr>
          <td>${i}</td> 
          <td>${dataPro[i].title}</td>
          <td>${dataPro[i].price}</td>
          <td>${dataPro[i].taxes}</td>
          <td>${dataPro[i].ads}</td>
          <td>${dataPro[i].discount}</td>
          <td>${dataPro[i].total}</td>
          <td>${dataPro[i].category}</td>
            <td><button id="update" onclick = "updateData(${i})">تعديل</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">حذف</button></td>
            </tr> `;
      }
    } else {
      if (dataPro[i].category.includes(value.toLowerCase())) {
        table += `
            <tr>
            <td>${i}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <th>${dataPro[i].category}</td>
            <td><button id="update" onclick = "updateData(${i})">update</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">delete</button></td>
            </tr> `;
      }
    }
  }
  document.getElementById("tbody").innerHTML = table;
}
////////////////Input AND OUTPUT///////////

// وظيفة التبديل بين القائمة والصفحة الفارغة
function showSection(sectionId) {
  if (sectionId === "inputSection") {
    document.getElementById("inputSection").style.display = "block";
    document.getElementById("outputSection").style.display = "none";

    // ألوان الأزرار للتوضيح
    document.getElementById("navInputBtn").style.background = "#147cf3";
    document.getElementById("navOutputBtn").style.background = "#333";
  } else {
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("outputSection").style.display = "block";

    document.getElementById("navInputBtn").style.background = "#333";
    document.getElementById("navOutputBtn").style.background = "#147cf3";
  }
}

// تشغيل وضع Input تلقائياً عند فتح الصفحة
window.onload = function () {
  showSection("inputSection");
};

/////////////////////////////////////////////////////////////////
/////////////////////////////OUTPUT/////////////////////////////
///////////////////////////////////////////////////////////////
// تحديد العناصر من HTML
// --- العناصر الخاصة بقسم المخرجات الجديد (OUT) ---
let outTitle = document.getElementById("name");
let outAmount = document.getElementById("amunt"); // تأكد من مطابقة id في HTML
let outDetail = document.getElementById("detail");
let outSubmit = document.getElementById("submit out");
let outRecords = document.getElementById("records");
let outremoveAllBtn = document.getElementById("removeAll");

let outMood = "create";
let outTmp;

// 1. وظيفة الحفظ (Create Product)
let outDataPro;
if (localStorage.outProduct != null) {
  outDataPro = JSON.parse(localStorage.outProduct);
} else {
  outDataPro = [];
}

outSubmit.onclick = function () {
  let newOutPro = {
  name: outTitle.value,
  amount: outAmount.value,
  detail: outDetail.value,
  Date: new Date().toLocaleString("en-GB", { 
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true // اجعلها false إذا كنت تريد نظام 24 ساعة
}).replace(/(\d+)\/(\d+)\/(\d+),/, "$3/$2/$1")
};


  if (outTitle.value != "" && outAmount.value != "") {
    if (outMood === "create") {
      outDataPro.push(newOutPro);
    } else {
      outDataPro[outTmp] = newOutPro;
      outMood = "create";
      outSubmit.innerHTML = "SAVE";
    }
    clearOutData();
  }

  // حفظ في localStorage
  localStorage.setItem("outProduct", JSON.stringify(outDataPro));
  showOutData();
};

// 2. مسح الحقول بعد الحفظ
function clearOutData() {
  outTitle.value = "";
  outAmount.value = "";
  outDetail.value = "";
}

// 3. عرض البيانات في الجدول
function showOutData() {
  let table = "";
  for (let i = 0; i < outDataPro.length; i++) {
    table += `
        <tr>
            <td>${i + 1}</td>
            <td>${outDataPro[i].name}</td>
            <td>${outDataPro[i].amount}</td>
            <td>${outDataPro[i].detail}</td>
            <td>${
              outDataPro[i].amount
            }</td> 
            <td><small style="color: #fff; font-size: 12px; display: black; margin-top: 5px;">
            🕒 ${outDataPro[i].Date ? outDataPro[i].Date : "UNKNOWN"}

            </small></td>
            <td><button onclick="updateOutData(${i})" id="update">تعديل</button></td>
            <td><button onclick="deleteOutData(${i})" id="delete">حذف</button></td>
        </tr>
        `;
  }
  outRecords.innerHTML = table;

  // إظهار زر حذف الكل إذا وجد بيانات
  if (outDataPro.length > 0) {
    outremoveAllBtn.innerHTML = `
    <button onclick="exportOutToPDF()" style="background-color: #d09228; margin-top: 10px;">تحميل السجلات PDF</button>
    <button onclick="removeAllOut()" style="background-color: #e76161ff; margin-top: 10px;">حذف كل السجلات (${outDataPro.length})</button>
        `;
  } else {
    outremoveAllBtn.innerHTML = "";
  }
}

// 4. حذف عنصر واحد
function deleteOutData(i) {
    if (confirm("هل تريد حذف السجل هذا؟")) {
        outDataPro.splice(i, 1);
        localStorage.outProduct = JSON.stringify(outDataPro);
        showOutData();
    }
}

// 5. حذف الكل
function removeAllOut() {
  if (confirm("هل تريد حذف كافة السجلات؟")){
  localStorage.removeItem("outProduct");
  outDataPro.splice(0);
  showOutData();
}
}

// 6. التحديث (Update)
function updateOutData(i) {
  outTitle.value = outDataPro[i].name;
  outAmount.value = outDataPro[i].amount;
  outDetail.value = outDataPro[i].detail;
  outSubmit.innerHTML = "UPDATE";
  outMood = "update";
  outTmp = i;
  scroll({
    top: 0,
    behavior: "smooth",
  });
}

// تشغيل عرض البيانات عند تحميل الصفحة
showOutData();

function exportOutToPDF() {
    if (typeof html2pdf === 'undefined') {
        console.error("Library html2pdf not found");
        alert("عذراً، مكتبة PDF غير محملة");
        return;
    }

    // 1. إعداد التاريخ والوقت الحالي لعنوان التقرير
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    

  // تنسيق الوقت (12 ساعة مع AM/PM)
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // تحويل الساعة 0 إلى 12

    
    const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes} ${ampm}`;
    const fileName = `Out_Report_${year}-${month}-${day}.pdf`;

    // 2. حساب إجمالي المبالغ وبناء الصفوف
    let totalExpenses = 0; 
    let tableBodyHtml = "";

    outDataPro.forEach((item, index) => {
        const amountValue = Number(item.amount) || 0;
        totalExpenses += amountValue;

        // جلب التاريخ المخزن في العنصر (نفس المنطق المستخدم في جدول العرض)
        const itemDate = item.Date || "UNKNOWN";

      //   const regDate = product.date
      // ? product.date
      // : product.Date
      // ? product.Date
      // : "N/A";

        tableBodyHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;">${amountValue.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 11px;">${item.detail || "---"}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 10px; color: #555;">${itemDate}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${amountValue.toFixed(2)}</td>
            </tr>
        `;
    });

    // 3. إنشاء تصميم التقرير
    const element = document.createElement('div');
    element.innerHTML = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white;">
            <div style="text-align: center; border-bottom: 3px solid #f51d1d; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #f51d1d; margin: 0; text-transform: uppercase;">تقرير سجل المخرجات (OUT)</h1>
                <p style="color: #666; margin: 5px 0; direction: ltr;">Generated on: ${formattedDateTime}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
                <thead>
                    <tr style="background-color: #333; color: white;">
                        <th style="padding: 12px; border: 1px solid #222; width: 40px;">#</th>
                        <th style="padding: 12px; border: 1px solid #222;">الاسم</th>
                        <th style="padding: 12px; border: 1px solid #222;">المبلغ</th>
                        <th style="padding: 12px; border: 1px solid #222;">التفاصيل</th>
                        <th style="padding: 12px; border: 1px solid #222;">التاريخ/الوقت</th>
                        <th style="padding: 12px; border: 1px solid #222;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f1f1f1; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: left;">إجمالي المبلغ الكلي:</td>
                        <td colspan="4" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #f51d1d; font-size: 18px;">${totalExpenses.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                <p>Eng.Al-ParatY_770049491</p>
            </div>
        </div>
    `;

    // 4. إعدادات التصدير
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

/***********************************************************************************************************
 * ************************************************ Debts **************************************************
 * ******************************************************************************************************* */
// --- الجزء الخاص بإدارة الأقسام (Show/Hide) ---
// 1. تعريف مصفوفة البيانات (تحميل من المتصفح أو إنشاء مصفوفة فارغة)
let debtors = JSON.parse(localStorage.getItem('debtors_data')) || [];
let currentDebtorIndex = null;

// 2. دالة عرض قائمة المديونين في الجدول الرئيسي
function renderDebtors() {
    const tbody = document.getElementById("debtorsTableBody");
    tbody.innerHTML = "";
    
    debtors.forEach((debtor, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${debtor.name}</td>
                <td>${debtor.phone}</td>
                <td>
                    <button class="btn-view" onclick="openStatement(${index})" style="background: #3498db; color: white; padding: 20px 10px; border-radius: 35px; border: none; cursor: pointer;">فتح الكشف</button>
                    <button onclick="deleteDebtor(${index})" style="background: #e74c3c; color: white; padding: 5px 10px; border-radius: 20px; border: none; cursor: pointer; margin-right: 5px;">حذف</button>
                </td>
            </tr>
        `;
    });
    // حفظ البيانات في الذاكرة المحلية عند كل تحديث
    localStorage.setItem('debtors_data', JSON.stringify(debtors));
}

// 3. دالة إضافة مديون جديد
function addDebtor() {
    const nameInput = document.getElementById("debtorName");
    const phoneInput = document.getElementById("debtorPhone");

    if (nameInput.value.trim() !== "" && phoneInput.value.trim() !== "") {
        debtors.push({
            name: nameInput.value,
            phone: phoneInput.value,
            entries: []
        });
        renderDebtors();
        nameInput.value = "";
        phoneInput.value = "";
    } else {
        alert("الرجاء إدخال الاسم ورقم الجوال");
    }
}

// 4. دالة فتح كشف الحساب (النافذة المنبثقة)
function openStatement(index) {
    currentDebtorIndex = index;
    const debtor = debtors[index];
    document.getElementById("modalTitle").innerText = `كشف حساب: ${debtor.name}`;
    document.getElementById("debtDate").value = new Date().toISOString().split('T')[0];
    renderEntries();
    document.getElementById("statementModal").style.display = "block";
}

// 5. تعديل دالة إضافة العملية
function addEntry() {
    const descInput = document.getElementById("debtDesc");
    const amountInput = document.getElementById("debtAmount");
    const typeInput = document.getElementById("debtType");
    const dateInput = document.getElementById("debtDate");

    // جلب الوقت الحالي بتنسيق (ساعة:دقيقة)
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });

    if (descInput.value && amountInput.value) {
        debtors[currentDebtorIndex].entries.push({
            desc: descInput.value,
            amount: parseFloat(amountInput.value),
            type: typeInput.value,
            date: dateInput.value,
            time: timeString // إضافة الوقت هنا
        });
        
        renderEntries();
        renderDebtors();
        
        descInput.value = "";
        amountInput.value = "";
        dateInput.value = new Date().toISOString().split('T')[0]; 
    } else {
        alert("الرجاء إدخال الوصف والمبلغ");
    }
}

// 6. تعديل دالة عرض العمليات وحساب الإجمالي الصافي
function renderEntries() {
    const entriesBody = document.getElementById("entriesBody");
    const totalDisplay = document.getElementById("totalAmount");
    entriesBody.innerHTML = "";
    let netTotal = 0;

    const entries = debtors[currentDebtorIndex].entries;
    entries.forEach((entry, entryIndex) => {
        if (entry.type === "عليه") { netTotal += entry.amount; } 
        else { netTotal -= entry.amount; }

        const typeIcon = entry.type === "عليه" ? "🔺" : "🟢";
        const typeColor = entry.type === "عليه" ? "#e74c3c" : "#2ecc71";

        entriesBody.innerHTML += `
            <tr>
                <td>${entry.desc}</td>
                <td style="color: ${typeColor}; font-weight: bold;">
                    ${typeIcon} ${entry.amount}
                </td>
                <td>
                    <div style="font-size: 13px;">${entry.date}</div>
                    <div style="font-size: 11px; color: #aaa;">${entry.time || ''}</div>
                </td>
                <td>
                    <button onclick="deleteEntry(${entryIndex})" style="background:none; border:none; cursor:pointer;">❌</button>
                </td>
            </tr>
        `;
    });

    totalDisplay.innerText = netTotal;
}
// 7. دالة حذف مديون (اختيارية لكنها مهمة)
function deleteDebtor(index) {
    if (confirm("هل أنت متأكد من حذف هذا المديون نهائياً؟")) {
        debtors.splice(index, 1);
        renderDebtors();
    }
}

// 8. دالة إغلاق النافذة المنبثقة
function closeModal() {
    document.getElementById("statementModal").style.display = "none";

}

// 9. دالة التنقل بين الأقسام (Show Section)
function showSection(sectionId) {
    // قائمة بجميع الأقسام الرئيسية في مشروعك
    const sections = ['inputSection', 'outputSection', 'invoicesSection' , 'debtsSection'];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none'; // إخفاء الكل
    });

    // إظهار القسم المختار
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }

    // تحديث البيانات الخاصة بكل قسم عند فتحه
    if (sectionId === 'invoicesSection') {
        renderInvoices();
        updateNextInvDisplay();
    } else if (sectionId === 'debtsSection') {
        renderDebtors();
    } else if (sectionId === 'inputSection') {
        showData(); // جدول المنتجات
    } else if (sectionId === 'outputSection') {
        showOutData(); // جدول المخرجات
    }
}

// تحميل البيانات عند تشغيل الصفحة لأول مرة
renderDebtors();

// 10. حذف السجل من كشف الحساب
function deleteEntry(entryIndex) {
    if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
        // حذف السجل المحدد من مصفوفة العمليات الخاصة بهذا المديون
        debtors[currentDebtorIndex].entries.splice(entryIndex, 1);
        
        // تحديث العرض والحفظ
        renderEntries();
        renderDebtors();
    }
}

// 11. تنزيل pdf
function exportDebtorToPDF() {
    if (typeof html2pdf === 'undefined') {
        alert("عذراً، مكتبة PDF غير محملة");
        return;
    }

    if (currentDebtorIndex === null) return;

    const debtor = debtors[currentDebtorIndex];
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    
    const fileName = `${debtor.name}_كشف_حساب_${formattedDate}.pdf`;

    // 1. بناء صفوف الجدول وحساب الإجمالي الصافي
    let totalAmount = 0; 
    let tableBodyHtml = "";

    debtor.entries.forEach((item, index) => {
        const amount = Number(item.amount) || 0;

        // الحساب: إذا كان "عليه" نجمع، وإذا كان "له" نطرح
        if (item.type === 'عليه') {
            totalAmount += amount;
        } else {
            totalAmount -= amount;
        }

        tableBodyHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.desc}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: ${item.type === 'عليه' ? '#d32f2f' : '#2e7d32'};">
                    ${item.type === 'عليه' ? '🔺' : '🟢'} ${amount.toFixed(2)}
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                    <div style="font-size: 10px;">${item.date}</div>
                    <div style="font-size: 9px; color: #777;">${item.time || ''}</div>
                </td>
            </tr>
        `;
    });

    // 2. إنشاء تصميم التقرير
    const element = document.createElement('div');
    element.innerHTML = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white;">
            <div style="text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #3498db; margin: 0;">كشف حساب مديونية</h1>
                <h3 style="margin: 10px 0;"> ${debtor.name}</h3>
                <p style="color: #666; margin: 5px 0;"> ${debtor.phone}</p>
                <p style="color: #888; margin: 5px 0; font-size: 12px;">تاريخ التقرير${formattedDate}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
                <thead>
                    <tr style="background-color: #34495e; color: white;">
                        <th style="padding: 12px; border: 1px solid #222; width: 40px;">#</th>
                        <th style="padding: 12px; border: 1px solid #222;">الوصف</th>
                        <th style="padding: 12px; border: 1px solid #222;">المبلغ</th>
                        <th style="padding: 12px; border: 1px solid #222;">التاريخ والوقت</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f1f1f1; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: left;">إجمالي المديونية المتبقية</td>
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: ${totalAmount >= 0 ? '#d32f2f' : '#2e7d32'}; font-size: 18px;">
                            ${totalAmount.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                <p>Eng.Al-ParatY_770049491</p>
            </div>
        </div>
    `;

    // 3. إعدادات التصدير
    const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// الفواتير/************
// ********************* */


let invoices = JSON.parse(localStorage.getItem('invoices_data')) || [];
let invoiceCounter = parseInt(localStorage.getItem('invoice_counter')) || 1001;

function updateNextInvDisplay() {
    const display = document.getElementById("nextInvoiceNum");
    if (display) {
        display.innerText = "#" + invoiceCounter;
    }
}

function addInvoice() {
    const storeInput = document.getElementById("invStoreName"); // جديد
    const nameInput = document.getElementById("invCustomerName");
    const amountInput = document.getElementById("invAmount");
    const notesInput = document.getElementById("invNotes");

    if (nameInput.value.trim() !== "" && amountInput.value !== "") {
        const newInvoice = {
            id: invoiceCounter,
            storeName: storeInput.value || "إسم المتجر", // حفظ اسم المتجر
            customer: nameInput.value,
            amount: parseFloat(amountInput.value).toFixed(2),
            notes: notesInput.value,
            date: new Date().toLocaleDateString('en-GB', {
                year: "numeric",
                day: "numeric",
                month: "numeric"
            }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        invoices.push(newInvoice);
        invoiceCounter++;
        localStorage.setItem('invoice_counter', invoiceCounter);
        localStorage.setItem('invoices_data', JSON.stringify(invoices));
        
        // تفريغ الحقول بعد الحفظ
        nameInput.value = "";
        amountInput.value = "";
        notesInput.value = "";
        // ملاحظة: تركت storeInput بدون تفريغ إذا أردت استخدامه للفاتورة التالية بسرعة
        
        renderInvoices();
        updateNextInvDisplay();
    } else {
        alert("يرجى إدخال اسم العميل والمبلغ");
    }
}

function renderInvoices() {
    const tbody = document.getElementById("invoicesTableBody");
    const section = document.getElementById('invoicesSection');
    const searchTerm = document.getElementById("invoiceSearchInput") ? document.getElementById("invoiceSearchInput").value.toLowerCase() : "";
    
    if (!tbody || !section || section.style.display === 'none') return;

    tbody.innerHTML = "";

    // فلترة الفواتير بناءً على اسم العميل أو رقم الفاتورة
    const filteredInvoices = invoices.filter(inv => {
        return inv.customer.toLowerCase().includes(searchTerm) || 
               inv.id.toString().includes(searchTerm);
    });

    if (filteredInvoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;">لا توجد نتائج مطابقة للبحث</td></tr>`;
        return;
    }

    filteredInvoices.forEach((inv, index) => {
        // ملاحظة: نستخدم index الأصلي من المصفوفة الأساسية للحذف والطباعة
        const originalIndex = invoices.findIndex(i => i.id === inv.id);

        tbody.innerHTML += `
            <tr>
                <td style="color: #3498db; font-weight: bold;">#${inv.id}</td>
                <td>
                    <div>${inv.customer}</div>
                    <small style="color:#777; font-size:10px;">متجر: ${inv.storeName}</small>
                </td>
                <td style="color: #2ecc71; font-weight: bold;">${inv.amount}</td>
                <td>
                    <div style="font-size:11px;">${inv.date}</div>
                    <div style="font-size:9px; color:#aaa;">${inv.time}</div>
                </td>
                <td>
                    <button onclick="printInvoicePDF(${originalIndex})" style="background:#3498db; color:white; border-radius:4px; padding:5px; border:none; cursor:pointer;">PDF 📥</button>
                    <button onclick="viewInvoiceNotes(${originalIndex})" style="background:#f1c40f; color:black; border-radius:4px; padding:5px; border:none; cursor:pointer;">📝</button>
                    <button onclick="deleteInvoice(${originalIndex})" style="background:#e74c3c; color:white; border-radius:4px; padding:5px; border:none; cursor:pointer;">حذف</button>
                </td>
            </tr>
        `;
    });
}

function printInvoicePDF(index) {
    const inv = invoices[index];
    if (!inv) return;

    const cleanName = inv.customer.replace(/[<>:"/\\|?*]/g, '');
    const cleanDate = inv.date.replace(/\//g, '-');
    const fileName = `فاتورة_${cleanName}_${cleanDate}.pdf`;

    const element = document.createElement('div');

    element.innerHTML = `
    <div style="width:148mm; min-height:210mm; padding:5mm; box-sizing:border-box; background:#fff;">
        <div dir="rtl" style="width:100%; font-family:'Segoe UI', Arial, sans-serif; background:#fff; border:1px solid #d1d1d1; border-radius:8px; overflow:hidden;">

            <div style="background:linear-gradient(135deg,#1a2a6c,#b21f1f,#fdbb2d);height:8px;"></div>

            <div style="padding:20px;display:flex;justify-content:space-between;align-items:flex-start;background:#fafafa;">
                <div>
                    <h1 style="margin:0;color:#1a2a6c;font-size:22px;">فاتورة مبيعات</h1>
                    <p style="margin:5px 0;font-size:12px;color:#555;">الرقم المرجعي <b style="color:#b21f1f;">#${inv.id}</b></p>
                </div>
                <div style="text-align:left;">
                    <div style="font-weight:bold;font-size:16px;color:#333;">${inv.storeName || "إسم المتجر"}</div>
                    <div style="font-size:11px;color:#777;margin-top:3px;">${inv.date} | ${inv.time}</div>
                </div>
            </div>

            <div style="padding:0 20px;">
                <div style="background:#fff;border:1px solid #eee;border-radius:6px;padding:12px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="display:block;font-size:10px;color:#aaa;">العميـــل</span>
                        <span style="font-size:15px;font-weight:bold;color:#333;">${inv.customer}</span>
                    </div>
                    <div style="text-align:left;">
                        <span style="display:block;font-size:10px;color:#aaa;">حالة السداد</span>
                        <span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;">تم الدفع</span>
                    </div>
                </div>
            </div>

            <div style="padding:0 20px;">
                <table style="width:100%;border-collapse:collapse;">
                    <tbody>
                        <tr>
                            <td style="padding:12px;font-size:13px;border-bottom:1px solid #f1f1f1;">
                                <b>خدمات عامة / توريد بضائع</b>
                                <div style="font-size:11px; color:#888; margin-top:4px;">حسب الطلب المتفق عليه</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style="margin-top:15px; background:#1a2a6c; color:#fff; display:flex; flex-wrap:wrap; min-height:80px; font-family: Tahoma, Arial, sans-serif; direction: rtl;">
    <div style="flex: 1; min-width: 65%; padding: 15px 20px; border-left: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column;">
       <div style="direction: rtl; display:flex; align-items:center; gap:5px;">
            <span>📝</span>
            <span>ملاحظات</span>
        </div>


        <div style="
            font-size: 11.5px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-break: break-word;
            text-align: right; /* محاذاة النص إلى اليمين للغة العربية */
            color: rgba(255, 255, 255, 0.95);
            background: rgba(255, 255, 255, 0.03);
            padding: 5px 0;
            direction: rtl; /* التأكيد على اتجاه النص من اليمين إلى اليسار */
        ">
            ${inv.notes || "لا توجد ملاحظات إضافية مسجلة لهذه العملية."}
        </div>
    </div>

    <div style="width:120px; padding:15px 20px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(255,255,255,0.05); font-family: Tahoma, Arial, sans-serif; direction: rtl;">
        <span style="font-size:11px; opacity:0.8; margin-bottom:5px;">الإجمالي</span>
        <div style="font-size:20px; font-weight:bold; color:#fdbb2d;">
            ${inv.amount}
        </div>
    </div>
</div>


                <div style="width:120px; padding:15px 20px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(255,255,255,0.05);">
                    <span style="font-size:11px; opacity:0.8; margin-bottom:5px;">الإجمالي</span>
                    <div style="font-size:20px; font-weight:bold; color:#fdbb2d;">
                        ${inv.amount}
                    </div>
                </div>
            </div>

            <div style="padding:15px; text-align:center; font-size:9px; color:#aaa; background:#fff;">
                شكراً لتعاملكم مع <b>${inv.storeName || "متجرنا"}</b> —Eng.Ahmed_AlParatY_770049491
            </div>

        </div>
    </div>
    `;

    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { 
            unit: 'mm',
            format: [148, 210],
            orientation: 'portrait'
        }
    };

    html2pdf().set(opt).from(element).save();
}

function deleteInvoice(index) {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
        invoices.splice(index, 1);
        localStorage.setItem('invoices_data', JSON.stringify(invoices));
        renderInvoices(); // سيعيد العرض مع الحفاظ على نص البحث
    }
}